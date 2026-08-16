import { createContext, useContext, useState, type ReactNode } from "react";
import {
  projects as seedProjects, services as seedServices, orders as seedOrders,
  bookings as seedBookings, customers as seedCustomers, messages as seedMessages,
  invoices as seedInvoices, journalPosts as seedJournal, testimonials as seedTestimonials,
  auditLog as seedAudit,
  type Project, type Service, type Order, type Booking, type Customer,
  type Message, type Invoice, type JournalPost, type Testimonial,
} from "@/data/seed";

// ── Extended types ──────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  source: "website" | "referral" | "social" | "email" | "other";
  stage: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  value: number;
  notes: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentRef: string;
  customer: string;
  email: string;
  invoiceNumber: string;
  amount: number;
  method: "stripe" | "bank_transfer" | "crypto" | "paypal";
  status: "pending" | "completed" | "failed" | "refunded";
  processedAt: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  type: "image" | "video" | "document";
  size: number;
  url: string;
  alt: string;
  tags: string[];
  uploadedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
}

export interface SEOSettings {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  ogImage: string;
  twitterHandle: string;
  googleAnalyticsId: string;
  indexing: boolean;
}

export interface SystemSettings {
  studioName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  taxRate: number;
  depositPercent: number;
  timezone: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  bookingEnabled: boolean;
}

export interface AppointmentType {
  id: string;
  name: string;
  description: string;
  duration: number;
  color: string;
  active: boolean;
}

export interface BookingSettings {
  workingDays: boolean[];
  workingHoursStart: string;
  workingHoursEnd: string;
  timezone: string;
  defaultDuration: number;
  bufferTime: number;
  blockedDates: string[];
  holidays: string[];
  minimumNoticeHours: number;
  maximumAdvanceDays: number;
  appointmentTypes: AppointmentType[];
}

export interface AuditEntry {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "DRAFT" | "LOGIN" | "VIEW";
  entity: string;
  entityId: string;
  entityName: string;
  user: string;
  timestamp: string;
  detail: string;
}

// ── Store shape ─────────────────────────────────────────────────────────────

interface AdminStore {
  projects: Project[];
  services: Service[];
  orders: Order[];
  bookings: Booking[];
  customers: Customer[];
  messages: Message[];
  invoices: Invoice[];
  journalPosts: JournalPost[];
  testimonials: Testimonial[];
  leads: Lead[];
  payments: Payment[];
  media: MediaItem[];
  users: AdminUser[];
  seo: SEOSettings;
  settings: SystemSettings;
  auditLog: AuditEntry[];
  bookingSettings: BookingSettings;
}

export interface EntityOps<T extends { id: string }> {
  add: (item: T) => void;
  edit: (id: string, partial: Partial<T>) => void;
  del: (id: string) => void;
}

type ArrayKeys = "projects" | "services" | "orders" | "bookings" | "customers" | "messages" | "invoices" | "journalPosts" | "testimonials" | "leads" | "payments" | "media" | "users";

interface AdminContextType {
  projects: Project[];
  services: Service[];
  orders: Order[];
  bookings: Booking[];
  customers: Customer[];
  messages: Message[];
  invoices: Invoice[];
  journalPosts: JournalPost[];
  testimonials: Testimonial[];
  leads: Lead[];
  payments: Payment[];
  media: MediaItem[];
  users: AdminUser[];
  seo: SEOSettings;
  settings: SystemSettings;
  auditLog: AuditEntry[];
  bookingSettings: BookingSettings;
  projects_: EntityOps<Project>;
  services_: EntityOps<Service>;
  orders_: EntityOps<Order>;
  bookings_: EntityOps<Booking>;
  customers_: EntityOps<Customer>;
  messages_: EntityOps<Message>;
  invoices_: EntityOps<Invoice>;
  journalPosts_: EntityOps<JournalPost>;
  testimonials_: EntityOps<Testimonial>;
  leads_: EntityOps<Lead>;
  payments_: EntityOps<Payment>;
  media_: EntityOps<MediaItem>;
  users_: EntityOps<AdminUser>;
  updateSEO: (partial: Partial<SEOSettings>) => void;
  updateSettings: (partial: Partial<SystemSettings>) => void;
  updateBookingSettings: (partial: Partial<BookingSettings>) => void;
  addAudit: (entry: Omit<AuditEntry, "id" | "timestamp" | "user">) => void;
  resetStore: () => void;
}

// ── Seed extras ──────────────────────────────────────────────────────────────

const seedLeads: Lead[] = [
  { id: "L001", name: "Rania Khalil", email: "rania@designstudio.ae", company: "Design Studio AE", phone: "+971 50 123 4567", source: "website", stage: "new", value: 7500, notes: "Luxury perfume CGI campaign — 6 bottles, 4 colorways", assignedTo: "Admin", createdAt: "2026-08-13", updatedAt: "2026-08-13" },
  { id: "L002", name: "James Okafor", email: "james@gamedev.studio", company: "Pixel Forge", phone: "+44 7911 123456", source: "referral", stage: "qualified", value: 22500, notes: "Fantasy biome UE5 environment, 1km² terrain", assignedTo: "Admin", createdAt: "2026-08-12", updatedAt: "2026-08-12" },
  { id: "L003", name: "Leila Sousa", email: "leila@architectsco.br", company: "Architects Co.", phone: "+55 11 9876 5432", source: "social", stage: "proposal", value: 32000, notes: "12-building residential complex, São Paulo", assignedTo: "Admin", createdAt: "2026-08-11", updatedAt: "2026-08-11" },
  { id: "L004", name: "Takashi Mori", email: "t.mori@fusionbrand.jp", company: "Fusion Brand", phone: "+81 90 5678 1234", source: "email", stage: "contacted", value: 12000, notes: "Tech product launch campaign", assignedTo: "Admin", createdAt: "2026-08-08", updatedAt: "2026-08-09" },
  { id: "L005", name: "Sofia Bernardi", email: "sofia@luxeinteriors.it", company: "Luxe Interiors", phone: "+39 02 1234 5678", source: "referral", stage: "won", value: 18000, notes: "Luxury apartment visualization, 6 units", assignedTo: "Admin", createdAt: "2026-07-20", updatedAt: "2026-08-01" },
  { id: "L006", name: "Ahmed Al-Rashid", email: "ahmed@techvision.sa", company: "TechVision", phone: "+966 50 999 8888", source: "website", stage: "lost", value: 9000, notes: "Budget too low for scope requested", assignedTo: "Admin", createdAt: "2026-07-10", updatedAt: "2026-07-25" },
];

const seedPayments: Payment[] = [
  { id: "P001", paymentRef: "PAY-2026-0041", customer: "Marcus Webb", email: "marcus@axiom.tech", invoiceNumber: "INV-2026-0041", amount: 3800, method: "stripe", status: "completed", processedAt: "2026-08-10", createdAt: "2026-07-28" },
  { id: "P002", paymentRef: "PAY-2026-0042", customer: "Priya Nakamura", email: "priya@studiovantage.com", invoiceNumber: "INV-2026-0042", amount: 19000, method: "bank_transfer", status: "completed", processedAt: "2026-08-05", createdAt: "2026-08-01" },
  { id: "P003", paymentRef: "PAY-2026-0043", customer: "Kai Bergström", email: "kai@vrex.studio", invoiceNumber: "INV-2026-0043", amount: 4500, method: "stripe", status: "completed", processedAt: "2026-07-30", createdAt: "2026-07-15" },
  { id: "P004", paymentRef: "PAY-2026-0044", customer: "Sarah Chen", email: "sarah@techcorp.com", invoiceNumber: "INV-2026-0044", amount: 600, method: "paypal", status: "pending", processedAt: "", createdAt: "2026-08-12" },
];

const seedMedia: MediaItem[] = [
  { id: "M001", filename: "orbital-hero.jpg", type: "image", size: 2450000, url: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=500&fit=crop&auto=format", alt: "ORBITAL project hero render", tags: ["project", "hero", "motion"], uploadedAt: "2026-08-01" },
  { id: "M002", filename: "axiom-product-01.jpg", type: "image", size: 3200000, url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=500&fit=crop&auto=format", alt: "AXIOM watch render", tags: ["product", "client", "cgi"], uploadedAt: "2026-07-28" },
  { id: "M003", filename: "meridian-exterior.jpg", type: "image", size: 4100000, url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=500&fit=crop&auto=format", alt: "MERIDIAN exterior visualization", tags: ["architecture", "exterior"], uploadedAt: "2026-07-20" },
  { id: "M004", filename: "studio-background.jpg", type: "image", size: 1800000, url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop&auto=format", alt: "Studio space background", tags: ["studio"], uploadedAt: "2026-07-15" },
  { id: "M005", filename: "vertex-brand.jpg", type: "image", size: 2900000, url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop&auto=format", alt: "VERTEX brand motion still", tags: ["brand", "motion", "identity"], uploadedAt: "2026-07-10" },
  { id: "M006", filename: "stratum-environment.jpg", type: "image", size: 3600000, url: "https://images.unsplash.com/photo-1501862700950-18382cd41497?w=800&h=500&fit=crop&auto=format", alt: "STRATUM digital environment", tags: ["environment", "experimental"], uploadedAt: "2026-07-05" },
];

const seedAdminUsers: AdminUser[] = [
  { id: "U001", name: "ORVEX Admin", email: "admin@orvex.studio", role: "super_admin", status: "active", lastLogin: "2026-08-13", createdAt: "2026-01-01" },
  { id: "U002", name: "Studio Editor", email: "editor@orvex.studio", role: "editor", status: "active", lastLogin: "2026-08-10", createdAt: "2026-03-15" },
  { id: "U003", name: "Guest Viewer", email: "guest@orvex.studio", role: "viewer", status: "inactive", lastLogin: "2026-07-01", createdAt: "2026-05-20" },
];

const defaultSEO: SEOSettings = {
  siteTitle: "ORVEX — Premium 3D & CGI Studio",
  siteDescription: "Award-level 3D design, CGI visualization, and motion studio. We create photorealistic renders, dimensional brand identities, and cinematic motion for technology and luxury brands.",
  keywords: "3D studio, CGI visualization, product renders, motion design, architectural visualization, brand animation",
  ogImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&h=630&fit=crop&auto=format",
  twitterHandle: "@orvex_studio",
  googleAnalyticsId: "G-XXXXXXXXXX",
  indexing: true,
};

const defaultBookingSettings: BookingSettings = {
  workingDays: [false, true, true, true, true, true, false], // Mon–Fri
  workingHoursStart: "09:00",
  workingHoursEnd: "18:00",
  timezone: "America/Los_Angeles",
  defaultDuration: 60,
  bufferTime: 15,
  blockedDates: [],
  holidays: [],
  minimumNoticeHours: 24,
  maximumAdvanceDays: 60,
  appointmentTypes: [
    { id: "apt-1", name: "Discovery Call", description: "Initial consultation to discuss your project goals", duration: 30, color: "#3b82f6", active: true },
    { id: "apt-2", name: "Project Kickoff", description: "Deep-dive session to align on brief, scope and timeline", duration: 60, color: "#10b981", active: true },
    { id: "apt-3", name: "Design Review", description: "Structured critique and feedback on delivered work", duration: 60, color: "#f59e0b", active: true },
    { id: "apt-4", name: "Strategy Workshop", description: "Collaborative brand or campaign strategy session", duration: 90, color: "#8b5cf6", active: true },
  ],
};

const defaultSettings: SystemSettings = {
  studioName: "ORVEX Studio",
  email: "studio@orvex.studio",
  phone: "+1 (555) 000-0000",
  address: "100 Design District, Los Angeles, CA 90001",
  currency: "USD",
  taxRate: 0,
  depositPercent: 50,
  timezone: "America/Los_Angeles",
  maintenanceMode: false,
  emailNotifications: true,
  bookingEnabled: true,
};

// ── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "orvex_admin_v3";

function loadStore(): AdminStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveStore(s: AdminStore) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

function buildInitial(): AdminStore {
  const saved = loadStore();
  if (saved?.projects) {
    // Migrate: add bookingSettings if missing from older saved store
    if (!saved.bookingSettings) {
      saved.bookingSettings = { ...defaultBookingSettings, appointmentTypes: [...defaultBookingSettings.appointmentTypes] };
    }
    return saved;
  }
  return {
    projects: [...seedProjects],
    services: [...seedServices],
    orders: [...seedOrders],
    bookings: [...seedBookings],
    customers: [...seedCustomers],
    messages: [...seedMessages],
    invoices: [...seedInvoices],
    journalPosts: [...seedJournal],
    testimonials: [...seedTestimonials],
    leads: [...seedLeads],
    payments: [...seedPayments],
    media: [...seedMedia],
    users: [...seedAdminUsers],
    seo: { ...defaultSEO },
    settings: { ...defaultSettings },
    auditLog: seedAudit.map((a) => ({
      id: a.id,
      action: a.action as AuditEntry["action"],
      entity: a.entity,
      entityId: a.id,
      entityName: a.entityName,
      user: a.user,
      timestamp: a.timestamp,
      detail: a.detail,
    })),
    bookingSettings: { ...defaultBookingSettings, appointmentTypes: [...defaultBookingSettings.appointmentTypes] },
  };
}

// ── Context ──────────────────────────────────────────────────────────────────

const AdminCtx = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<AdminStore>(buildInitial);

  function buildAuditEntry(
    action: AuditEntry["action"],
    entity: string,
    entityId: string,
    entityName: string,
    detail?: string
  ): AuditEntry {
    return {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action,
      entity,
      entityId,
      entityName,
      user: "Admin",
      timestamp: new Date().toISOString(),
      detail: detail ?? `${action} ${entity}: ${entityName}`,
    };
  }

  function makeOps<T extends { id: string }>(
    key: ArrayKeys,
    nameOf: (t: T) => string
  ): EntityOps<T> {
    const getArr = (s: AdminStore) => (s[key] as unknown) as T[];
    return {
      add: (item: T) =>
        setStore((prev) => {
          const entry = buildAuditEntry("CREATE", key, item.id, nameOf(item));
          const next: AdminStore = {
            ...prev,
            [key]: [...getArr(prev), item],
            auditLog: [entry, ...prev.auditLog],
          };
          saveStore(next);
          return next;
        }),
      edit: (id: string, partial: Partial<T>) =>
        setStore((prev) => {
          const existing = getArr(prev).find((i) => i.id === id);
          const name = existing ? nameOf(existing) : id;
          const entry = buildAuditEntry("UPDATE", key, id, name);
          const next: AdminStore = {
            ...prev,
            [key]: getArr(prev).map((i) => (i.id === id ? { ...i, ...partial } : i)),
            auditLog: [entry, ...prev.auditLog],
          };
          saveStore(next);
          return next;
        }),
      del: (id: string) =>
        setStore((prev) => {
          const existing = getArr(prev).find((i) => i.id === id);
          const name = existing ? nameOf(existing) : id;
          const entry = buildAuditEntry("DELETE", key, id, name);
          const next: AdminStore = {
            ...prev,
            [key]: getArr(prev).filter((i) => i.id !== id),
            auditLog: [entry, ...prev.auditLog],
          };
          saveStore(next);
          return next;
        }),
    };
  }

  const updateSEO = (partial: Partial<SEOSettings>) =>
    setStore((prev) => {
      const next: AdminStore = { ...prev, seo: { ...prev.seo, ...partial } };
      saveStore(next);
      return next;
    });

  const updateSettings = (partial: Partial<SystemSettings>) =>
    setStore((prev) => {
      const next: AdminStore = { ...prev, settings: { ...prev.settings, ...partial } };
      saveStore(next);
      return next;
    });

  const updateBookingSettings = (partial: Partial<BookingSettings>) =>
    setStore((prev) => {
      const next: AdminStore = { ...prev, bookingSettings: { ...prev.bookingSettings, ...partial } };
      saveStore(next);
      return next;
    });

  const addAudit = (entry: Omit<AuditEntry, "id" | "timestamp" | "user">) =>
    setStore((prev) => {
      const full = buildAuditEntry(entry.action, entry.entity, entry.entityId, entry.entityName, entry.detail);
      const next: AdminStore = { ...prev, auditLog: [full, ...prev.auditLog] };
      saveStore(next);
      return next;
    });

  const resetStore = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStore(buildInitial());
  };

  const value: AdminContextType = {
    ...store,
    projects_: makeOps<Project>("projects", (p) => p.title),
    services_: makeOps<Service>("services", (s) => s.title),
    orders_: makeOps<Order>("orders", (o) => o.orderId),
    bookings_: makeOps<Booking>("bookings", (b) => b.bookingRef),
    customers_: makeOps<Customer>("customers", (c) => c.name),
    messages_: makeOps<Message>("messages", (m) => m.subject),
    invoices_: makeOps<Invoice>("invoices", (i) => i.invoiceNumber),
    journalPosts_: makeOps<JournalPost>("journalPosts", (j) => j.title),
    testimonials_: makeOps<Testimonial>("testimonials", (t) => t.name),
    leads_: makeOps<Lead>("leads", (l) => l.name),
    payments_: makeOps<Payment>("payments", (p) => p.paymentRef),
    media_: makeOps<MediaItem>("media", (m) => m.filename),
    users_: makeOps<AdminUser>("users", (u) => u.name),
    updateSEO,
    updateSettings,
    updateBookingSettings,
    addAudit,
    resetStore,
  };

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be inside AdminProvider");
  return ctx;
}

export type { Project, Service, Order, Booking, Customer, Message, Invoice, JournalPost, Testimonial };
