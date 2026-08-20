import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  BriefcaseBusiness,
  Clock3,
  Star,
  UserRound,
} from "lucide-react";

const TEAM_MEMBER = {
  id: "team-002",
  full_name: "3D Artist",
  email: "artist@orvex.studio",
  role: "TEAM_COLLABORATOR",
  status: "VERIFIED",
  availability: "BUSY",
  bio: "3D artist focused on product visualization, CGI and motion.",
  skills: [
    "3D Modeling",
    "Product CGI",
    "Rendering",
    "Lighting",
  ],
  software: [
    "Blender",
    "Cinema 4D",
    "After Effects",
  ],
  experience: "4+ years",
  timezone: "Asia/Colombo",
  completed_projects: 11,
  active_projects: 3,
  pending_tasks: 5,
  workload: 84,
  rating: 4.8,
  portfolio: "https://example.com",
};

export default function TeamMember() {
  const { id } = useParams();

  void id;

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-[1300px] px-6 py-10 md:px-10">
        <Link
          to="/studio-os/team"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Team
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-2xl font-semibold">
                3D
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold">
                    {TEAM_MEMBER.full_name}
                  </h1>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-400">
                    {TEAM_MEMBER.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-white/40">
                  {TEAM_MEMBER.role.replaceAll("_", " ")}
                </p>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-white/55">
                  {TEAM_MEMBER.bio}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 text-xs text-white/40">
                    <Mail size={14} />
                    {TEAM_MEMBER.email}
                  </span>

                  <span className="inline-flex items-center gap-2 text-xs text-white/40">
                    <Clock3 size={14} />
                    {TEAM_MEMBER.timezone}
                  </span>

                  <span className="inline-flex items-center gap-2 text-xs text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {TEAM_MEMBER.availability}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-7">
            <p className="text-[10px] tracking-[0.2em] text-white/30">
              WORKLOAD
            </p>

            <div className="mt-6">
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-white/50">
                  Current workload
                </span>

                <span>{TEAM_MEMBER.workload}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: `${TEAM_MEMBER.workload}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <Metric
                value={TEAM_MEMBER.active_projects}
                label="PROJECTS"
              />

              <Metric
                value={TEAM_MEMBER.pending_tasks}
                label="TASKS"
              />

              <Metric
                value={TEAM_MEMBER.completed_projects}
                label="DONE"
              />
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <InfoCard
            title="Skills"
            items={TEAM_MEMBER.skills}
          />

          <InfoCard
            title="Software"
            items={TEAM_MEMBER.software}
          />

          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-[10px] tracking-[0.2em] text-white/30">
              INTERNAL RATING
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Star
                size={20}
                className="fill-current text-amber-400"
              />

              <span className="text-3xl font-semibold">
                {TEAM_MEMBER.rating}
              </span>
            </div>

            <p className="mt-4 text-xs text-white/35">
              Internal studio rating. Not publicly visible.
            </p>
          </section>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-[10px] tracking-[0.2em] text-white/30">
              EXPERIENCE
            </p>

            <div className="mt-5 flex items-center gap-3">
              <UserRound size={18} className="text-white/30" />

              <span className="text-sm text-white/60">
                {TEAM_MEMBER.experience}
              </span>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
            <p className="text-[10px] tracking-[0.2em] text-white/30">
              PROJECTS
            </p>

            <div className="mt-5 flex items-center gap-3">
              <BriefcaseBusiness
                size={18}
                className="text-white/30"
              />

              <span className="text-sm text-white/60">
                {TEAM_MEMBER.completed_projects} completed
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-[9px] tracking-[0.16em] text-white/30">
        {label}
      </p>
    </div>
  );
}

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <p className="text-[10px] tracking-[0.2em] text-white/30">
        {title.toUpperCase()}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/55"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}