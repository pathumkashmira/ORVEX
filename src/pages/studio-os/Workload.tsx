import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getTeamMembers } from "@/lib/studio";
import type { AvailabilityStatus, TeamMember } from "@/types/studio";

function availabilityClass(status: AvailabilityStatus) {
  return status === "AVAILABLE" ? "text-emerald-400" : status === "BUSY" ? "text-amber-400" : "text-red-400";
}

function riskFor(member: TeamMember) {
  if (member.workload_percentage >= 90 || member.availability_status === "UNAVAILABLE") return "HIGH";
  if (member.workload_percentage >= 75 || member.pending_tasks >= 5) return "MEDIUM";
  return "LOW";
}

export default function Workload() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setTeam(await getTeamMembers());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load workload.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const summary = useMemo(() => {
    const totalProjects = team.reduce((sum, member) => sum + member.active_projects, 0);
    const totalTasks = team.reduce((sum, member) => sum + member.pending_tasks, 0);
    const average = team.length ? Math.round(team.reduce((sum, member) => sum + member.workload_percentage, 0) / team.length) : 0;
    const highRisk = team.filter((member) => riskFor(member) === "HIGH").length;
    return { totalProjects, totalTasks, average, highRisk };
  }, [team]);

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs tracking-[0.25em] text-white/30">STUDIO OPERATING SYSTEM</p>
            <h1 className="mt-3 text-4xl font-semibold">Team Workload</h1>
            <p className="mt-2 text-sm text-white/40">Monitor live capacity, active work and deadline risk.</p>
          </div>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/60 hover:bg-white/5 disabled:opacity-40"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Refresh</button>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300">{error}</div>}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Summary label="TEAM" value={team.length} />
          <Summary label="ACTIVE PROJECTS" value={summary.totalProjects} />
          <Summary label="PENDING TASKS" value={summary.totalTasks} />
          <Summary label="HIGH RISK" value={summary.highRisk} />
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1.4fr_1fr] border-b border-white/10 px-6 py-4 text-[10px] tracking-[0.16em] text-white/30 md:grid"><span>COLLABORATOR</span><span>PROJECTS</span><span>TASKS</span><span>AVAILABILITY</span><span>WORKLOAD</span><span>RISK</span></div>
          {loading && <div className="px-6 py-20 text-center text-sm text-white/30">Loading workload...</div>}
          {!loading && team.map((member) => {
            const risk = riskFor(member);
            return <div key={member.id} className="grid gap-5 border-b border-white/5 px-6 py-6 md:grid-cols-[2fr_1fr_1fr_1fr_1.4fr_1fr] md:items-center">
              <div><p className="text-sm font-medium">{member.full_name}</p><p className="mt-1 text-[10px] tracking-wide text-white/30">{member.role.replaceAll("_", " ")}</p></div>
              <span className="text-sm text-white/60">{member.active_projects}</span>
              <span className="text-sm text-white/60">{member.pending_tasks}</span>
              <span className={`text-xs ${availabilityClass(member.availability_status)}`}>{member.availability_status}</span>
              <div><div className="mb-2 flex justify-between text-xs"><span className="text-white/30">Capacity</span><span>{member.workload_percentage}%</span></div><div className="h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-white" style={{ width: `${Math.min(member.workload_percentage, 100)}%` }} /></div></div>
              <span className={`text-xs ${risk === "HIGH" ? "text-red-400" : risk === "MEDIUM" ? "text-amber-400" : "text-emerald-400"}`}>{risk}</span>
            </div>;
          })}
          {!loading && team.length === 0 && <div className="px-6 py-20 text-center text-sm text-white/30">No team members found.</div>}
        </div>

        {!loading && team.length > 0 && <p className="mt-5 text-right text-xs text-white/30">Average workload: <span className="text-white/60">{summary.average}%</span></p>}
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"><p className="text-[10px] tracking-[0.18em] text-white/30">{label}</p><p className="mt-4 text-2xl font-semibold">{value}</p></div>;
}
