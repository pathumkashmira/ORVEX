import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ListTodo,
  BriefcaseBusiness,
  CalendarDays,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { getStudioOverview } from "@/lib/studio";

interface Metrics {
  activeProjects: number;
  teamMembers: number;
  pendingTasks: number;
  upcoming: number;
}

const EMPTY_METRICS: Metrics = {
  activeProjects: 0,
  teamMembers: 0,
  pendingTasks: 0,
  upcoming: 0,
};

function isClosedStatus(status: unknown) {
  return ["COMPLETED", "DONE", "ARCHIVED", "CANCELLED"].includes(String(status ?? "").toUpperCase());
}

function buildMetrics(data: Awaited<ReturnType<typeof getStudioOverview>>): Metrics {
  const now = Date.now();
  const upcoming = data.tasks.filter((task) => {
    if (isClosedStatus(task.status) || !task.deadline) return false;
    const time = new Date(task.deadline).getTime();
    return Number.isFinite(time) && time >= now;
  }).length;

  return {
    activeProjects: data.projects.filter((project) => !isClosedStatus(project.status)).length,
    teamMembers: data.team.length,
    pendingTasks: data.tasks.filter((task) => !isClosedStatus(task.status)).length,
    upcoming,
  };
}

export default function StudioOSDashboard() {
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      else setLoading(true);
      setError("");
      const overview = await getStudioOverview();
      setMetrics(buildMetrics(overview));
    } catch (err) {
      console.error("Studio dashboard load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load studio metrics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-10 md:px-10">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs tracking-[0.25em] text-white/30">ORVEX STUDIO</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Operating System</h1>
            <p className="mt-2 text-sm text-white/40">Internal studio operations and production control.</p>
          </div>
          <button type="button" onClick={() => void load(true)} disabled={loading || refreshing} className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/5 disabled:opacity-40">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="ACTIVE PROJECTS" value={metrics.activeProjects} icon={<BriefcaseBusiness size={17} />} loading={loading} />
          <MetricCard title="TEAM MEMBERS" value={metrics.teamMembers} icon={<Users size={17} />} loading={loading} />
          <MetricCard title="PENDING TASKS" value={metrics.pendingTasks} icon={<ListTodo size={17} />} loading={loading} />
          <MetricCard title="UPCOMING" value={metrics.upcoming} icon={<CalendarDays size={17} />} loading={loading} />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <QuickLink href="/studio-os/team" title="Team Management" description="Collaborators, roles, skills and status." />
          <QuickLink href="/studio-os/workload" title="Team Workload" description="Capacity, deadlines and workload risk." />
          <QuickLink href="/studio-os/availability" title="Availability" description="Manage weekly studio availability." />
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-white/30">PHASE 2</p>
              <h2 className="mt-2 text-xl font-medium">Team Operations</h2>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-400">ACTIVE</span>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">Manage ORVEX collaborators, availability, workload, skills and production capacity from one internal operating system.</p>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, loading }: { title: string; value: number; icon: React.ReactNode; loading: boolean }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between text-white/30">
        <span className="text-[10px] tracking-[0.18em]">{title}</span>
        {icon}
      </div>
      <p className="mt-6 text-3xl font-semibold">{loading ? "—" : String(value).padStart(2, "0")}</p>
    </div>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link to={href} className="group rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition hover:bg-white/[0.05]">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <ArrowUpRight size={16} className="text-white/30 transition group-hover:text-white" />
      </div>
      <p className="mt-3 text-xs leading-6 text-white/35">{description}</p>
    </Link>
  );
}
