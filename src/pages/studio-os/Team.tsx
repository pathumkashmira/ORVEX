import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  MoreHorizontal,
  BriefcaseBusiness,
} from "lucide-react";
import type {
  TeamMember,
  TeamStatus,
  AvailabilityStatus,
} from "@/types/studio";

const DEMO_TEAM: TeamMember[] = [
  {
    id: "team-001",
    full_name: "ORVEX Admin",
    email: "admin@orvex.studio",
    role: "ADMIN",
    team_status: "CORE",
    skills: ["Creative Direction", "Project Management"],
    software: ["Figma", "Blender", "Adobe CC"],
    preferred_project_types: ["Branding", "CGI", "Motion"],
    availability_status: "AVAILABLE",
    rating: 5,
    completed_projects: 18,
    active_projects: 4,
    pending_tasks: 7,
    workload_percentage: 72,
  },
  {
    id: "team-002",
    full_name: "3D Artist",
    email: "artist@orvex.studio",
    role: "TEAM_COLLABORATOR",
    team_status: "VERIFIED",
    skills: ["3D Modeling", "Product CGI", "Rendering"],
    software: ["Blender", "Cinema 4D"],
    preferred_project_types: ["Product CGI", "Animation"],
    availability_status: "BUSY",
    rating: 4.8,
    completed_projects: 11,
    active_projects: 3,
    pending_tasks: 5,
    workload_percentage: 84,
  },
];

const STATUS_OPTIONS: TeamStatus[] = [
  "APPLICANT",
  "SHORTLISTED",
  "TRIAL",
  "VERIFIED",
  "CORE",
  "LEAD",
  "SUSPENDED",
  "ARCHIVED",
];

const AVAILABILITY_OPTIONS: AvailabilityStatus[] = [
  "AVAILABLE",
  "BUSY",
  "UNAVAILABLE",
];

function statusClass(status: TeamStatus) {
  if (status === "CORE" || status === "LEAD" || status === "VERIFIED") {
    return "text-emerald-400 bg-emerald-400/10";
  }

  if (status === "TRIAL" || status === "SHORTLISTED") {
    return "text-amber-400 bg-amber-400/10";
  }

  if (status === "SUSPENDED") {
    return "text-red-400 bg-red-400/10";
  }

  return "text-white/50 bg-white/5";
}

function availabilityClass(status: AvailabilityStatus) {
  if (status === "AVAILABLE") {
    return "text-emerald-400";
  }

  if (status === "BUSY") {
    return "text-amber-400";
  }

  return "text-red-400";
}

export default function Team() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | TeamStatus>("ALL");
  const [availability, setAvailability] =
    useState<"ALL" | AvailabilityStatus>("ALL");

  const filteredTeam = useMemo(() => {
    return DEMO_TEAM.filter((member) => {
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        member.full_name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.skills.some((skill) =>
          skill.toLowerCase().includes(query)
        );

      const matchesStatus =
        status === "ALL" || member.team_status === status;

      const matchesAvailability =
        availability === "ALL" ||
        member.availability_status === availability;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAvailability
      );
    });
  }, [search, status, availability]);

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-10 md:px-10">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs tracking-[0.25em] text-white/40">
              STUDIO OPERATING SYSTEM
            </p>

            <h1 className="text-4xl font-semibold tracking-tight">
              Team
            </h1>

            <p className="mt-2 text-sm text-white/40">
              Manage collaborators, availability and workload.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            <Plus size={16} />
            Add Collaborator
          </button>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4">
            <Search size={17} className="text-white/30" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search team..."
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-white/25"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as "ALL" | TeamStatus
              )
            }
            className="rounded-xl border border-white/10 bg-[#101112] px-4 py-3 text-sm text-white/70 outline-none"
          >
            <option value="ALL">All statuses</option>

            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={availability}
            onChange={(event) =>
              setAvailability(
                event.target.value as
                  | "ALL"
                  | AvailabilityStatus
              )
            }
            className="rounded-xl border border-white/10 bg-[#101112] px-4 py-3 text-sm text-white/70 outline-none"
          >
            <option value="ALL">All availability</option>

            {AVAILABILITY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="hidden grid-cols-[2fr_1.2fr_1fr_1fr_1fr_40px] gap-4 border-b border-white/10 px-5 py-4 text-[10px] tracking-[0.18em] text-white/30 md:grid">
            <span>COLLABORATOR</span>
            <span>ROLE</span>
            <span>STATUS</span>
            <span>AVAILABILITY</span>
            <span>WORKLOAD</span>
            <span />
          </div>

          {filteredTeam.map((member) => (
            <Link
              key={member.id}
              to={`/studio-os/team/${member.id}`}
              className="grid gap-4 border-b border-white/5 px-5 py-5 transition hover:bg-white/[0.04] md:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_40px] md:items-center"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium">
                  {member.full_name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {member.full_name}
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="text-sm text-white/55">
                {member.role.replaceAll("_", " ")}
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] tracking-wide ${statusClass(
                    member.team_status
                  )}`}
                >
                  {member.team_status}
                </span>
              </div>

              <div
                className={`flex items-center gap-2 text-xs ${availabilityClass(
                  member.availability_status
                )}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {member.availability_status}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-white/40">
                    {member.active_projects} projects
                  </span>

                  <span className="text-white/60">
                    {member.workload_percentage}%
                  </span>
                </div>

                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white/70"
                    style={{
                      width: `${Math.min(
                        member.workload_percentage,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <MoreHorizontal
                size={17}
                className="hidden text-white/30 md:block"
              />
            </Link>
          ))}

          {filteredTeam.length === 0 && (
            <div className="px-6 py-20 text-center">
              <Users
                size={28}
                className="mx-auto mb-4 text-white/20"
              />

              <p className="text-sm text-white/50">
                No collaborators found.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="TEAM MEMBERS"
            value={DEMO_TEAM.length}
            icon={<Users size={16} />}
          />

          <StatCard
            label="ACTIVE PROJECTS"
            value={DEMO_TEAM.reduce(
              (total, member) =>
                total + member.active_projects,
              0
            )}
            icon={<BriefcaseBusiness size={16} />}
          />

          <StatCard
            label="PENDING TASKS"
            value={DEMO_TEAM.reduce(
              (total, member) =>
                total + member.pending_tasks,
              0
            )}
          />

          <StatCard
            label="AVG WORKLOAD"
            value={`${Math.round(
              DEMO_TEAM.reduce(
                (total, member) =>
                  total + member.workload_percentage,
                0
              ) / DEMO_TEAM.length
            )}%`}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-5 flex items-center justify-between text-white/30">
        <span className="text-[10px] tracking-[0.18em]">
          {label}
        </span>

        {icon}
      </div>

      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}