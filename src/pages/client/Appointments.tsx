import ClientLayout from "@/components/ClientLayout";
import { bookings } from "@/data/seed";
import { Calendar, Clock, Video, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "badge-green",
  pending: "badge-gray",
  completed: "badge-cyan",
  cancelled: "badge-red",
  rescheduled: "badge-orange",
  no_show: "badge-red",
};

const clientBookings = bookings.slice(0, 3);

export default function ClientAppointments() {
  const upcoming = clientBookings.filter(b => b.status === "confirmed" || b.status === "pending");
  const past = clientBookings.filter(b => b.status === "completed" || b.status === "cancelled");

  return (
    <ClientLayout>
      <div className="p-8 max-w-[800px]">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="label-sm text-[#bfc5cc]/40 mb-1">CLIENT PORTAL</p>
            <h1 className="text-2xl font-700 text-[#f5f7f8]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>APPOINTMENTS</h1>
          </div>
          <Link to="/book" className="btn-primary text-sm">
            BOOK CALL <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Upcoming */}
        <div className="mb-10">
          <p className="label-sm mb-4">UPCOMING</p>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((booking) => (
                <div key={booking.id} className="border border-white/8 bg-[#14171b]/40 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-700 text-[#f5f7f8] text-sm mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>{booking.type}</p>
                      <p className="label-sm text-[#bfc5cc]/40">{booking.bookingRef}</p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[booking.status] ?? "badge-gray"}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-[#ff5a00]" />
                      <p className="text-[#bfc5cc] text-xs">{booking.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-[#ff5a00]" />
                      <p className="text-[#bfc5cc] text-xs">{booking.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video size={12} className="text-[#bfc5cc]/40" />
                      <p className="text-[#bfc5cc]/40 text-xs">Google Meet</p>
                    </div>
                  </div>
                  {booking.notes && (
                    <p className="text-[#bfc5cc]/50 text-xs border-t border-white/5 pt-3 mt-3">{booking.notes}</p>
                  )}
                  <div className="flex gap-3 mt-4 pt-3 border-t border-white/5">
                    <button className="btn-primary text-xs py-1.5 px-4">JOIN MEETING</button>
                    <button className="btn-ghost text-xs">RESCHEDULE</button>
                    <button className="label-sm text-[#bfc5cc]/40 hover:text-red-400 transition-colors ml-auto">CANCEL</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-white/5 p-8 text-center">
              <Calendar size={24} className="text-[#bfc5cc]/20 mx-auto mb-3" />
              <p className="text-[#bfc5cc]/40 text-sm mb-4">No upcoming appointments</p>
              <Link to="/book" className="btn-primary text-sm">BOOK A CALL</Link>
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <p className="label-sm mb-4">PAST APPOINTMENTS</p>
            <div className="space-y-2">
              {past.map((booking) => (
                <div key={booking.id} className="border border-white/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[#bfc5cc] text-sm">{booking.type}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="label-sm text-[#bfc5cc]/40">{booking.date}</p>
                      <p className="label-sm text-[#bfc5cc]/40">{booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${STATUS_COLORS[booking.status] ?? "badge-gray"}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
