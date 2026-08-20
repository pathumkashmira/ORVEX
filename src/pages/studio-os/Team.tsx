import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import { updateTeamMember } from "@/lib/studio";
import type { TeamMember, TeamStatus } from "@/types/studio";

const STATUSES: TeamStatus[] = [
  "APPLICANT",
  "SHORTLISTED",
  "TRIAL",
  "VERIFIED",
  "CORE",
  "LEAD",
  "SUSPENDED",
  "ARCHIVED",
];

type TeamRow = TeamMember & {
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
    timezone: string | null;
  } | null;
};

export default function Team() {
  const [members, setMembers] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | TeamStatus>("ALL");
  const [selected, setSelected] = useState<TeamRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTeam = async () => {
    if (!supabase) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: team, error: teamError } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (teamError) throw teamError;

      const userIds = (team ?? [])
        .map((member) => member.user_id)
        .filter(Boolean);

      let profiles: any[] = [];

      if (userIds.length) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role, timezone")
          .in("id", userIds);

        if (profileError) throw profileError;
        profiles = data ?? [];
      }

      const profileMap = new Map(
        profiles.map((profile) => [profile.id, profile])
      );

      setMembers(
        (team ?? []).map((member) => ({
          ...member,
          profile: profileMap.get(member.user_id) ?? null,
        }))
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load team members."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const name =
        member.profile?.full_name?.toLowerCase() ?? "";

      const role =
        member.profile?.role?.toLowerCase() ?? "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        role.includes(query) ||
        String(member.status ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "ALL" || member.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [members, search, status]);

  const counts = useMemo(() => {
    return {
      total: members.length,
      active: members.filter(
        (m) =>
          m.status !== "SUSPENDED" &&
          m.status !== "ARCHIVED"
      ).length,
      available: members.filter(
        (m) => m.availability === "AVAILABLE"
      ).length,
      review: members.filter(
        (m) =>
          m.status === "APPLICANT" ||
          m.status === "SHORTLISTED" ||
          m.status === "TRIAL"
      ).length,
    };
  }, [members]);

  const saveMember = async (
    member: TeamRow,
    nextStatus: TeamStatus
  ) => {
    setSaving(true);
    setError("");

    try {
      await updateTeamMember(member.user_id, {
        status: nextStatus,
      });

      setMembers((current) =>
        current.map((item) =>
          item.user_id === member.user_id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      setSelected((current) =>
        current
          ? { ...current, status: nextStatus }
          : current
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update team member."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateAvailability = async (
    member: TeamRow,
    availability: TeamMember["availability"]
  ) => {
    setSaving(true);
    setError("");

    try {
      await updateTeamMember(member.user_id, {
        // @ts-expect-error availability is stored by the Studio OS schema
        availability,
      });

      setMembers((current) =>
        current.map((item) =>
          item.user_id === member.user_id
            ? { ...item, availability }
            : item
        )
      );

      setSelected((current) =>
        current
          ? { ...current, availability }
          : current
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update availability."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <main className="min-h-screen bg-[#08090a] text-[#f5f7f8]">
        <section className="pt-36 pb-12 px-6 md:px-12 border-b border-white/5">
          <div className="max-w-[1400px] mx-auto">
            <p className="label-orange mb-5">STUDIO OS / TEAM</p>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div>
                <h1
                  className="text-5xl md:text-7xl tracking-[-0.04em]"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  TEAM
                </h1>

                <p className="mt-4 max-w-xl text-[#bfc5cc]/60 leading-relaxed">
                  Manage collaborators, roles, availability and
                  production capacity.
                </p>
              </div>

              <button
                type="button"
                onClick={loadTeam}
                className="self-start lg:self-auto border border-white/10 px-5 py-3 text-xs tracking-[0.16em] uppercase hover:border-white/30 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-12 py-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
              <Stat label="TOTAL" value={counts.total} />
              <Stat label="ACTIVE" value={counts.active} />
              <Stat label="AVAILABLE" value={counts.available} />
              <Stat label="IN REVIEW" value={counts.review} />
            </div>
          </div>
        </section>

        <section className="px-6 md:px-12 pb-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search team..."
                className="flex-1 bg-white/[0.03] border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
              />

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as "ALL" | TeamStatus
                  )
                }
                className="bg-[#101112] border border-white/10 px-4 py-3 text-sm outline-none"
              >
                <option value="ALL">ALL STATUS</option>
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="mb-6 border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="border border-white/10 p-10 text-center text-[#bfc5cc]/50">
                Loading team...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="border border-white/10 p-10 text-center text-[#bfc5cc]/50">
                No team members found.
              </div>
            ) : (
              <div className="border border-white/10 overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <Th>COLLABORATOR</Th>
                      <Th>ROLE</Th>
                      <Th>STATUS</Th>
                      <Th>AVAILABILITY</Th>
                      <Th>WORKLOAD</Th>
                      <Th>ACTIONS</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr
                        key={member.user_id}
                        className="border-b border-white/5 hover:bg-white/[0.025] transition"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            {member.profile?.avatar_url ? (
                              <img
                                src={member.profile.avatar_url}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm">
                                {(
                                  member.profile?.full_name ??
                                  "?"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div>
                              <div className="font-medium">
                                {member.profile?.full_name ??
                                  "Unnamed collaborator"}
                              </div>

                              <div className="text-xs text-[#bfc5cc]/40">
                                {member.profile?.timezone ??
                                  "Timezone not set"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-[#bfc5cc]/70">
                          {member.profile?.role ??
                            "TEAM_COLLABORATOR"}
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge
                            status={member.status}
                          />
                        </td>

                        <td className="px-5 py-5 text-sm">
                          {member.availability ?? "—"}
                        </td>

                        <td className="px-5 py-5">
                          <div className="w-28">
                            <div className="flex justify-between text-[11px] text-[#bfc5cc]/50 mb-1">
                              <span>LOAD</span>
                              <span>
                                {member.current_workload ?? 0}%
                              </span>
                            </div>

                            <div className="h-1 bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-[#f5f7f8]"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      Number(
                                        member.current_workload ?? 0
                                      )
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              setSelected(member)
                            }
                            className="text-xs uppercase tracking-[0.12em] border border-white/10 px-4 py-2 hover:border-white/30 transition"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {selected && (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex justify-end">
            <aside className="w-full max-w-[520px] h-full overflow-y-auto bg-[#0d0e10] border-l border-white/10 p-6 md:p-8">
              <div className="flex items-start justify-between gap-6 mb-10">
                <div>
                  <p className="label-orange mb-3">
                    COLLABORATOR
                  </p>

                  <h2
                    className="text-3xl"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    {selected.profile?.full_name ??
                      "Unnamed collaborator"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-2xl text-white/50 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="space-y-8">
                <Field label="ROLE">
                  <p className="text-sm text-[#bfc5cc]/70">
                    {selected.profile?.role ??
                      "TEAM_COLLABORATOR"}
                  </p>
                </Field>

                <Field label="STATUS">
                  <select
                    value={selected.status}
                    disabled={saving}
                    onChange={(e) =>
                      saveMember(
                        selected,
                        e.target.value as TeamStatus
                      )
                    }
                    className="w-full bg-[#151619] border border-white/10 px-4 py-3 text-sm"
                  >
                    {STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="AVAILABILITY">
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        "AVAILABLE",
                        "BUSY",
                        "UNAVAILABLE",
                      ] as const
                    ).map((item) => (
                      <button
                        key={item}
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          updateAvailability(
                            selected,
                            item
                          )
                        }
                        className={`px-3 py-3 text-[11px] tracking-[0.08em] border transition ${
                          selected.availability === item
                            ? "border-white/50 bg-white/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <InfoCard
                    label="WORKLOAD"
                    value={`${selected.current_workload ?? 0}%`}
                  />

                  <InfoCard
                    label="COMPLETED"
                    value={String(
                      selected.completed_projects ?? 0
                    )}
                  />
                </div>

                <InfoCard
                  label="RATE"
                  value={
                    selected.rate != null
                      ? "Private"
                      : "Not configured"
                  }
                />

                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#bfc5cc]/40 mb-3">
                    PROFILE
                  </p>

                  <p className="text-sm text-[#bfc5cc]/60 leading-relaxed">
                    {selected.profile?.timezone
                      ? `Timezone: ${selected.profile.timezone}`
                      : "Timezone not configured."}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </Layout>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-[#0d0e10] p-5 md:p-7">
      <p className="text-[10px] tracking-[0.16em] text-[#bfc5cc]/40 mb-3">
        {label}
      </p>
      <p
        className="text-3xl"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 text-[10px] tracking-[0.14em] text-[#bfc5cc]/40 font-normal">
      {children}
    </th>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.14em] text-[#bfc5cc]/40 mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-white/10 p-4">
      <p className="text-[10px] tracking-[0.12em] text-[#bfc5cc]/40 mb-2">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: TeamStatus;
}) {
  return (
    <span className="inline-flex border border-white/10 px-2.5 py-1 text-[10px] tracking-[0.08em] text-[#bfc5cc]/70">
      {status}
    </span>
  );
}