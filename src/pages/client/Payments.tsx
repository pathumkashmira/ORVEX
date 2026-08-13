import { useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import { CreditCard, Plus, Shield } from "lucide-react";

const PAYMENT_HISTORY = [
  { id: "1", date: "2026-08-01", description: "AXIOM CGI Campaign — Deposit", amount: 3800, method: "Visa •••• 4242", status: "success" },
  { id: "2", date: "2026-06-20", description: "Brand Motion Package — Final payment", amount: 4500, method: "Visa •••• 4242", status: "success" },
  { id: "3", date: "2026-06-01", description: "Brand Motion Package — Deposit", amount: 2250, method: "Mastercard •••• 7890", status: "success" },
  { id: "4", date: "2026-04-15", description: "Product Visualization — Full payment", amount: 3200, method: "Visa •••• 4242", status: "success" },
];

export default function ClientPayments() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <ClientLayout>
      <div className="p-8 max-w-[800px]">
        <div className="mb-8">
          <p className="label-sm text-[#bfc5cc]/40 mb-1">CLIENT PORTAL</p>
          <h1 className="text-2xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>PAYMENTS</h1>
        </div>

        {/* Saved methods */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="label-sm">PAYMENT METHODS</p>
            <button onClick={() => setShowAdd(!showAdd)} className="btn-ghost text-xs flex items-center gap-1">
              <Plus size={11} /> ADD METHOD
            </button>
          </div>

          {showAdd && (
            <div className="border border-[#ff5a00]/20 bg-[#14171b] p-6 mb-4">
              <p className="label-sm mb-4">ADD NEW CARD</p>
              <div className="space-y-4">
                <div>
                  <label className="orvex-label">Card number</label>
                  <input className="orvex-input" placeholder="•••• •••• •••• ••••" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="orvex-label">Expiry</label>
                    <input className="orvex-input" placeholder="MM / YY" />
                  </div>
                  <div>
                    <label className="orvex-label">CVC</label>
                    <input className="orvex-input" placeholder="•••" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#bfc5cc]/40 text-xs">
                  <Shield size={11} /> Secured by Stripe. ORVEX does not store card data.
                </div>
                <div className="flex gap-3">
                  <button className="btn-primary">SAVE CARD</button>
                  <button onClick={() => setShowAdd(false)} className="btn-ghost">CANCEL</button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {[
              { brand: "VISA", last4: "4242", expiry: "09/28", default: true },
              { brand: "MC", last4: "7890", expiry: "03/27", default: false },
            ].map((card) => (
              <div key={card.last4} className={`flex items-center justify-between border p-4 ${card.default ? "border-[#ff5a00]/20 bg-[#14171b]" : "border-white/5"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-7 bg-[#1d2126] border border-white/10 flex items-center justify-center">
                    <span className="text-[8px] font-700 text-[#bfc5cc]" style={{ fontWeight: 700 }}>{card.brand}</span>
                  </div>
                  <div>
                    <p className="text-[#f5f7f8] text-sm">•••• {card.last4}</p>
                    <p className="label-sm text-[#bfc5cc]/40">Expires {card.expiry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {card.default && <span className="badge badge-orange">DEFAULT</span>}
                  {!card.default && <button className="label-sm text-[#bfc5cc]/40 hover:text-[#ff5a00] transition-colors">SET DEFAULT</button>}
                  <button className="label-sm text-[#bfc5cc]/40 hover:text-red-400 transition-colors">REMOVE</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment history */}
        <div>
          <p className="label-sm mb-4">PAYMENT HISTORY</p>
          <div className="border border-white/5 overflow-hidden">
            <table className="orvex-table w-full">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>DESCRIPTION</th>
                  <th>METHOD</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENT_HISTORY.map((p) => (
                  <tr key={p.id}>
                    <td><p className="label-sm text-[#bfc5cc]/40">{p.date}</p></td>
                    <td><p className="text-[#bfc5cc] text-xs">{p.description}</p></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <CreditCard size={11} className="text-[#bfc5cc]/40" />
                        <p className="text-[#bfc5cc] text-xs">{p.method}</p>
                      </div>
                    </td>
                    <td><p className="text-[#f5f7f8] text-xs">${p.amount.toLocaleString()}</p></td>
                    <td><span className="badge badge-green">{p.status.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
