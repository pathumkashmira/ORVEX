import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail, BriefcaseBusiness, Clock3, Star, UserRound, RefreshCw } from "lucide-react";
import { getTeamMemberById } from "@/lib/studio";
import type { TeamMember } from "@/types/studio";

export default function TeamMember() {
  const { id } = useParams();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      setMember(await getTeamMemberById(id));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load team member.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [id]);

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-[1300px] px-6 py-10 md:px-10">
        <Link to="/studio-os/team" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"><ArrowLeft size={16} />Back to Team</Link>
        {loading && <div className="py-24 text-center text-sm text-white/30">Loading collaborator...</div>}
        {error && !loading && <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300">{error}</div>}
        {!loading && !error && !member && <div className="py-24 text-center text-sm text-white/40">Collaborator not found.</div>}
        {!loading && member && (
          <>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-7">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white/10 text-2xl font-semibold">
                    {member.avatar_url ? <img src={member.avatar_url} alt="" className="h-full w-full object-cover" /> : member.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold">{member.full_name}</h1><span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-400">{member.team_status}</span></div>
                    <p className="mt-2 text-sm text-white/40">{member.role.replaceAll("_", " ")}</p>
                    <p className="mt-6 max-w-2xl text-sm leading-7 text-white/55">{member.bio || "No internal biography has been added yet."}</p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <span className="inline-flex items-center gap-2 text-xs text-white/40"><Mail size={14} />{member.email}</span>
                      <span className="inline-flex items-center gap-2 text-xs text-white/40"><Clock3 size={14} />{member.timezone || "Timezone not set"}</span>
                      <span className={`inline-flex items-center gap-2 text-xs ${member.availability_status === "AVAILABLE" ? "text-emerald-400" : member.availability_status === "BUSY" ? "text-amber-400" : "text-red-400"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{member.availability_status}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-7">
                <div className="flex items-center justify-between"><p className="text-[10px] tracking-[0.2em] text-white/30">WORKLOAD</p><button type="button" onClick={() => void load()} disabled={loading} className="text-white/30 hover:text-white"><RefreshCw size={15} /></button></div>
                <div className="mt-6"><div className="mb-3 flex justify-between text-sm"><span className="text-white/50">Current workload</span><span>{member.workload_percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-white" style={{ width: `${Math.min(member.workload_percentage, 100)}%` }} /></div></div>
                <div className="mt-8 grid grid-cols-3 gap-4"><Metric value={member.active_projects} label="PROJECTS" /><Metric value={member.pending_tasks} label="TASKS" /><Metric value={member.completed_projects} label="DONE" /></div>
              </section>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <InfoCard title="Skills" items={member.skills ?? []} />
              <InfoCard title="Software" items={member.software ?? []} />
              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><p className="text-[10px] tracking-[0.2em] text-white/30">INTERNAL RATING</p><div className="mt-6 flex items-center gap-3"><Star size={20} className="fill-current text-amber-400" /><span className="text-3xl font-semibold">{member.rating ?? "—"}</span></div><p className="mt-4 text-xs text-white/35">Internal studio rating. Not publicly visible.</p></section>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><p className="text-[10px] tracking-[0.2em] text-white/30">EXPERIENCE</p><div className="mt-5 flex items-center gap-3"><UserRound size={18} className="text-white/30" /><span className="text-sm text-white/60">{member.experience || "Not set"}</span></div></section>
              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><p className="text-[10px] tracking-[0.2em] text-white/30">PROJECTS</p><div className="mt-5 flex items-center gap-3"><BriefcaseBusiness size={18} className="text-white/30" /><span className="text-sm text-white/60">{member.completed_projects} completed</span></div></section>
              <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><p className="text-[10px] tracking-[0.2em] text-white/30">PORTFOLIO</p><div className="mt-5">{member.portfolio_url ? <a href={member.portfolio_url} target="_blank" rel="noreferrer" className="text-sm text-white/60 hover:text-white">Open portfolio ↗</a> : <span className="text-sm text-white/35">Not set</span>}</div></section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return <div><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-[9px] tracking-[0.16em] text-white/30">{label}</p></div>;
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"><p className="text-[10px] tracking-[0.2em] text-white/30">{title.toUpperCase()}</p><div className="mt-5 flex flex-wrap gap-2">{items.length ? items.map((item) => <span key={item} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/55">{item}</span>) : <span className="text-xs text-white/30">None added</span>}</div></section>;
}
