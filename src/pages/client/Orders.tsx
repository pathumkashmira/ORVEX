import { useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useApp } from "@/contexts/AppContext";
import { ArrowUpRight, ChevronDown, ChevronUp, Paperclip } from "lucide-react";
import { Link } from "react-router-dom";

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "badge-green",
  partially_paid: "badge-cyan",
  pending: "badge-gray",
  processing: "badge-orange",
  failed: "badge-red",
  cancelled: "badge-red",
  refunded: "badge-gray",
};

const FILTER_OPTIONS = ["All", "Pending", "Paid", "Partially Paid", "Processing", "Failed"];

function filterLabel(status: string): string {
  return status.replace("_", " ").toUpperCase();
}

export default function ClientOrders() {
  const { orders } = useAdmin();
  const { user } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const userOrders = orders.filter((o) => o.email === user?.email);
  const displayOrders = userOrders.length > 0 ? userOrders : orders;

  const filteredOrders = displayOrders.filter((o) => {
    if (filter === "All") return true;
    return o.paymentStatus === filter.toLowerCase().replace(" ", "_");
  });

  const totalSpend = displayOrders.reduce((s, o) => s + o.amount, 0);
  const activeCount = displayOrders.filter((o) => o.projectStatus === "In Progress").length;

  return (
    <ClientLayout>
      <div className="p-8 max-w-[1000px]">
        <div className="mb-8">
          <p className="label-sm text-[#bfc5cc]/40 mb-1">CLIENT PORTAL</p>
          <h1
            className="text-2xl text-[#f5f7f8]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
          >
            ORDERS
          </h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "TOTAL ORDERS", value: displayOrders.length.toString() },
            { label: "TOTAL SPEND", value: `$${totalSpend.toLocaleString()}` },
            { label: "ACTIVE", value: activeCount.toString() },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <p className="label-sm text-[#bfc5cc]/40 mb-2">{s.label}</p>
              <p
                className="text-2xl text-[#f5f7f8]"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`label-sm px-3 py-1.5 border transition-colors ${
                filter === f
                  ? "border-[#ff5a00] text-[#ff5a00] bg-[#ff5a00]/5"
                  : "border-white/10 text-[#bfc5cc]/50 hover:border-white/20 hover:text-[#bfc5cc]"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Orders card list */}
        <div className="space-y-3">
          {filteredOrders.length === 0 && (
            <div className="border border-white/5 p-8 text-center">
              <p className="text-[#bfc5cc]/40 text-sm">No orders found.</p>
            </div>
          )}
          {filteredOrders.map((order) => {
            const expanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className={`border transition-colors ${expanded ? "border-[#ff5a00]/30 bg-[#14171b]" : "border-white/5 hover:border-white/10"}`}
              >
                {/* Card header — clickable */}
                <button
                  className="w-full text-left p-5"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p
                        className="text-sm text-[#f5f7f8] mb-1"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                      >
                        {order.orderId}
                      </p>
                      <p className="text-[#bfc5cc] text-xs mb-3">{order.service}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="badge badge-gray">{order.package}</span>
                        <span className={`badge ${PAYMENT_STATUS_COLORS[order.paymentStatus] ?? "badge-gray"}`}>
                          {filterLabel(order.paymentStatus)}
                        </span>
                        <span className="label-sm text-[#bfc5cc]/40">{order.projectStatus}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-[#f5f7f8] text-sm">${order.amount.toLocaleString()}</p>
                        <p className="label-sm text-[#bfc5cc]/40 mt-1">{order.createdAt}</p>
                      </div>
                      {expanded ? (
                        <ChevronUp size={14} className="text-[#bfc5cc]/40" />
                      ) : (
                        <ChevronDown size={14} className="text-[#bfc5cc]/40" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {expanded && (
                  <div className="border-t border-white/5 px-5 pb-5 pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
                      {order.paymentType && (
                        <div>
                          <p className="label-sm text-[#bfc5cc]/40 mb-0.5">PAYMENT TYPE</p>
                          <p className="text-[#bfc5cc]">{order.paymentType.toUpperCase()}</p>
                        </div>
                      )}
                      {order.paymentMethod && (
                        <div>
                          <p className="label-sm text-[#bfc5cc]/40 mb-0.5">PAYMENT METHOD</p>
                          <p className="text-[#bfc5cc]">{order.paymentMethod.replace("_", " ").toUpperCase()}</p>
                        </div>
                      )}
                      {order.addons && order.addons.length > 0 && (
                        <div className="col-span-2">
                          <p className="label-sm text-[#bfc5cc]/40 mb-1">ADD-ONS</p>
                          <div className="flex flex-wrap gap-2">
                            {order.addons.map((addon) => (
                              <span key={addon} className="badge badge-gray">{addon}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {order.notes && (
                        <div className="col-span-2">
                          <p className="label-sm text-[#bfc5cc]/40 mb-0.5">NOTES</p>
                          <p className="text-[#bfc5cc]">{order.notes}</p>
                        </div>
                      )}
                      {order.attachments && order.attachments.length > 0 && (
                        <div className="col-span-2">
                          <p className="label-sm text-[#bfc5cc]/40 mb-1">ATTACHMENTS</p>
                          <div className="space-y-1">
                            {order.attachments.map((att) => (
                              <div key={att} className="flex items-center gap-2">
                                <Paperclip size={11} className="text-[#bfc5cc]/40" />
                                <span className="text-[#bfc5cc] text-xs">{att}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link to="/services" className="btn-primary">
            NEW ORDER <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
}
