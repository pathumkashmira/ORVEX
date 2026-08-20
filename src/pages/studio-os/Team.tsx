import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Users, RefreshCw } from "lucide-react";
import { getTeamMembers, updateTeamMember } from "@/lib/studio";
import type { TeamMember, TeamStatus, AvailabilityStatus } from "@/types/studio";

const STATUS_OPTIONS: TeamStatus[] = ["APPLICANT", "SHORTLISTED", "TRIAL", "VERIFIED", "CORE", "LEAD", "SUSPENDED", "ARCHIVED"];
const AVAILABILITY_OPTIONS: AvailabilityStatus[] = ["AVAILABLE", "BUSY", "UNAVAILABLE"];

function statusClass(status: TeamStatus) {
  if (["CORE", "LEAD", "VERIFIED"].includes(status)) return "text-emerald-400 bg-emerald-400/10";
  if (["TRIAL", "SHORTLISTED"].includes(status)) return "text-amber-400 bg-amber-400/10";
  if (status === "SUSPENDED") return "text-red-400 bg-red-400/10";
  return "text-white/50 bg-white/5";
}

function availabilityClass(status: AvailabilityStatus) {
  return status === "AVAILABLE" ? "text-emerald-400" : status === "BUSY" ? "text-amber-400" : "text-red-400";
}

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | TeamStatus>("ALL");
  const [availability, setAvailability] = useState<"ALL" | AvailabilityStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setTeam(await getTeamMembers());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load team.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filteredTeam = useMemo(() => team.filter((member) => {
    const query = search.toLowerCase().trim();
    const matchesSearch = !query || member.full_name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query) || member.skills.some((skill) => skill.toLowerCase().includes(query));
    return matchesSearch && (status === "ALL" || member.team_status === status) && (availability === "ALL" || member.availability_status === availability);
  }), [team, search, status, availability]);

  const changeAvailability = async (member: TeamMember, next: AvailabilityStatus) => {
    try {
      await updateTeamMember(member.user_id ?? member.id, { availability_status: next });
      setTeam((current) => current.map((item) => item.id === member.id ? { ...item, availability_status: next } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update availability.");
    }
  };

  const changeStatus = async (member: TeamMember, next: TeamStatus) => {
    try {
      await updateTeamMember(member.user_id ?? member.id, { status: next });
      setTeam((current) => current.map((item) => item.id === member.id ? { ...item, team_status: next } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const totalProjects = team.reduce((sum, member) => sum + member.active_projects, 0);
  const totalTasks = team.reduce((sum, member) => sum + member.pending_tasks, 0);
  const averageWorkload = team.length ? Math.round(team.reduce((sum, member) => sum + member.workload_percentage, 0) / team.length) : 0;

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-10 md:px-10">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><p className="mb-3 text-xs tracking-[0.25em] text-white/40">STUDIO OPERATING SYSTEM</p><h1 className="text-4xl font-semibold tracking-tight">Team</h1><p className="mt-2 text-sm text-white/40">Live collaborators, availability and workload.</p></div>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/60 hover:bg-white/5 disabled:opacity-40"><RefreshCw size={15} className={loading ? "animate-spin" : ""} />Refresh</button>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300">{error}</div>}

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4"><Search size={17} className="text-white/30" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team..." className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-white/25" /></div>
          <select value={status} onChange={(e) => setStatus(e.target.value as "ALL" | TeamStatus)} className="rounded-xl border border-white/10 bg-[#101112] px-4 py-3 text-sm text-white/70 outline-none"><option value="ALL">All statuses</option>{STATUS_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <select value={availability} onChange={(e) => setAvailability(e.target.value as "ALL" | AvailabilityStatus)} className="rounded-xl border border-white/10 bg-[#101112] px-4 py-3 text-sm text-white/70 outline-none"><option value="ALL">All availability</option>{AVAILABILITY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="hidden grid-cols-[2fr_1.2fr_1fr_1.2fr_1fr] gap-4 border-b border-white/10 px-5 py-4 text-[10px] tracking-[0.18em] text-white/30 md:grid"><span>COLLABORATOR</span><span>ROLE</span><span>STATUS</span><span>AVAILABILITY</span><span>WORKLOAD</span></div>
          {loading && <div className="px-6 py-20 text-center text-sm text-white/30">Loading team...</div>}
          {!loading && filteredTeam.map((member) => (
            <div key={member.id} className="grid gap-4 border-b border-white/5 px-5 py-5 md:grid-cols-[2fr_1.2fr_1fr_1.2fr_1fr] md:items-center">
              <div className="flex items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium">{member.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div><div><p className="text-sm font-medium">{member.full_name}</p><p className="mt-1 text-xs text-white/35">{member.email}</p></div></div>
              <div className="text-sm text-white/55">{member.role.replaceAll("_", " ")}</div>
              <select value={member.team_status} onChange={(e) => void changeStatus(member, e.target.value as TeamStatus)} className={`w-fit rounded-full border-0 px-2.5 py-1 text-[10px] outline-none ${statusClass(member.team_status)}`}><option value={member.team_status}>{member.team_status}</option>{STATUS_OPTIONS.filter((x) => x !== member.team_status).map((x) => <option key={x} value={x}>{x}</option>)}</select>
              <select value={member.availability_status} onChange={(e) => void changeAvailability(member, e.target.value as AvailabilityStatus)} className={`w-fit bg-transparent text-xs outline-none ${availabilityClass(member.availability_status)}`}>{AVAILABILITY_OPTIONS.map((x) => <option key={x} value={x} className="bg-[#101112] text-white">{x}</option>)}</select>
              <div><div className="mb-2 flex items-center justify-between text-xs"><span className="text-white/40">{member.active_projects} projects</span><span>{member.workload_percentage}%</span></div><div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-white/70" style={{ width: `${Math.min(member.workload_percentage, 100)}%` }} /></div></div>
            </div>
          ))}
          {!loading && filteredTeam.length === 0 && <div className="px-6 py-20 text-center"><Users size={28} className="mx-auto mb-4 text-white/20" /><p className="text-sm text-white/50">No collaborators found.</p></div>}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="TEAM MEMBERS" value={team.length} icon={<Users size={16} />} /><Stat label="ACTIVE PROJECTS" value={totalProjects} /><Stat label="PENDING TASKS" value={totalTasks} /><Stat label="AVG WORKLOAD" value={`${averageWorkload}%`} />
        </div>

        <button type="button" disabled className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black opacity-40"><Plus size={16} />Add Collaborator — Admin setup</button>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"><div className="mb-5 flex items-center justify-between text-white/30"><span className="text-[10px] tracking-[0.18em]">{label}</span>{icon}</div><p className="text-2xl font-semibold">{value}</p></div>;
}
