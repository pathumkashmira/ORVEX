import { useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import { Send, MessageSquare } from "lucide-react";

const THREAD = [
  {
    id: "m1",
    from: "ORVEX Studio",
    isStudio: true,
    time: "2026-08-10 09:32",
    body: "Hi Marcus — just a quick update on the AXIOM CGI Campaign. We've completed the MOTION phase and the renders are looking exceptional. You'll receive a preview link within 24 hours. We're on track for the Aug 28 delivery.",
  },
  {
    id: "m2",
    from: "Marcus Webb",
    isStudio: false,
    time: "2026-08-10 10:15",
    body: "Great news — looking forward to seeing the previews. Quick question: is it possible to get a high-res still of the hero angle before the full package is ready? We need it for a press release going out on the 12th.",
  },
  {
    id: "m3",
    from: "ORVEX Studio",
    isStudio: true,
    time: "2026-08-10 10:48",
    body: "Absolutely. We'll have a 4K still of the hero angle ready by EOD today. We'll send it directly to this thread. No issues with the press release timeline — let us know if you need any specific crop or format.",
  },
  {
    id: "m4",
    from: "Marcus Webb",
    isStudio: false,
    time: "2026-08-10 11:02",
    body: "Perfect, thank you. Standard 16:9 at max resolution works. Really appreciate the quick turnaround.",
  },
  {
    id: "m5",
    from: "ORVEX Studio",
    isStudio: true,
    time: "2026-08-10 16:44",
    body: "Here you go — the hero still is attached. File is 7680×4320px TIFF, also included a JPEG at 4K for web use. Let us know if you need anything else before delivery.",
  },
];

export default function ClientMessages() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [localMessages, setLocalMessages] = useState(THREAD);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLocalMessages(prev => [...prev, {
      id: `m${Date.now()}`,
      from: "Marcus Webb",
      isStudio: false,
      time: new Date().toISOString().slice(0, 16).replace("T", " "),
      body: message.trim(),
    }]);
    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <ClientLayout>
      <div className="flex flex-col h-full max-w-[800px]">
        <div className="p-8 pb-4 border-b border-white/5 flex-shrink-0">
          <p className="label-sm text-[#bfc5cc]/40 mb-1">CLIENT PORTAL</p>
          <h1 className="text-2xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>MESSAGES</h1>
        </div>

        {/* Project context */}
        <div className="px-8 py-4 bg-[#14171b]/40 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#ff5a00]" />
            <p className="text-[#bfc5cc] text-sm">AXIOM CGI Campaign</p>
            <span className="badge badge-orange ml-2">ACTIVE PROJECT</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {localMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isStudio ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] ${msg.isStudio ? "order-2" : ""}`}>
                <div className={`flex items-center gap-2 mb-2 ${msg.isStudio ? "" : "justify-end"}`}>
                  {msg.isStudio && (
                    <div className="w-6 h-6 bg-[#ff5a00] flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] font-700 text-[#050608]" style={{ fontWeight: 700 }}>OX</span>
                    </div>
                  )}
                  <p className="label-sm text-[#bfc5cc]/40">{msg.from}</p>
                  <p className="label-sm text-[#bfc5cc]/30">{msg.time}</p>
                </div>
                <div className={`p-4 text-sm leading-relaxed ${
                  msg.isStudio
                    ? "bg-[#14171b] border border-white/5 text-[#bfc5cc]"
                    : "bg-[#ff5a00]/10 border border-[#ff5a00]/20 text-[#f5f7f8]"
                }`}>
                  {msg.body}
                </div>
              </div>
            </div>
          ))}
          {sent && (
            <div className="flex justify-center">
              <p className="label-sm text-[#bfc5cc]/40">Message sent</p>
            </div>
          )}
        </div>

        {/* Compose */}
        <div className="px-8 py-6 border-t border-white/5 flex-shrink-0">
          <form onSubmit={handleSend} className="flex gap-0">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="orvex-input flex-1 text-sm"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-[#ff5a00] hover:bg-[#e05000] disabled:opacity-30 transition-colors px-4 flex items-center text-[#050608]"
            >
              <Send size={14} />
            </button>
          </form>
          <p className="text-[#bfc5cc]/30 text-xs mt-3 flex items-center gap-1">
            <MessageSquare size={10} /> ORVEX typically responds within 4 business hours.
          </p>
        </div>
      </div>
    </ClientLayout>
  );
}
