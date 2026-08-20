import { useState } from "react";
import type { AvailabilityStatus } from "@/types/studio";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Availability() {
  const [status, setStatus] =
    useState<AvailabilityStatus>("AVAILABLE");

  const [days, setDays] = useState(
    DAYS.reduce<Record<string, boolean>>(
      (result, day) => {
        result[day] =
          !["Saturday", "Sunday"].includes(day);
        return result;
      },
      {}
    )
  );

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <div className="mx-auto max-w-[1100px] px-6 py-10 md:px-10">
        <p className="text-xs tracking-[0.25em] text-white/30">
          STUDIO OPERATING SYSTEM
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Availability
        </h1>

        <p className="mt-2 text-sm text-white/40">
          Set your working availability for studio planning.
        </p>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/[0.02] p-7">
          <p className="text-[10px] tracking-[0.2em] text-white/30">
            CURRENT STATUS
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {(
              [
                "AVAILABLE",
                "BUSY",
                "UNAVAILABLE",
              ] as AvailabilityStatus[]
            ).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`rounded-full border px-5 py-3 text-xs transition ${
                  status === item
                    ? "border-white bg-white text-black"
                    : "border-white/10 text-white/45 hover:border-white/30"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.02] p-7">
          <p className="text-[10px] tracking-[0.2em] text-white/30">
            WEEKLY AVAILABILITY
          </p>

          <div className="mt-5 divide-y divide-white/5">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex items-center justify-between py-4"
              >
                <span className="text-sm">
                  {day}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setDays((current) => ({
                      ...current,
                      [day]: !current[day],
                    }))
                  }
                  className={`h-6 w-11 rounded-full p-1 transition ${
                    days[day]
                      ? "bg-white"
                      : "bg-white/10"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full transition ${
                      days[day]
                        ? "translate-x-5 bg-black"
                        : "translate-x-0 bg-white/40"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <button
          type="button"
          className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
        >
          Save Availability
        </button>
      </div>
    </div>
  );
}