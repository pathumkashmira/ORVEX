import ClientLayout from "@/components/ClientLayout";
import { orders } from "@/data/seed";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  paid: "badge-green",
  partially_paid: "badge-cyan",
  pending: "badge-gray",
  processing: "badge-orange",
  failed: "badge-red",
  cancelled: "badge-red",
  refunded: "badge-gray",
};

const clientOrders = orders.slice(0, 3);

export default function ClientOrders() {
  return (
    <ClientLayout>
      <div className="p-8 max-w-[1000px]">
        <div className="mb-8">
          <p className="label-sm text-[#bfc5cc]/40 mb-1">CLIENT PORTAL</p>
          <h1 className="text-2xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>ORDERS</h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "TOTAL ORDERS", value: clientOrders.length.toString() },
            { label: "TOTAL SPEND", value: `$${clientOrders.reduce((s, o) => s + o.amount, 0).toLocaleString()}` },
            { label: "ACTIVE", value: clientOrders.filter(o => o.projectStatus === "In Progress").length.toString() },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <p className="label-sm text-[#bfc5cc]/40 mb-2">{s.label}</p>
              <p className="text-2xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <div className="border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="orvex-table w-full">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>SERVICE</th>
                  <th>PACKAGE</th>
                  <th>AMOUNT</th>
                  <th>PAYMENT</th>
                  <th>PROJECT</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {clientOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <p className="font-700 text-[#f5f7f8] text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{order.orderId}</p>
                    </td>
                    <td>
                      <p className="text-[#bfc5cc] text-xs">{order.service}</p>
                    </td>
                    <td>
                      <span className="badge badge-gray">{order.package}</span>
                    </td>
                    <td>
                      <p className="text-[#f5f7f8] text-xs">${order.amount.toLocaleString()}</p>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[order.paymentStatus] ?? "badge-gray"}`}>
                        {order.paymentStatus.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <p className="text-[#bfc5cc] text-xs">{order.projectStatus}</p>
                    </td>
                    <td>
                      <p className="label-sm text-[#bfc5cc]/40">{order.createdAt}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10">
          <Link to="/services" className="btn-primary">
            NEW ORDER <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </ClientLayout>
  );
}
