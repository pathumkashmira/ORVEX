import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { getAvailability, getTeamMember, saveAvailability } from "@/lib/studio";
import type { AvailabilityStatus } from "@/types/studio";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface DayState { enabled: boolean; start_time: string; end_time: string }

export default function Availability() {
  const { user, loading: authLoading } = useApp();
  const [status, setStatus] = useState<AvailabilityStatus>("AVAILABLE");
  const [days, setDays] = useState<Record<string, DayState>>(
    Object.fromEntries(DAYS.map((day) => [day, { enabled: !["Saturday", "Sunday"].includes(day), start_time: "09:00", end_time: "18:00" }]))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    const load = async () => {
      try {
        const [member, slots] = await Promise.all([getTeamMember(user.id), getAvailability(user.id)]);
        if (!mounted) return;
        if (member?.availability_status) setStatus(member.availability_status);
        if (slots.length) {
          setDays((current) => {
            const next = { ...current };
            for (const slot of slots) {
              const day = DAYS[Number(slot.day_of_week) - 1] ?? DAYS[Number(slot.day_of_week)];
              if (day) next[day] = { enabled: slot.enabled, start_time: slot.start_time?.slice(0, 5) || "09:00", end_time: slot.end_time?.slice(0, 5) || "18:00" };
            }
            return next;
          });
        }
      } catch (error) {
        console.error("Availability load error:", error);
        setMessage(error instanceof Error ? error.message : "Failed to load availability.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [user?.id]);

  const updateDay = (day: string, input: Partial<DayState>) => setDays((current) => ({ ...current, [day]: { ...current[day], ...input } }));

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      setMessage("");
      const slots = DAYS.map((day, index) => ({ day_of_week: index + 1, start_time: days[day].start_time, end_time: days[day].end_time, enabled: days[day].enabled }));
      await saveAvailability(user.id, status, slots);
      setMessage("Availability saved successfully.");
    } catch (error) {
      console.error("Availability save error:", error);
      setMessage(error instanceof Error ? error.message : "Failed to save availability.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-[#08090a] text-white/40 flex items-center justify-center text-sm">Loading availability...</div>;

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-[1100px] px-6 py-10 md:px-10">
        <p className="text-xs tracking-[0.25em] text-white/30">STUDIO OPERATING SYSTEM</p>
        <h1 className="mt-3 text-4xl font-semibold">Availability</h1>
        <p className="mt-2 text-sm text-white/40">Set your working availability for studio planning.</p>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-7">
          <p className="text-[10px] tracking-[0.2em] text-white/30">CURRENT STATUS</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {(["AVAILABLE", "BUSY", "UNAVAILABLE"] as AvailabilityStatus[]).map((item) => (
              <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-full border px-5 py-3 text-xs transition ${status === item ? "border-white bg-white text-black" : "border-white/10 text-white/45 hover:border-white/30"}`}>{item}</button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-7">
          <p className="text-[10px] tracking-[0.2em] text-white/30">WEEKLY AVAILABILITY</p>
          <div className="mt-5 divide-y divide-white/5">
            {DAYS.map((day) => (
              <div key={day} className="grid gap-4 py-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                <span className="text-sm">{day}</span>
                <input type="time" value={days[day].start_time} disabled={!days[day].enabled} onChange={(e) => updateDay(day, { start_time: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none disabled:opacity-30" />
                <input type="time" value={days[day].end_time} disabled={!days[day].enabled} onChange={(e) => updateDay(day, { end_time: e.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none disabled:opacity-30" />
                <button type="button" aria-label={`Toggle ${day}`} onClick={() => updateDay(day, { enabled: !days[day].enabled })} className={`h-6 w-11 rounded-full p-1 transition ${days[day].enabled ? "bg-white" : "bg-white/10"}`}><span className={`block h-4 w-4 rounded-full transition ${days[day].enabled ? "translate-x-5 bg-black" : "translate-x-0 bg-white/40"}`} /></button>
              </div>
            ))}
          </div>
        </section>

        {message && <p className={`mt-5 text-sm ${message.includes("success") ? "text-emerald-400" : "text-red-300"}`}>{message}</p>}
        <button type="button" onClick={() => void handleSave()} disabled={saving || !user} className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-medium text-black disabled:opacity-40">{saving ? "Saving..." : "Save Availability"}</button>
      </div>
    </div>
  );
}
