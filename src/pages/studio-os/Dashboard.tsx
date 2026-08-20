import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, CheckCircle2, FolderKanban, Users } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { getStudioDashboardData, type StudioProject, type StudioTask, type StudioNotification } from "@/lib/studio";

function statusLabel(value: string) {
  return value.replaceAll("_", " ").replaceAll("-", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StudioOSDashboard() {
  const { user } = useApp();
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [tasks, setTasks] = useState<StudioTask[]>([]);
  const [notifications, setNotifications] = useState<StudioNotification[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    let active = true;
    setLoading(true);
    setError("");

    getStudioDashboardData(user.id)
      .then((data) => {
        if (!active) return;
        setProjects(data.projects);
        setTasks(data.tasks);
        setNotifications(data.notifications);
        setTeamCount(data.teamCount);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Studio OS dashboard error:", err);
        setError("Unable to load Studio OS data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-[#050608] text-[#f5f7f8] flex items-center justify-center">Loading Studio OS...</div>;
  }

  return (
    <main className="min-h-screen bg-[#050608] text-[#f5f7f8] px-6 py-10 md:px-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-8">
          <div>
            <p className="text-[#ff5a00] text-xs tracking-[0.2em] font-semibold mb-3">ORVEX STUDIO OS</p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Operational Core</h1>
            <p className="text-[#8b949e] mt-3">Live workspace for projects, tasks, team capacity and studio activity.</p>
          </div>
          <Link to="/" className="text-xs tracking-[0.16em] text-[#8b949e] hover:text-[#ff5a00]">← BACK TO SITE</Link>
        </header>

        {error && <div className="mt-6 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">{error}</div>}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Active Projects", value: projects.length, icon: FolderKanban },
            { label: "Open Tasks", value: tasks.filter((task) => task.status !== "COMPLETED").length, icon: CheckCircle2 },
            { label: "Team Members", value: teamCount, icon: Users },
            { label: "Unread Alerts", value: notifications.filter((item) => !item.read_at).length, icon: Bell },
          ].map((card) => (
            <div key={card.label} className="border border-white/10 bg-[#0b0d10] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs tracking-[0.14em] text-[#7d8590] uppercase">{card.label}</p>
                <card.icon size={17} className="text-[#ff5a00]" />
              </div>
              <p className="text-3xl font-bold mt-5">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 mt-6">
          <div className="border border-white/10 bg-[#0b0d10]">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <p className="text-xs tracking-[0.14em] text-[#ff5a00] uppercase">Workspace</p>
                <h2 className="text-xl font-semibold mt-1">Projects</h2>
              </div>
              <span className="text-xs text-[#7d8590]">Supabase</span>
            </div>
            <div className="divide-y divide-white/5">
              {projects.length === 0 ? (
                <p className="p-5 text-sm text-[#7d8590]">No projects are available for your account yet.</p>
              ) : projects.map((project) => (
                <div key={project.id} className="p-5 flex items-center justify-between gap-5">
                  <div className="min-w-0">
                    <p className="text-xs text-[#7d8590]">{project.project_code}</p>
                    <p className="font-semibold mt-1 truncate">{project.name}</p>
                    <p className="text-xs text-[#7d8590] mt-1">{statusLabel(project.status)} · {statusLabel(project.priority)}</p>
                  </div>
                  <ArrowRight size={15} className="text-[#7d8590] shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-[#0b0d10]">
            <div className="p-5 border-b border-white/10">
              <p className="text-xs tracking-[0.14em] text-[#ff5a00] uppercase">Activity</p>
              <h2 className="text-xl font-semibold mt-1">Notifications</h2>
            </div>
            <div className="divide-y divide-white/5">
              {notifications.length === 0 ? (
                <p className="p-5 text-sm text-[#7d8590]">No notifications yet.</p>
              ) : notifications.map((item) => (
                <div key={item.id} className="p-5">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.body && <p className="text-xs text-[#7d8590] mt-1">{item.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 border border-white/10 bg-[#0b0d10]">
          <div className="p-5 border-b border-white/10">
            <p className="text-xs tracking-[0.14em] text-[#ff5a00] uppercase">Execution</p>
            <h2 className="text-xl font-semibold mt-1">Recent Tasks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {tasks.length === 0 ? (
              <p className="p-5 text-sm text-[#7d8590]">No tasks are available for your account yet.</p>
            ) : tasks.slice(0, 6).map((task) => (
              <div key={task.id} className="p-5 flex items-center justify-between gap-4 border-b border-white/5">
                <div className="min-w-0">
                  <p className="font-medium truncate">{task.title}</p>
                  <p className="text-xs text-[#7d8590] mt-1">{statusLabel(task.status)} · {statusLabel(task.priority)}</p>
                </div>
                <span className="text-[10px] tracking-[0.12em] text-[#7d8590] uppercase">TASK</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
