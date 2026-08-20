import { Link } from "react-router-dom";
import {
  Users,
  ListTodo,
  BriefcaseBusiness,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

export default function StudioOSDashboard() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-10 md:px-10">
        <div className="mb-10">
          <p className="text-xs tracking-[0.25em] text-white/30">
            ORVEX STUDIO
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Operating System
          </h1>

          <p className="mt-2 text-sm text-white/40">
            Internal studio operations and production control.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="ACTIVE PROJECTS"
            value="04"
            icon={<BriefcaseBusiness size={17} />}
          />

          <MetricCard
            title="TEAM MEMBERS"
            value="03"
            icon={<Users size={17} />}
          />

          <MetricCard
            title="PENDING TASKS"
            value="15"
            icon={<ListTodo size={17} />}
          />

          <MetricCard
            title="UPCOMING"
            value="06"
            icon={<CalendarDays size={17} />}
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <QuickLink
            href="/studio-os/team"
            title="Team Management"
            description="Collaborators, roles, skills and status."
          />

          <QuickLink
            href="/studio-os/workload"
            title="Team Workload"
            description="Capacity, deadlines and workload risk."
          />

          <QuickLink
            href="/studio-os/availability"
            title="Availability"
            description="Manage weekly studio availability."
          />
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-white/30">
                PHASE 2
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Team Operations
              </h2>
            </div>

            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-400">
              ACTIVE
            </span>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
            Manage ORVEX collaborators, availability, workload,
            skills and production capacity from one internal
            operating system.
          </p>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center justify-between text-white/30">
        <span className="text-[10px] tracking-[0.18em]">
          {title}
        </span>

        {icon}
      </div>

      <p className="mt-6 text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={href}
      className="group rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition hover:bg-white/[0.05]"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium">
          {title}
        </h3>

        <ArrowUpRight
          size={16}
          className="text-white/30 transition group-hover:text-white"
        />
      </div>

      <p className="mt-3 text-xs leading-6 text-white/35">
        {description}
      </p>
    </Link>
  );
}