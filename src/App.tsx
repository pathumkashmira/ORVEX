import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { useEffect, useRef, useState, type ReactNode } from "react";
import OrbitalTransition from "@/components/motion/OrbitalTransition";

// Public
import Home from "@/pages/Home";
import Work from "@/pages/Work";
import ProjectDetail from "@/pages/ProjectDetail";
import Services from "@/pages/Services";
import ServiceCheckout from "@/pages/ServiceCheckout";
import Studio from "@/pages/Studio";
import Experiments from "@/pages/Experiments";
import Process from "@/pages/Process";
import Journal from "@/pages/Journal";
import JournalPost from "@/pages/JournalPost";
import Contact from "@/pages/Contact";
import BookAppointment from "@/pages/BookAppointment";
import OrderConfirmation from "@/pages/OrderConfirmation";
import FAQ from "@/pages/FAQ";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Refund from "@/pages/Refund";
import NotFound from "@/pages/NotFound";

// Auth
import Login from "@/pages/auth/Login";

// Client
import ClientDashboard from "@/pages/client/Dashboard";
import ClientProjects from "@/pages/client/Projects";
import ClientOrders from "@/pages/client/Orders";
import ClientInvoices from "@/pages/client/Invoices";
import ClientPayments from "@/pages/client/Payments";
import ClientAppointments from "@/pages/client/Appointments";
import ClientMessages from "@/pages/client/Messages";
import ClientFiles from "@/pages/client/Files";
import ClientProfile from "@/pages/client/Profile";

// Admin
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProjects from "@/pages/admin/Projects";
import AdminServices from "@/pages/admin/Services";
import AdminOrders from "@/pages/admin/Orders";
import AdminBookings from "@/pages/admin/Bookings";
import AdminCustomers from "@/pages/admin/Customers";
import AdminInvoices from "@/pages/admin/Invoices";
import AdminPayments from "@/pages/admin/Payments";
import AdminMessages from "@/pages/admin/Messages";
import AdminJournal from "@/pages/admin/Journal";
import AdminMedia from "@/pages/admin/Media";
import AdminTestimonials from "@/pages/admin/Testimonials";
import AdminSettings from "@/pages/admin/Settings";
import AdminSEO from "@/pages/admin/SEO";
import AdminAnalytics from "@/pages/admin/Analytics";
import AdminUsers from "@/pages/admin/Users";
import AdminNotifications from "@/pages/admin/Notifications";
import AdminAuditLog from "@/pages/admin/AuditLog";
import AdminLeads from "@/pages/admin/Leads";
import AdminRoles from "@/pages/admin/Roles";
import AdminCalendar from "@/pages/admin/Calendar";
import AdminBookingSettings from "@/pages/admin/BookingSettings";

// Studio OS
import StudioOSDashboard from "@/pages/studio-os/Dashboard";
import StudioTeam from "@/pages/studio-os/Team";
import StudioTeamMember from "@/pages/studio-os/TeamMember";
import StudioAvailability from "@/pages/studio-os/Availability";
import StudioWorkload from "@/pages/studio-os/Workload";
import StudioTasks from "@/pages/studio-os/Tasks";

import type { AppRole } from "@/types/studio";

const ADMIN_ROLES: AppRole[] = ["SUPER_ADMIN", "ADMIN", "PROJECT_LEAD"];
const STUDIO_ROLES: AppRole[] = ["TEAM_COLLABORATOR", "PROJECT_LEAD", "ADMIN", "SUPER_ADMIN"];

function isAdminRole(role: AppRole) {
  return role !== null && ADMIN_ROLES.includes(role);
}

function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useApp();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminRole(user.role)) {
    return <Navigate to={user.role === "CLIENT" ? "/client" : "/studio-os"} replace />;
  }
  return <>{children}</>;
}

function ClientGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useApp();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "CLIENT") return <Navigate to="/studio-os" replace />;
  return <>{children}</>;
}

function StudioGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useApp();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!STUDIO_ROLES.includes(user.role)) return <Navigate to="/client" replace />;
  return <>{children}</>;
}

function AppShell() {
  const location = useLocation();
  const [transitionKey, setTransitionKey] = useState(0);
  const previousPath = useRef(location.pathname);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0);
    };
    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      setTransitionKey((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname]);

  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollPct / 100})` }} />
      <OrbitalTransition key={transitionKey} />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/work", element: <Work /> },
      { path: "/work/:slug", element: <ProjectDetail /> },
      { path: "/services", element: <Services /> },
      { path: "/checkout", element: <ServiceCheckout /> },
      { path: "/studio", element: <Studio /> },
      { path: "/experiments", element: <Experiments /> },
      { path: "/process", element: <Process /> },
      { path: "/journal", element: <Journal /> },
      { path: "/journal/:slug", element: <JournalPost /> },
      { path: "/contact", element: <Contact /> },
      { path: "/book", element: <BookAppointment /> },
      { path: "/order/:orderId", element: <OrderConfirmation /> },
      { path: "/faq", element: <FAQ /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/terms", element: <Terms /> },
      { path: "/refund", element: <Refund /> },
      { path: "/login", element: <Login /> },

      { path: "/client", element: <ClientGuard><ClientDashboard /></ClientGuard> },
      { path: "/client/projects", element: <ClientGuard><ClientProjects /></ClientGuard> },
      { path: "/client/orders", element: <ClientGuard><ClientOrders /></ClientGuard> },
      { path: "/client/invoices", element: <ClientGuard><ClientInvoices /></ClientGuard> },
      { path: "/client/payments", element: <ClientGuard><ClientPayments /></ClientGuard> },
      { path: "/client/appointments", element: <ClientGuard><ClientAppointments /></ClientGuard> },
      { path: "/client/messages", element: <ClientGuard><ClientMessages /></ClientGuard> },
      { path: "/client/files", element: <ClientGuard><ClientFiles /></ClientGuard> },
      { path: "/client/profile", element: <ClientGuard><ClientProfile /></ClientGuard> },

      { path: "/studio-os", element: <StudioGuard><StudioOSDashboard /></StudioGuard> },
      { path: "/studio-os/team", element: <StudioGuard><StudioTeam /></StudioGuard> },
      { path: "/studio-os/team/:id", element: <StudioGuard><StudioTeamMember /></StudioGuard> },
      { path: "/studio-os/availability", element: <StudioGuard><StudioAvailability /></StudioGuard> },
      { path: "/studio-os/workload", element: <StudioGuard><StudioWorkload /></StudioGuard> },
      { path: "/studio-os/tasks", element: <StudioGuard><StudioTasks /></StudioGuard> },

      { path: "/admin", element: <AdminGuard><AdminDashboard /></AdminGuard> },
      { path: "/admin/projects", element: <AdminGuard><AdminProjects /></AdminGuard> },
      { path: "/admin/services", element: <AdminGuard><AdminServices /></AdminGuard> },
      { path: "/admin/orders", element: <AdminGuard><AdminOrders /></AdminGuard> },
      { path: "/admin/bookings", element: <AdminGuard><AdminBookings /></AdminGuard> },
      { path: "/admin/customers", element: <AdminGuard><AdminCustomers /></AdminGuard> },
      { path: "/admin/invoices", element: <AdminGuard><AdminInvoices /></AdminGuard> },
      { path: "/admin/payments", element: <AdminGuard><AdminPayments /></AdminGuard> },
      { path: "/admin/messages", element: <AdminGuard><AdminMessages /></AdminGuard> },
      { path: "/admin/journal", element: <AdminGuard><AdminJournal /></AdminGuard> },
      { path: "/admin/media", element: <AdminGuard><AdminMedia /></AdminGuard> },
      { path: "/admin/testimonials", element: <AdminGuard><AdminTestimonials /></AdminGuard> },
      { path: "/admin/settings", element: <AdminGuard><AdminSettings /></AdminGuard> },
      { path: "/admin/seo", element: <AdminGuard><AdminSEO /></AdminGuard> },
      { path: "/admin/analytics", element: <AdminGuard><AdminAnalytics /></AdminGuard> },
      { path: "/admin/users", element: <AdminGuard><AdminUsers /></AdminGuard> },
      { path: "/admin/roles", element: <AdminGuard><AdminRoles /></AdminGuard> },
      { path: "/admin/leads", element: <AdminGuard><AdminLeads /></AdminGuard> },
      { path: "/admin/notifications", element: <AdminGuard><AdminNotifications /></AdminGuard> },
      { path: "/admin/audit", element: <AdminGuard><AdminAuditLog /></AdminGuard> },
      { path: "/admin/calendar", element: <AdminGuard><AdminCalendar /></AdminGuard> },
      { path: "/admin/booking-settings", element: <AdminGuard><AdminBookingSettings /></AdminGuard> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AdminProvider>
          <RouterProvider router={router} />
        </AdminProvider>
      </ToastProvider>
    </AppProvider>
  );
}
