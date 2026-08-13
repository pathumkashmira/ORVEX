import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  projects as seedProjects,
  services as seedServices,
  orders as seedOrders,
  bookings as seedBookings,
  customers as seedCustomers,
  messages as seedMessages,
  invoices as seedInvoices,
  journalPosts as seedJournal,
  testimonials as seedTestimonials,
  auditLog as seedAuditLog,
  type Project,
  type Service,
  type Order,
  type Booking,
  type Customer,
  type Message,
  type Invoice,
  type JournalPost,
  type Testimonial,
} from "@/data/seed";

// ── Extended types ──────────────────────────────────────────────────

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  projectType: string;
  budget: string;
  timeline: string;
  description: string;
  stage: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  source: string;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  reference: string;
  invoiceId: string;
  customer: string;
  amount: number;
  method: "card" | "bank" | "crypto" | "manual";
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
  note?: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  type: "image" | "video" | "document";
  size: number;
  alt: string;
  folder: string;
  createdAt: string;
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
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  ogImage: string;
  twitterHandle: string;
  googleAnalyticsId: string;
  robots: "index,follow" | "noindex,nofollow" | "index,nofollow";
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

export interface AuditEntry {
  id: string;
  timestamp: string;
  userName: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "DRAFT" | "LOGIN" | "VIEW";
  entity: string;
  entityId: string;
  entityName: string;
  details?: string;
}

// ── Seed data for new entities ──────────────────────────────────────

const SEED_LEADS: Lead[] = [
  { id: "1", name: "Rania Khalil", email: "rania@designstudio.ae", company: "Design Studio AE", phone: "+971 50 123 4567", projectType: "Product Visualization", budget: "$5,000–$10,000", timeline: "8 weeks", description: "Luxury perfume line CGI renders.", stage: "new", source: "contact_form", value: 7500, createdAt: "2026-08-13", updatedAt: "2026-08-13" },
  { id: "2", name: "James Okafor", email: "james@pixelforge.studio", company: "Pixel Forge", phone: "+1 555 0301", projectType: "Digital Environments", budget: "$15,000–$30,000", timeline: "10 weeks", description: "Fantasy RPG biome for Unreal Engine 5.", stage: "contacted", source: "contact_form", value: 22000, createdAt: "2026-08-12", updatedAt: "2026-08-12" },
  { id: "3", name: "Leila Sousa", email: "leila@architectsco.br", company: "Architects Co.", phone: "+55 11 9876 5432", projectType: "Architecture CGI", budget: "$20,000+", timeline: "6 weeks", description: "12-building residential complex in São Paulo.", stage: "qualified", source: "referral", value: 28000, createdAt: "2026-08-11", updatedAt: "2026-08-11" },
  { id: "4", name: "Tom Hargreaves", email: "tom@motionco.uk", company: "Motion Co.", phone: "+44 7700 900123", projectType: "Brand Motion", budget: "$10,000–$15,000", timeline: "4 weeks", description: "Motion identity refresh for rebrand launch.", stage: "proposal", source: "linkedin", value: 12000, createdAt: "2026-08-09", updatedAt: "2026-08-09" },
];

const SEED_PAYMENTS: Payment[] = [
  { id: "1", reference: "PAY-2026-0041", invoiceId: "1", customer: "Marcus Webb", amount: 1900, method: "card", status: "completed", createdAt: "2026-07-28" },
  { id: "2", reference: "PAY-2026-0042", invoiceId: "1", customer: "Marcus Webb", amount: 1900, method: "card", status: "completed", createdAt: "2026-08-10" },
  { id: "3", reference: "PAY-2026-0043", invoiceId: "2", customer: "Priya Nakamura", amount: 19000, method: "bank", status: "completed", createdAt: "2026-08-02" },
  { id: "4", reference: "PAY-2026-0044", invoiceId: "3", customer: "Kai Bergström", amount: 4500, method: "card", status: "completed", createdAt: "2026-07-30" },
];

const SEED_MEDIA: MediaItem[] = [
  { id: "1", filename: "orbital_hero.jpg", url: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=600&fit=crop&auto=format", type: "image", size: 2840000, alt: "ORBITAL hero render", folder: "projects", createdAt: "2026-08-01" },
  { id: "2", filename: "axiom_product_01.jpg", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&auto=format", type: "image", size: 1920000, alt: "AXIOM product render", folder: "projects", createdAt: "2026-07-28" },
  { id: "3", filename: "meridian_ext.jpg", url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop&auto=format", type: "image", size: 3100000, alt: "MERIDIAN exterior", folder: "projects", createdAt: "2026-07-20" },
  { id: "4", filename: "studio_workspace.jpg", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format", type: "image", size: 1540000, alt: "ORVEX studio", folder: "studio", createdAt: "2026-07-15" },
  { id: "5", filename: "lumen_study.jpg", url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop&auto=format", type: "image", size: 2200000, alt: "LUMEN material study", folder: "experiments", createdAt: "2026-07-10" },
];

const SEED_USERS: AdminUser[] = [
  { id: "1", name: "ORVEX Admin", email: "admin@orvex.studio", role: "super_admin", status: "active", lastLogin: "2026-08-13", createdAt: "2026-01-01" },
  { id: "2", name: "Studio Editor", email: "editor@orvex.studio", role: "editor", status: "active", lastLogin: "2026-08-12", createdAt: "2026-03-15" },
];

const SEED_SEO: SEOSettings = {
  siteName: "ORVEX",
  siteDescription: "Premium 3D design, CGI, and motion studio. Form. Motion. Beyond.",
  siteUrl: "https://orvex.studio",
  ogImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&h=630&fit=crop&auto=format",
  twitterHandle: "@orvexstudio",
  googleAnalyticsId: "G-XXXXXXXXXX",
  robots: "index,follow",
};

const SEED_SETTINGS: SystemSettings = {
  studioName: "ORVEX Studio",
  email: "hello@orvex.studio",
  phone: "+1 (555) 000-0000",
  address: "Studio District, Los Angeles, CA 90001",
  currency: "USD",
  taxRate: 0,
  depositPercent: 50,
  timezone: "America/Los_Angeles",
  maintenanceMode: false,
  emailNotifications: true,
  bookingEnabled: true,
};

// ── Storage ─────────────────────────────────────────────────────────

const STORAGE_KEY = "orvex_admin_v2";

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return null;
}

function saveStore(data: object) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* empty */ }
}

function buildInitial() {
  const saved = loadStore();
  return {
    projects: saved?.projects ?? [...seedProjects],
    services: saved?.services ?? [...seedServices],
    orders: saved?.orders ?? [...seedOrders],
    bookings: saved?.bookings ?? [...seedBookings],
    customers: saved?.customers ?? [...seedCustomers],
    messages: saved?.messages ?? [...seedMessages],
    invoices: saved?.invoices ?? [...seedInvoices],
    journal: saved?.journal ?? [...seedJournal],
    testimonials: saved?.testimonials ?? [...seedTestimonials],
    leads: saved?.leads ?? [...SEED_LEADS],
    payments: saved?.payments ?? [...SEED_PAYMENTS],
    media: saved?.media ?? [...SEED_MEDIA],
    users: saved?.users ?? [...SEED_USERS],
    seo: saved?.seo ?? { ...SEED_SEO },
    settings: saved?.settings ?? { ...SEED_SETTINGS },
    auditLog: saved?.auditLog ?? seedAuditLog.map((e, i) => ({
      id: e.id,
      timestamp: e.timestamp,
      userName: e.user,
      action: e.action as AuditEntry["action"],
      entity: e.entity,
      entityId: String(i),
      entityName: e.entityName,
      details: e.detail,
    })) as AuditEntry[],
  };
}

// ── Context ─────────────────────────────────────────────────────────

interface AdminStore {
  projects: Project[];
  services: Service[];
  orders: Order[];
  bookings: Booking[];
  customers: Customer[];
  messages: Message[];
  invoices: Invoice[];
  journal: JournalPost[];
  testimonials: Testimonial[];
  leads: Lead[];
  payments: Payment[];
  media: MediaItem[];
  users: AdminUser[];
  seo: SEOSettings;
  settings: SystemSettings;
  auditLog: AuditEntry[];
}

type Updater<T> = {
  create: (item: T) => void;
  update: (item: T) => void;
  remove: (id: string) => void;
};

interface AdminContextType extends AdminStore {
  projects_: Updater<Project>;
  services_: Updater<Service>;
  orders_: Updater<Order>;
  bookings_: Updater<Booking>;
  customers_: Updater<Customer>;
  messages_: Updater<Message>;
  invoices_: Updater<Invoice>;
  journal_: Updater<JournalPost>;
  testimonials_: Updater<Testimonial>;
  leads_: Updater<Lead>;
  payments_: Updater<Payment>;
  media_: Updater<MediaItem>;
  users_: Updater<AdminUser>;
  updateSEO: (s: SEOSettings) => void;
  updateSettings: (s: SystemSettings) => void;
  addAudit: (entry: Omit<AuditEntry, "id" | "timestamp">) => void;
  resetStore: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<AdminStore>(buildInitial);

  const mutate = useCallback((fn: (prev: AdminStore) => AdminStore) => {
    setStore((prev) => {
      const next = fn(prev);
      saveStore(next);
      return next;
    });
  }, []);

  const addAudit = useCallback((entry: Omit<AuditEntry, "id" | "timestamp">) => {
    const ae: AuditEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
    };
    mutate((prev) => ({ ...prev, auditLog: [ae, ...prev.auditLog].slice(0, 500) }));
  }, [mutate]);

  function makeUpdater<T extends { id: string }>(key: keyof AdminStore, entityName: string): Updater<T> {
    const getArr = (s: AdminStore) => (s[key] as unknown) as T[];
    const getName = (item: T) => {
      const r = item as Record<string, unknown>;
      return (r.title as string | undefined) ?? (r.name as string | undefined) ?? item.id;
    };
    return {
      create: (item: T) => {
        mutate((prev) => ({ ...prev, [key]: [...getArr(prev), item] }));
        addAudit({ userName: "Admin", action: "CREATE", entity: entityName, entityId: item.id, entityName: getName(item) });
      },
      update: (item: T) => {
        mutate((prev) => ({ ...prev, [key]: getArr(prev).map((x) => x.id === item.id ? item : x) }));
        addAudit({ userName: "Admin", action: "UPDATE", entity: entityName, entityId: item.id, entityName: getName(item) });
      },
      remove: (id: string) => {
        const item = getArr(store).find((x) => x.id === id);
        mutate((prev) => ({ ...prev, [key]: getArr(prev).filter((x) => x.id !== id) }));
        addAudit({ userName: "Admin", action: "DELETE", entity: entityName, entityId: id, entityName: item ? getName(item) : id });
      },
    };
  }

  const ctx: AdminContextType = {
    ...store,
    projects_: makeUpdater<Project>("projects", "PROJECT"),
    services_: makeUpdater<Service>("services", "SERVICE"),
    orders_: makeUpdater<Order>("orders", "ORDER"),
    bookings_: makeUpdater<Booking>("bookings", "BOOKING"),
    customers_: makeUpdater<Customer>("customers", "CUSTOMER"),
    messages_: makeUpdater<Message>("messages", "MESSAGE"),
    invoices_: makeUpdater<Invoice>("invoices", "INVOICE"),
    journal_: makeUpdater<JournalPost>("journal", "JOURNAL"),
    testimonials_: makeUpdater<Testimonial>("testimonials", "TESTIMONIAL"),
    leads_: makeUpdater<Lead>("leads", "LEAD"),
    payments_: makeUpdater<Payment>("payments", "PAYMENT"),
    media_: makeUpdater<MediaItem>("media", "MEDIA"),
    users_: makeUpdater<AdminUser>("users", "USER"),
    updateSEO: (s) => { mutate((prev) => ({ ...prev, seo: s })); addAudit({ userName: "Admin", action: "UPDATE", entity: "SEO", entityId: "seo", entityName: "SEO Settings" }); },
    updateSettings: (s) => { mutate((prev) => ({ ...prev, settings: s })); addAudit({ userName: "Admin", action: "UPDATE", entity: "SETTINGS", entityId: "settings", entityName: "System Settings" }); },
    addAudit,
    resetStore: () => { localStorage.removeItem(STORAGE_KEY); setStore(buildInitial()); },
  };

  return <AdminContext.Provider value={ctx}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
