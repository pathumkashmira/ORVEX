import { useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import { useAdmin } from "@/contexts/AdminContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/contexts/ToastContext";
import { Download, FileText } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  paid: "badge-green",
  partially_paid: "badge-cyan",
  pending: "badge-gray",
  overdue: "badge-red",
};

export default function ClientInvoices() {
  const { invoices } = useAdmin();
  const { user } = useApp();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);

  const userInvoices = invoices.filter((i) => (i as any).email === user?.email);
  const displayInvoices = userInvoices.length > 0 ? userInvoices : invoices;

  const inv = displayInvoices.find((i) => i.id === selected);

  function handleDownload() {
    toast.info("PDF Generation Coming Soon", "We're working on PDF export. You'll receive the invoice by email in the meantime.");
  }

  return (
    <ClientLayout>
      <div className="p-8 max-w-[1000px]">
        <div className="mb-8">
          <p className="label-sm text-[#bfc5cc]/40 mb-1">CLIENT PORTAL</p>
          <h1
            className="text-2xl text-[#f5f7f8]"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
          >
            INVOICES
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
          {/* Invoice list */}
          <div className="space-y-3">
            {displayInvoices.length === 0 && (
              <div className="border border-white/5 p-8 text-center">
                <FileText size={24} className="text-[#bfc5cc]/20 mx-auto mb-3" />
                <p className="text-[#bfc5cc]/40 text-sm">No invoices found.</p>
              </div>
            )}
            {displayInvoices.map((invoice) => (
              <button
                key={invoice.id}
                onClick={() => setSelected(invoice.id === selected ? null : invoice.id)}
                className={`w-full text-left border p-5 transition-colors ${
                  selected === invoice.id
                    ? "border-[#ff5a00]/40 bg-[#14171b]"
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-[#bfc5cc]/40 flex-shrink-0" />
                    <div>
                      <p
                        className="text-sm text-[#f5f7f8]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                      >
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-[#bfc5cc]/50 text-xs mt-0.5">{invoice.project}</p>
                    </div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[invoice.paymentStatus] ?? "badge-gray"}`}>
                    {invoice.paymentStatus.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-6">
                    <div>
                      <p className="label-sm text-[#bfc5cc]/40">TOTAL</p>
                      <p className="text-[#f5f7f8] text-sm">${invoice.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="label-sm text-[#bfc5cc]/40">BALANCE DUE</p>
                      <p className={`text-sm ${invoice.balance > 0 ? "text-[#ff5a00]" : "text-[#bfc5cc]"}`}>
                        ${invoice.balance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="label-sm text-[#bfc5cc]/40">DUE DATE</p>
                      <p className="text-[#bfc5cc] text-sm">{invoice.dueDate}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div>
            {inv ? (
              <div className="border border-white/8 bg-[#14171b]/40 p-6 sticky top-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p
                      className="text-base text-[#f5f7f8]"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                    >
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-[#bfc5cc]/50 text-xs mt-1">{inv.project}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[inv.paymentStatus] ?? "badge-gray"}`}>
                    {inv.paymentStatus.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 mb-6 border-b border-white/5 pb-6">
                  <div className="flex justify-between">
                    <p className="label-sm text-[#bfc5cc]/40">Subtotal</p>
                    <p className="text-[#bfc5cc] text-xs">${inv.subtotal.toLocaleString()}</p>
                  </div>
                  {inv.discount > 0 && (
                    <div className="flex justify-between">
                      <p className="label-sm text-[#bfc5cc]/40">Discount</p>
                      <p className="text-green-400 text-xs">-${inv.discount.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <p className="label-sm text-[#bfc5cc]/40">Tax</p>
                    <p className="text-[#bfc5cc] text-xs">${inv.tax.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[#f5f7f8] text-sm" style={{ fontWeight: 700 }}>Total</p>
                    <p className="text-[#f5f7f8] text-sm" style={{ fontWeight: 700 }}>${inv.total.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="label-sm text-[#bfc5cc]/40">Deposit paid</p>
                    <p className="text-[#bfc5cc] text-xs">-${inv.deposit.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[#ff5a00] text-sm" style={{ fontWeight: 700 }}>Balance due</p>
                    <p className="text-[#ff5a00] text-sm" style={{ fontWeight: 700 }}>${inv.balance.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs mb-6">
                  <div className="flex justify-between">
                    <p className="text-[#bfc5cc]/40">Issued</p>
                    <p className="text-[#bfc5cc]">{inv.createdAt}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[#bfc5cc]/40">Due</p>
                    <p className="text-[#bfc5cc]">{inv.dueDate}</p>
                  </div>
                </div>

                <button onClick={handleDownload} className="btn-primary w-full justify-center">
                  <Download size={12} /> DOWNLOAD PDF
                </button>
              </div>
            ) : (
              <div className="border border-white/5 p-8 text-center">
                <FileText size={24} className="text-[#bfc5cc]/20 mx-auto mb-3" />
                <p className="text-[#bfc5cc]/40 text-sm">Select an invoice to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
