import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Video } from "lucide-react";
import Layout from "@/components/Layout";

const CALL_TYPES = [
  { id: "discovery", label: "DISCOVERY CALL", desc: "30 minutes. Explore your project, ask questions.", duration: "30 min", icon: "◎" },
  { id: "project", label: "PROJECT CONSULTATION", desc: "60 minutes. Deep dive into scope, timeline, and creative direction.", duration: "60 min", icon: "◈" },
  { id: "creative", label: "CREATIVE CONSULTATION", desc: "45 minutes. Visual direction, references, mood.", duration: "45 min", icon: "◇" },
  { id: "technical", label: "TECHNICAL CONSULTATION", desc: "60 minutes. Pipeline, formats, technical requirements.", duration: "60 min", icon: "◆" },
];

const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function BookCall() {
  const [step, setStep] = useState(1);
  const [callType, setCallType] = useState("");
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", notes: "" });
  const [confirmed, setConfirmed] = useState(false);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDay(calYear, calMonth);
  const disabledDays = [0, 6]; // Sun, Sat

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 800));
    setConfirmed(true);
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const bookingRef = `ORVEX-BOOK-${calYear}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

  if (confirmed) {
    return (
      <Layout>
        <section className="min-h-screen flex items-center justify-center px-8">
          <div className="text-center max-w-lg">
            <div className="w-16 h-16 border border-[#ff5a00] rounded-full flex items-center justify-center mx-auto mb-10">
              <div className="w-4 h-4 bg-[#ff5a00] rounded-full" />
            </div>
            <p className="label-orange mb-4">BOOKING CONFIRMED</p>
            <h1 className="text-4xl font-700 text-[#f5f7f8] mb-6 tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
              SEE YOU SOON.
            </h1>
            <p className="text-[#bfc5cc] mb-8">
              Your {CALL_TYPES.find(t => t.id === callType)?.label} is confirmed for {selectedDate} at {selectedTime}.
            </p>
            <div className="border border-white/10 p-6 mb-8 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="label-sm text-[#bfc5cc]/40 mb-1">BOOKING REF</p><p className="text-[#ff5a00] text-sm font-600" style={{ fontWeight: 600 }}>{bookingRef}</p></div>
                <div><p className="label-sm text-[#bfc5cc]/40 mb-1">TYPE</p><p className="text-[#f5f7f8] text-sm">{CALL_TYPES.find(t => t.id === callType)?.label}</p></div>
                <div><p className="label-sm text-[#bfc5cc]/40 mb-1">DATE</p><p className="text-[#f5f7f8] text-sm">{selectedDate}</p></div>
                <div><p className="label-sm text-[#bfc5cc]/40 mb-1">TIME</p><p className="text-[#f5f7f8] text-sm">{selectedTime} UTC</p></div>
              </div>
            </div>
            <p className="text-[#bfc5cc] text-sm mb-8">
              A calendar invite and video call link have been sent to {form.email}.
            </p>
            <a href="/" className="btn-secondary">RETURN TO ORVEX</a>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-36 pb-20 px-8 md:px-12 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <p className="label-orange mb-6">SCHEDULE A SESSION</p>
          <h1 className="text-[clamp(36px,5vw,80px)] font-700 tracking-[-0.04em] text-[#f5f7f8] leading-[0.92]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            BOOK A CALL
          </h1>
        </div>
      </section>

      {/* Progress */}
      <div className="px-8 md:px-12 py-4 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto flex items-center gap-0">
          {["SELECT TYPE", "CHOOSE DATE", "YOUR DETAILS", "CONFIRM"].map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step > i + 1 ? "text-[#ff5a00]" : step === i + 1 ? "text-[#f5f7f8]" : "text-[#bfc5cc]/30"}`}>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-700 flex-shrink-0 ${
                  step > i + 1 ? "border-[#ff5a00] bg-[#ff5a00]/10" : step === i + 1 ? "border-[#f5f7f8]" : "border-white/10"
                }`} style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  {i + 1}
                </div>
                <span className="label-sm hidden md:block">{label}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-[1px] mx-3 ${step > i + 1 ? "bg-[#ff5a00]/40" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>
      </div>

      <section className="py-16 px-8 md:px-12 min-h-[60vh]">
        <div className="max-w-[900px] mx-auto">
          {/* Step 1 — Call type */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-700 text-[#f5f7f8] mb-10" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>What type of session?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CALL_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCallType(type.id)}
                    className={`text-left p-6 border transition-all ${callType === type.id ? "border-[#ff5a00] bg-[#ff5a00]/05" : "border-white/10 hover:border-white/30"}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-[#ff5a00] text-2xl">{type.icon}</span>
                      <div className="flex items-center gap-2 label-sm text-[#bfc5cc]/60">
                        <Clock size={10} /> {type.duration}
                      </div>
                    </div>
                    <p className="font-700 text-[#f5f7f8] text-sm mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{type.label}</p>
                    <p className="text-[#bfc5cc] text-xs leading-relaxed">{type.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3 text-[#bfc5cc]/50 text-sm">
                <Video size={14} className="text-[#bfc5cc]/40" /> All sessions are conducted via Google Meet or Zoom.
              </div>
              <div className="mt-8">
                <button
                  disabled={!callType}
                  onClick={() => setStep(2)}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  SELECT DATE <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Calendar */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-700 text-[#f5f7f8] mb-10" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>Choose a date and time</h2>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-10">
                {/* Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-[#ff5a00] hover:text-[#ff5a00] transition-colors text-[#bfc5cc]">
                      <ChevronLeft size={14} />
                    </button>
                    <p className="font-600 text-[#f5f7f8] text-sm" style={{ fontWeight: 600 }}>{MONTHS[calMonth]} {calYear}</p>
                    <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-[#ff5a00] hover:text-[#ff5a00] transition-colors text-[#bfc5cc]">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <div key={d} className="text-center label-sm text-[#bfc5cc]/30 py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1;
                      const date = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const dayOfWeek = new Date(calYear, calMonth, day).getDay();
                      const isPast = new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const disabled = disabledDays.includes(dayOfWeek) || isPast;
                      const selected = selectedDate === date;
                      return (
                        <button
                          key={day}
                          disabled={disabled}
                          onClick={() => setSelectedDate(date)}
                          className={`aspect-square flex items-center justify-center text-sm transition-all ${
                            disabled ? "text-[#bfc5cc]/20 cursor-not-allowed" :
                            selected ? "bg-[#ff5a00] text-[#050608] font-700" :
                            "text-[#bfc5cc] hover:bg-[#14171b] hover:text-[#f5f7f8]"
                          }`}
                          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: selected ? 700 : 400 }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <p className="label-sm mb-6">{selectedDate ? `AVAILABLE TIMES — ${selectedDate}` : "SELECT A DATE FIRST"}</p>
                  {selectedDate ? (
                    <div className="grid grid-cols-3 gap-2">
                      {TIMES.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 border text-sm font-600 transition-all ${
                            selectedTime === time
                              ? "border-[#ff5a00] bg-[#ff5a00]/10 text-[#ff5a00]"
                              : "border-white/10 text-[#bfc5cc] hover:border-white/30 hover:text-[#f5f7f8]"
                          }`}
                          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-white/5 h-40 flex items-center justify-center">
                      <p className="label-sm text-[#bfc5cc]/30">SELECT DATE →</p>
                    </div>
                  )}
                  {selectedDate && selectedTime && (
                    <div className="mt-6 border border-[#ff5a00]/20 bg-[#ff5a00]/03 p-4">
                      <p className="label-orange mb-1">SELECTED</p>
                      <p className="text-[#f5f7f8] text-sm">{selectedDate} at {selectedTime} UTC</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-10 flex items-center gap-4">
                <button onClick={() => setStep(1)} className="btn-ghost"><ChevronLeft size={14} /> BACK</button>
                <button
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}
                  className="btn-primary disabled:opacity-40"
                >
                  YOUR DETAILS <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Details */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-700 text-[#f5f7f8] mb-10" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>Your details</h2>
              <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="orvex-label">Full Name *</label><input required value={form.name} onChange={set("name")} className="orvex-input" placeholder="Your name" /></div>
                  <div><label className="orvex-label">Email *</label><input required type="email" value={form.email} onChange={set("email")} className="orvex-input" placeholder="your@email.com" /></div>
                  <div><label className="orvex-label">Company</label><input value={form.company} onChange={set("company")} className="orvex-input" placeholder="Your company" /></div>
                  <div><label className="orvex-label">Phone</label><input type="tel" value={form.phone} onChange={set("phone")} className="orvex-input" placeholder="+1 555 000 0000" /></div>
                </div>
                <div><label className="orvex-label">Project Notes</label><textarea value={form.notes} onChange={set("notes")} className="orvex-input resize-none" rows={4} placeholder="Brief description of your project, any specific questions..." /></div>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-ghost"><ChevronLeft size={14} /> BACK</button>
                  <button type="submit" className="btn-primary">REVIEW BOOKING <ArrowRight size={14} /></button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4 — Confirm */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-700 text-[#f5f7f8] mb-10" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>Confirm your booking</h2>
              <div className="border border-white/10 p-8 mb-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div><p className="label-sm text-[#bfc5cc]/40 mb-2">SESSION TYPE</p><p className="text-[#f5f7f8] text-sm">{CALL_TYPES.find(t => t.id === callType)?.label}</p></div>
                  <div><p className="label-sm text-[#bfc5cc]/40 mb-2">DATE</p><p className="text-[#f5f7f8] text-sm">{selectedDate}</p></div>
                  <div><p className="label-sm text-[#bfc5cc]/40 mb-2">TIME</p><p className="text-[#f5f7f8] text-sm">{selectedTime} UTC</p></div>
                  <div><p className="label-sm text-[#bfc5cc]/40 mb-2">DURATION</p><p className="text-[#f5f7f8] text-sm">{CALL_TYPES.find(t => t.id === callType)?.duration}</p></div>
                </div>
                <div className="border-t border-white/5 pt-6 grid grid-cols-2 gap-6">
                  <div><p className="label-sm text-[#bfc5cc]/40 mb-2">NAME</p><p className="text-[#f5f7f8] text-sm">{form.name}</p></div>
                  <div><p className="label-sm text-[#bfc5cc]/40 mb-2">EMAIL</p><p className="text-[#f5f7f8] text-sm">{form.email}</p></div>
                </div>
              </div>
              <p className="text-[#bfc5cc] text-sm mb-8">
                A calendar invite with a video call link will be sent to <strong className="text-[#f5f7f8]">{form.email}</strong> upon confirmation.
              </p>
              <form onSubmit={handleConfirm} className="flex items-center gap-4">
                <button type="button" onClick={() => setStep(3)} className="btn-ghost"><ChevronLeft size={14} /> BACK</button>
                <button type="submit" className="btn-primary">CONFIRM BOOKING <ArrowRight size={14} /></button>
              </form>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
