/**
 * ORVEX Order Service
 * Atomically creates Order + Invoice + Payment records.
 * Optionally creates a Project record for eligible services.
 */

import type { Order, Invoice, Project, Service } from "@/data/seed";
import type { Payment } from "@/contexts/AdminContext";
import type { PaymentResult, PaymentType } from "./paymentService";
import {
  generateOrderId, generateInvoiceNumber, generatePaymentRef,
} from "./paymentService";

export interface CreateOrderInput {
  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;

  // Service & package
  service: Service;
  packageId: string;
  packageName: string;
  packagePrice: number;

  // Addons
  addons: Array<{ id: string; label: string; price: number }>;

  // Custom requirements
  customRequirements: Record<string, string>;
  attachments: string[];

  // Timeline
  preferredStartDate: string;
  timelineUrgency: "standard" | "expedited" | "rush";
  notes: string;

  // Payment
  paymentType: PaymentType;
  paymentMethod: "card" | "bank_transfer" | "crypto";
  paymentResult: PaymentResult;

  // Settings
  taxRate?: number;
  depositPercent?: number;
  autoCreateProject?: boolean;
}

export interface CreateOrderResult {
  order: Order;
  invoice: Invoice;
  payment: Payment;
  project?: Project;
}

export function buildOrderRecords(input: CreateOrderInput): CreateOrderResult {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const orderId = generateOrderId();
  const invoiceNumber = generateInvoiceNumber();
  const paymentRef = generatePaymentRef();

  const addonTotal = input.addons.reduce((s, a) => s + a.price, 0);
  const subtotal = input.packagePrice + addonTotal;
  const taxRate = input.taxRate ?? 0;
  const taxAmount = Math.round(subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;
  const depositPct = input.depositPercent ?? 50;
  const depositAmount = input.paymentType === "full" ? total : Math.round(total * depositPct) / 100;
  const balance = total - depositAmount;

  // Urgency price adjustment (not applied here, but tracked)
  const urgencyLabel = { standard: "Standard", expedited: "Expedited (+15%)", rush: "Rush (+50%)" }[input.timelineUrgency];

  // Payment status
  const paymentStatus: Order["paymentStatus"] =
    input.paymentType === "quote" ? "pending"
    : input.paymentResult.status === "completed"
      ? (input.paymentType === "full" ? "paid" : "partially_paid")
      : "processing";

  const invoicePaymentStatus: Invoice["paymentStatus"] =
    input.paymentType === "quote" ? "pending"
    : paymentStatus === "paid" ? "paid"
    : paymentStatus === "partially_paid" ? "partially_paid"
    : "pending";

  const order: Order = {
    id: `ord-${Date.now()}`,
    orderId,
    customer: input.customerName,
    email: input.customerEmail,
    phone: input.customerPhone,
    company: input.customerCompany,
    service: input.service.title,
    serviceId: input.service.id,
    package: input.packageName,
    packageId: input.packageId,
    amount: total,
    deposit: depositAmount,
    paymentStatus,
    projectStatus: input.paymentType === "quote" ? "Quote requested" : "Onboarding",
    createdAt: now,
    paymentType: input.paymentType,
    paymentMethod: input.paymentType !== "quote" ? input.paymentMethod : undefined,
    transactionId: input.paymentResult.transactionId || undefined,
    providerRef: input.paymentResult.providerRef || undefined,
    addons: input.addons.map((a) => a.label),
    addonTotal,
    customRequirements: input.customRequirements,
    attachments: input.attachments,
    preferredStartDate: input.preferredStartDate,
    timelineUrgency: input.timelineUrgency,
    notes: input.notes,
    quoteStatus: input.paymentType === "quote" ? "pending" : undefined,
  };

  const invoice: Invoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    customer: input.customerName,
    email: input.customerEmail,
    project: `${input.service.title} — ${input.packageName}`,
    subtotal,
    tax: taxAmount,
    discount: 0,
    total,
    deposit: depositAmount,
    balance,
    paymentStatus: invoicePaymentStatus,
    dueDate: input.paymentType === "full" ? today : addDays(today, 30),
    createdAt: now,
  };

  const paymentMethodMap: Record<string, Payment["method"]> = {
    card: "stripe",
    bank_transfer: "bank_transfer",
    crypto: "crypto",
  };

  const payment: Payment = {
    id: `pay-${Date.now()}`,
    paymentRef,
    customer: input.customerName,
    email: input.customerEmail,
    invoiceNumber,
    amount: input.paymentType === "quote" ? 0 : depositAmount,
    method: paymentMethodMap[input.paymentMethod] ?? "stripe",
    status: input.paymentType === "quote" ? "pending"
           : input.paymentResult.status === "completed" ? "completed" : "pending",
    processedAt: input.paymentResult.status === "completed" ? today : "",
    createdAt: now,
  };

  // Auto-create project for paid orders
  let project: Project | undefined;
  if (input.autoCreateProject && input.paymentType !== "quote" && input.paymentResult.success) {
    const slugBase = `${input.service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${orderId.toLowerCase()}`;
    project = {
      id: `proj-${Date.now()}`,
      slug: slugBase,
      number: orderId.replace("ORVEX-ORD-", ""),
      title: `${input.service.title}: ${input.customerCompany || input.customerName}`,
      subtitle: input.packageName,
      category: input.service.title,
      year: new Date().getFullYear(),
      client: input.customerCompany || input.customerName,
      services: [input.service.title],
      software: [],
      description: input.customRequirements.description || `${input.packageName} engagement via ${input.service.title}`,
      challenge: "",
      concept: "",
      process: "",
      featured: false,
      status: "draft",
      coverImage: input.service.gallery[0] ?? "",
      gallery: [],
      tags: [],
      seoTitle: "",
      seoDescription: "",
    };
  }

  return { order, invoice, payment, project };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── Service-specific requirement fields ────────────────────────────────────

export interface RequirementField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "radio";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  hint?: string;
}

export const SERVICE_REQUIREMENTS: Record<string, RequirementField[]> = {
  "1": [ // 3D Modeling
    { key: "description", label: "Project description", type: "textarea", placeholder: "Describe the object(s) you need modeled...", required: true },
    { key: "intended_use", label: "Intended use", type: "radio", options: ["Real-time / Game engine", "High-quality rendering", "3D printing", "Other"], required: true },
    { key: "starting_point", label: "Starting point", type: "radio", options: ["Concept art / Illustration", "Photo references only", "Technical drawings / CAD", "Rough sketch", "Existing 3D file to refine"] },
    { key: "format", label: "Required output format", type: "select", options: ["FBX", "OBJ", "GLB/GLTF", "STEP", "STL", "All formats"] },
    { key: "references", label: "Style references", type: "textarea", placeholder: "Links to reference images, mood boards, or describe the visual direction..." },
    { key: "special", label: "Special requirements", type: "textarea", placeholder: "Rigging, LODs, specific topology constraints, etc." },
  ],
  "2": [ // CGI Visualization
    { key: "description", label: "Project description", type: "textarea", placeholder: "What are you visualizing? What is the creative goal?", required: true },
    { key: "subject_type", label: "Subject type", type: "radio", options: ["Product", "Interior space", "Exterior / Architecture", "Abstract / Concept", "Other"] },
    { key: "existing_files", label: "Do you have existing 3D files?", type: "radio", options: ["Yes — I will supply them", "Partial files available", "No — start from scratch"] },
    { key: "output_platform", label: "Primary output platform", type: "radio", options: ["Website / Digital", "Print campaign", "Social media", "Broadcast / OOH", "Multiple"] },
    { key: "resolution", label: "Required resolution", type: "select", options: ["4K (3840×2160)", "6K (5760×3240)", "8K (7680×4320)", "Custom — specify below"] },
    { key: "references", label: "Style & mood references", type: "textarea", placeholder: "Links to reference images, photographers, color palettes..." },
  ],
  "3": [ // 3D Motion
    { key: "description", label: "Project brief", type: "textarea", placeholder: "Describe the animation. What happens? What is the emotional goal?", required: true },
    { key: "duration", label: "Target duration", type: "radio", options: ["Under 10 seconds (loop)", "10–30 seconds", "30–60 seconds", "Over 60 seconds"] },
    { key: "storyboard", label: "Storyboard / animatic available?", type: "radio", options: ["Yes — I will supply it", "Rough script / notes only", "No — open to ORVEX direction"] },
    { key: "loop", label: "Looping or one-shot?", type: "radio", options: ["Seamless loop", "One-shot sequence", "Both versions"] },
    { key: "platform", label: "Primary delivery platform", type: "radio", options: ["Social media", "Website hero", "Broadcast", "In-store / OOH", "Event / Installation"] },
    { key: "references", label: "Visual references", type: "textarea", placeholder: "Links to animations, films, or describe the desired motion language..." },
  ],
  "4": [ // Product Visualization
    { key: "description", label: "Product overview", type: "textarea", placeholder: "Describe the product — material, dimensions, key features...", required: true },
    { key: "existing_model", label: "Do you have a 3D model?", type: "radio", options: ["Yes — I will supply it", "Only CAD / technical drawings", "No — build from references"] },
    { key: "physical_product", label: "Physical product available?", type: "radio", options: ["Yes — can ship to ORVEX", "Yes — local to you", "No — reference photos only"] },
    { key: "colorways", label: "Number of color / material variants", type: "select", options: ["1", "2–3", "4–6", "7+"] },
    { key: "lifestyle", label: "Lifestyle scenes needed?", type: "radio", options: ["No — studio shots only", "Yes — minimal context", "Yes — full lifestyle compositions"] },
    { key: "references", label: "Style references", type: "textarea", placeholder: "Link to competitor imagery, brand guidelines, mood board..." },
  ],
  "5": [ // Brand & Logo Animation
    { key: "description", label: "Brand overview", type: "textarea", placeholder: "Describe your brand, its values, and the role this animation plays...", required: true },
    { key: "guidelines", label: "Brand guidelines available?", type: "radio", options: ["Yes — full guidelines", "Partial / informal guidelines", "No guidelines yet"] },
    { key: "logo_files", label: "Logo file format", type: "radio", options: ["AI / EPS vector", "SVG", "PDF", "PNG only — no vectors"] },
    { key: "platforms", label: "Delivery platforms", type: "select", options: ["Social media only", "Website only", "Social + Website", "Broadcast", "All platforms"] },
    { key: "feel", label: "Desired feel", type: "radio", options: ["Minimal & refined", "Bold & energetic", "Technical & precise", "Organic & fluid", "Luxury & slow"] },
    { key: "scope", label: "Scope required", type: "radio", options: ["Logomark animation only", "Logo + key type elements", "Full motion identity system"] },
  ],
  "6": [ // 3D Advertising
    { key: "description", label: "Campaign brief", type: "textarea", placeholder: "Campaign objective, key message, target audience, tone of voice...", required: true },
    { key: "objective", label: "Primary objective", type: "radio", options: ["Product launch", "Brand awareness", "Performance / conversion", "Event promotion", "Other"] },
    { key: "formats", label: "Required formats", type: "radio", options: ["Social media (9:16, 1:1, 16:9)", "Display advertising", "Broadcast 16:9", "All of the above"] },
    { key: "broadcast", label: "Broadcast specifications needed?", type: "radio", options: ["Yes — network delivery spec", "Yes — streaming platform", "No"] },
    { key: "existing_assets", label: "Existing brand assets available?", type: "radio", options: ["Full brand kit", "Logo only", "Nothing — start fresh"] },
    { key: "references", label: "Reference campaigns", type: "textarea", placeholder: "Link or describe campaigns that capture the desired style..." },
  ],
  default: [ // All other services
    { key: "description", label: "Project description", type: "textarea", placeholder: "Describe your project in as much detail as possible...", required: true },
    { key: "objectives", label: "Key objectives", type: "textarea", placeholder: "What must this project achieve? How will you measure success?" },
    { key: "references", label: "References & inspiration", type: "textarea", placeholder: "Link to visual references, describe the style, or list inspirations..." },
    { key: "existing_assets", label: "Existing assets available?", type: "radio", options: ["Full brand kit", "Partial assets", "Starting from scratch"] },
    { key: "special", label: "Additional requirements", type: "textarea", placeholder: "Technical constraints, accessibility needs, unusual delivery specs..." },
  ],
};

export function getRequirementFields(serviceId: string): RequirementField[] {
  return SERVICE_REQUIREMENTS[serviceId] ?? SERVICE_REQUIREMENTS.default;
}

// ── Add-ons catalogue ──────────────────────────────────────────────────────

export interface Addon {
  id: string;
  label: string;
  description: string;
  priceType: "flat" | "percent";
  price: number;
  applicableTo: string[] | "all";
}

export const ADDONS: Addon[] = [
  { id: "rush", label: "Rush Delivery", description: "50% timeline reduction with dedicated team allocation", priceType: "percent", price: 50, applicableTo: "all" },
  { id: "source", label: "Source Files", description: "Full native project files (Blender, C4D, AE) and all assets", priceType: "flat", price: 500, applicableTo: "all" },
  { id: "extra_rev", label: "Extra Revision Rounds", description: "2 additional revision rounds beyond your package allowance", priceType: "flat", price: 350, applicableTo: "all" },
  { id: "license", label: "Extended License", description: "Broadcast + global unlimited commercial use, all future platforms", priceType: "flat", price: 800, applicableTo: ["2", "3", "4", "5", "6"] },
  { id: "exclusivity", label: "Full Exclusivity", description: "ORVEX retains no portfolio rights; no case study or showcase", priceType: "flat", price: 1200, applicableTo: "all" },
  { id: "nda", label: "Mutual NDA", description: "Executed non-disclosure agreement with legal review", priceType: "flat", price: 0, applicableTo: "all" },
];

export function getAddonsForService(serviceId: string): Addon[] {
  return ADDONS.filter((a) => a.applicableTo === "all" || a.applicableTo.includes(serviceId));
}

export function computeAddonPrice(addon: Addon, basePrice: number): number {
  return addon.priceType === "percent" ? Math.round(basePrice * addon.price) / 100 : addon.price;
}
