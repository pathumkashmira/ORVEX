import ClientLayout from "@/components/ClientLayout";
import { projects, orders } from "@/data/seed";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const PROJECT_STAGES = ["DISCOVERY", "CONCEPT", "BUILD", "MOTION", "FINAL"];

const clientProjects = [
  {
    orderId: "ORVEX-ORD-2026-0041",
    project: "AXIOM CGI Campaign",
    service: "CGI Visualization",
    stage: 3,
    startDate: "2026-07-01",
    estimatedDelivery: "2026-08-28",
    coverImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=500&fit=crop&auto=format",
    status: "active",
  },
  {
    orderId: "ORVEX-ORD-2026-0029",
    project: "Brand Motion Package",
    service: "Brand & Logo Animation",
    stage: 5,
    startDate: "2026-05-10",
    estimatedDelivery: "2026-06-20",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop&auto=format",
    status: "completed",
  },
];

export default function ClientProjects() {
  return (
    <ClientLayout>
      <div className="p-8 max-w-[1000px]">
        <div className="mb-8">
          <p className="label-sm text-[#bfc5cc]/40 mb-1">CLIENT PORTAL</p>
          <h1 className="text-2xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>MY PROJECTS</h1>
        </div>

        <div className="space-y-6">
          {clientProjects.map((proj) => (
            <div key={proj.orderId} className="border border-white/8 bg-[#14171b]/40 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0">
                <div className="aspect-video md:aspect-auto overflow-hidden bg-[#1d2126]">
                  <img
                    src={proj.coverImage}
                    alt={proj.project}
                    className="w-full h-full object-cover opacity-80"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-700 text-[#f5f7f8] text-lg mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{proj.project}</p>
                        <p className="label-sm text-[#bfc5cc]/40">{proj.orderId}</p>
                      </div>
                      <span className={`badge ${proj.status === "active" ? "badge-orange" : "badge-green"}`}>
                        {proj.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-3 mb-6">
                      <span className="badge badge-gray">{proj.service}</span>
                    </div>

                    {/* Stage progress */}
                    <p className="label-sm text-[#bfc5cc]/40 mb-3">PROJECT PHASE</p>
                    <div className="flex items-center gap-0 mb-6">
                      {PROJECT_STAGES.map((stage, i) => {
                        const completed = i < proj.stage;
                        const current = i === proj.stage - 1 && proj.status === "active";
                        return (
                          <div key={stage} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-2.5 h-2.5 rounded-full border mb-1.5 ${
                                current ? "border-[#ff5a00] bg-[#ff5a00]" :
                                completed ? "border-[#ff5a00]/60 bg-[#ff5a00]/30" :
                                "border-white/15 bg-transparent"
                              }`} />
                              <p className={`text-[8px] tracking-[0.1em] ${current ? "text-[#ff5a00]" : completed ? "text-[#bfc5cc]/50" : "text-[#bfc5cc]/20"}`}>
                                {stage}
                              </p>
                            </div>
                            {i < PROJECT_STAGES.length - 1 && (
                              <div className={`h-[1px] flex-1 mb-4 ${completed ? "bg-[#ff5a00]/30" : "bg-white/5"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex gap-6">
                      <div>
                        <p className="label-sm text-[#bfc5cc]/40 mb-0.5">STARTED</p>
                        <p className="text-[#bfc5cc] text-xs">{proj.startDate}</p>
                      </div>
                      <div>
                        <p className="label-sm text-[#bfc5cc]/40 mb-0.5">EST. DELIVERY</p>
                        <p className="text-[#bfc5cc] text-xs">{proj.estimatedDelivery}</p>
                      </div>
                    </div>
                    <Link to="/client/messages" className="btn-ghost text-xs flex items-center gap-1">
                      VIEW UPDATES <ArrowUpRight size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 border border-white/5 p-8 text-center">
          <p className="text-[#bfc5cc]/40 text-sm mb-4">Want to start a new project?</p>
          <Link to="/services" className="btn-primary">
            BROWSE SERVICES <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
}
