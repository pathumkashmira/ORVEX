import type {
  AvailabilityStatus,
} from "@/types/studio";

const WORKLOAD = [
  {
    name: "ORVEX Admin",
    role: "ADMIN",
    projects: 4,
    tasks: 7,
    availability: "AVAILABLE" as AvailabilityStatus,
    workload: 72,
    risk: "LOW",
  },
  {
    name: "3D Artist",
    role: "3D ARTIST",
    projects: 3,
    tasks: 5,
    availability: "BUSY" as AvailabilityStatus,
    workload: 84,
    risk: "MEDIUM",
  },
  {
    name: "Motion Designer",
    role: "MOTION DESIGNER",
    projects: 2,
    tasks: 3,
    availability: "AVAILABLE" as AvailabilityStatus,
    workload: 48,
    risk: "LOW",
  },
];

export default function Workload() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-10">
        <p className="text-xs tracking-[0.25em] text-white/30">
          STUDIO OPERATING SYSTEM
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Team Workload
        </h1>

        <p className="mt-2 text-sm text-white/40">
          Monitor capacity, active work and deadline risk.
        </p>

        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] border-b border-white/10 px-6 py-4 text-[10px] tracking-[0.16em] text-white/30 md:grid">
            <span>COLLABORATOR</span>
            <span>PROJECTS</span>
            <span>TASKS</span>
            <span>AVAILABILITY</span>
            <span>WORKLOAD</span>
            <span>RISK</span>
          </div>

          {WORKLOAD.map((member) => (
            <div
              key={member.name}
              className="grid gap-5 border-b border-white/5 px-6 py-6 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] md:items-center"
            >
              <div>
                <p className="text-sm font-medium">
                  {member.name}
                </p>

                <p className="mt-1 text-[10px] tracking-wide text-white/30">
                  {member.role}
                </p>
              </div>

              <span className="text-sm text-white/60">
                {member.projects}
              </span>

              <span className="text-sm text-white/60">
                {member.tasks}
              </span>

              <span
                className={`text-xs ${
                  member.availability === "AVAILABLE"
                    ? "text-emerald-400"
                    : member.availability === "BUSY"
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {member.availability}
              </span>

              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-white/30">
                    Capacity
                  </span>

                  <span>
                    {member.workload}%
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{
                      width: `${member.workload}%`,
                    }}
                  />
                </div>
              </div>

              <span
                className={`text-xs ${
                  member.risk === "HIGH"
                    ? "text-red-400"
                    : member.risk === "MEDIUM"
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {member.risk}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}