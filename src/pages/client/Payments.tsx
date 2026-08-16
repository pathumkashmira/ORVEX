import ClientLayout from "@/components/ClientLayout";
import { useAdmin, type Payment } from "@/contexts/AdminContext";
import { useApp } from "@/contexts/AppContext";

const METHOD_LABELS: Record<Payment["method"], string> = {
  stripe: "Stripe / Card",
  bank_transfer: "Bank Transfer",
  crypto: "Crypto",
  paypal: "PayPal",
};

const STATUS_DOT: Record<Payment["status"], string> = {
  completed: "bg-green-400",
  pending: "bg-yellow-400",
  failed: "bg-red-400",
  refunded: "bg-[#bfc5cc]/40",
};

const STATUS_BADGE: Record<Payment["status"], string> = {
  completed: "badge-green",
  pending: "badge-orange",
  failed: "badge-red",
  refunded: "badge-gray",
};

export default function ClientPayments() {
  const { payments } = useAdmin();
  const { user } = useApp();

  const userPayments = payments.filter((p) => p.email === user?.email);
  const displayPayments = userPayments.length > 0 ? userPayments : payments;

  const totalPaid = displayPayments
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + p.amount, 0);

  const pendingAmount = displayPayments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + p.amount, 0);

  const completedPayments = displayPayments.filter((p) => p.status === "completed");
  const lastPaymentDate =
    completedPayments.length > 0
      ? completedPayments.sort((a, b) => b.processedAt.localeCompare(a.processedAt))[0].processedAt
      : "—";

  return (
    <ClientLayout>
      <div className="p-8 max-w-[1000px]">
        <div className="mb-8">
          <p className="label-sm text-[#bfc5cc]/40 mb-1">CLIENT PORTAL</p>
          <h1
            className="text-2xl text-[#f5f7f8]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
          >
            PAYMENTS
          </h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="stat-card">
            <p className="label-sm text-[#bfc5cc]/40 mb-2">TOTAL PAID</p>
            <p
              className="text-2xl text-[#f5f7f8]"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
            >
              ${totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <p className="label-sm text-[#bfc5cc]/40 mb-2">PENDING</p>
            <p
              className="text-2xl text-[#f5f7f8]"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
            >
              ${pendingAmount.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <p className="label-sm text-[#bfc5cc]/40 mb-2">LAST PAYMENT</p>
            <p
              className="text-2xl text-[#f5f7f8]"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
            >
              {lastPaymentDate.slice(0, 10)}
            </p>
          </div>
        </div>

        {/* Payments table */}
        <div className="border border-white/5 overflow-hidden">
          {displayPayments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[#bfc5cc]/40 text-sm">No payment records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="orvex-table w-full">
                <thead>
                  <tr>
                    <th>REF</th>
                    <th>INVOICE</th>
                    <th>AMOUNT</th>
                    <th>METHOD</th>
                    <th>STATUS</th>
                    <th>PROCESSED</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPayments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <p
                          className="text-xs text-[#f5f7f8]"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                        >
                          {p.paymentRef}
                        </p>
                      </td>
                      <td>
                        <p className="text-[#bfc5cc] text-xs">{p.invoiceNumber}</p>
                      </td>
                      <td>
                        <p className="text-[#f5f7f8] text-xs">${p.amount.toLocaleString()}</p>
                      </td>
                      <td>
                        <p className="text-[#bfc5cc] text-xs">{METHOD_LABELS[p.method] ?? p.method}</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[p.status] ?? "bg-[#bfc5cc]/40"}`} />
                          <span className={`badge ${STATUS_BADGE[p.status] ?? "badge-gray"}`}>
                            {p.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <p className="label-sm text-[#bfc5cc]/40">{p.processedAt.slice(0, 10)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
