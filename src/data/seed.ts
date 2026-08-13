export interface Project {
  id: string;
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  year: number;
  client: string;
  services: string[];
  software: string[];
  description: string;
  challenge: string;
  concept: string;
  process: string;
  featured: boolean;
  status: "published" | "draft" | "archived";
  coverImage: string;
  gallery: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

export interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
  overview: string;
  deliverables: string[];
  process: string[];
  timeline: string;
  startingPrice: number;
  currency: string;
  packages: ServicePackage[];
  gallery: string[];
  featured: boolean;
  visible: boolean;
  order: number;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  duration: string;
  popular: boolean;
}

export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  coverImage: string;
  publishDate: string;
  readTime: number;
  status: "published" | "draft";
  seoTitle: string;
  seoDescription: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  photo: string;
  testimonial: string;
  project: string;
  rating: number;
  featured: boolean;
}

export interface Booking {
  id: string;
  bookingRef: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  type: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "no_show";
  notes: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  service: string;
  package: string;
  amount: number;
  deposit: number;
  paymentStatus: "pending" | "processing" | "paid" | "partially_paid" | "failed" | "refunded" | "cancelled";
  projectStatus: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  totalSpent: number;
  projects: number;
  orders: number;
  bookings: number;
  leadStatus: "new" | "contacted" | "qualified" | "proposal_sent" | "won" | "lost";
  lastActivity: string;
  createdAt: string;
}

export interface Message {
  id: string;
  from: string;
  email: string;
  company: string;
  subject: string;
  preview: string;
  fullMessage: string;
  projectType: string;
  budget: string;
  timeline: string;
  read: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  email: string;
  project: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  deposit: number;
  balance: number;
  paymentStatus: "pending" | "paid" | "partially_paid" | "overdue";
  dueDate: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export const projects: Project[] = [
  {
    id: "1",
    slug: "orbital",
    number: "001",
    title: "ORBITAL",
    subtitle: "3D Motion Study",
    category: "3D Motion",
    year: 2026,
    client: "Internal",
    services: ["3D Modeling", "Motion Design", "CGI"],
    software: ["Blender", "Cycles", "DaVinci Resolve"],
    description: "An exploration of orbital mechanics translated into dimensional form. ORBITAL examines the relationship between mass, trajectory, and visual tension — rendered as a cinematic motion study.",
    challenge: "Translating the invisible forces of physics into a purely visual language while maintaining aesthetic precision and compositional balance across a 90-second runtime.",
    concept: "The concept draws from satellite telemetry data, reinterpreted as architectural geometry. Each ring represents a different orbital band, with the central vertex as the gravitational origin.",
    process: "Began with rough physics simulations in Houdini, then rebuilt the geometry in Blender for rendering control. Lighting was designed to create maximum depth with minimal sources.",
    featured: true,
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1400&h=900&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1400&h=900&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1400&h=900&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&h=900&fit=crop&auto=format",
    ],
    tags: ["motion", "3d", "experimental", "orbital"],
    seoTitle: "ORBITAL — 3D Motion Study | ORVEX",
    seoDescription: "An exploration of orbital mechanics translated into dimensional form by ORVEX studio.",
  },
  {
    id: "2",
    slug: "axiom",
    number: "002",
    title: "AXIOM",
    subtitle: "Product Visualization",
    category: "Product CGI",
    year: 2026,
    client: "AXIOM Technologies",
    services: ["Product Visualization", "CGI", "3D Modeling"],
    software: ["Cinema 4D", "Redshift", "After Effects"],
    description: "A complete CGI product suite for AXIOM's new wearable technology line. 47 render variations across 6 colorways, optimized for web, print, and campaign media.",
    challenge: "Achieving photorealistic material accuracy for brushed titanium and sapphire glass surfaces without access to physical samples — working entirely from technical specifications.",
    concept: "The visual language draws from industrial design principles: clean, architectural, and precise. Each composition emphasizes form over context.",
    process: "Material development required 3 weeks of iterative testing. The final titanium shader uses a custom displacement map derived from actual machined metal surface scans.",
    featured: true,
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&h=900&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&h=900&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1400&h=900&fit=crop&auto=format",
    ],
    tags: ["product", "cgi", "visualization", "technology"],
    seoTitle: "AXIOM — Product Visualization | ORVEX",
    seoDescription: "Complete CGI product suite for AXIOM Technologies wearable line.",
  },
  {
    id: "3",
    slug: "meridian",
    number: "003",
    title: "MERIDIAN",
    subtitle: "Architectural Visualization",
    category: "Architecture CGI",
    year: 2025,
    client: "Studio Vantage",
    services: ["Architectural Visualization", "3D Environments", "CGI"],
    software: ["Blender", "Cycles", "Lightroom"],
    description: "Cinematic architectural visualization for Studio Vantage's residential development in Dubai. 12 exterior and interior renders plus a 60-second flythrough.",
    challenge: "Representing materiality — concrete, oxidized copper, and aged oak — with the warmth required for residential marketing while maintaining architectural precision.",
    concept: "Each image is composed as a still from a film about the building, not a technical drawing. Natural light is the primary design element.",
    process: "Reference photography, sun studies, and time-of-day analysis drove the lighting design. All materials are physically-based with hand-painted texture overlays.",
    featured: true,
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&h=900&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&h=900&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&h=900&fit=crop&auto=format",
    ],
    tags: ["architecture", "visualization", "interior", "exterior"],
    seoTitle: "MERIDIAN — Architectural Visualization | ORVEX",
    seoDescription: "Cinematic architectural visualization for Studio Vantage Dubai development.",
  },
  {
    id: "4",
    slug: "vertex",
    number: "004",
    title: "VERTEX",
    subtitle: "Brand Motion System",
    category: "Brand Motion",
    year: 2025,
    client: "VREX Studio",
    services: ["Brand Animation", "Logo Motion", "CGI"],
    software: ["After Effects", "Cinema 4D", "Illustrator"],
    description: "Complete motion identity system for VREX, a spatial computing startup. Logomark animation, transition library, and brand motion guidelines.",
    challenge: "The brand needed to feel native to spatial computing environments — implying depth, dimension, and interactivity — while remaining deployable in 2D contexts.",
    concept: "Every element in the system unfolds from a single geometric axiom: the VREX vertex point. Motion expands outward from that point, then collapses back.",
    process: "Developed 4 motion principles, then stress-tested each across screen sizes and output formats before creating the full library.",
    featured: false,
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&h=900&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&h=900&fit=crop&auto=format",
    ],
    tags: ["brand", "motion", "identity", "logo"],
    seoTitle: "VERTEX — Brand Motion System | ORVEX",
    seoDescription: "Complete motion identity system for VREX spatial computing startup.",
  },
  {
    id: "5",
    slug: "stratum",
    number: "005",
    title: "STRATUM",
    subtitle: "Digital Environment",
    category: "3D Environment",
    year: 2025,
    client: "Internal",
    services: ["3D Environments", "Lighting", "Motion"],
    software: ["Blender", "Houdini", "Nuke"],
    description: "An experimental digital world built from geological data. Stratum translates stratigraphic layer information from deep-core samples into abstract dimensional forms.",
    challenge: "Converting scientific data into aesthetic form without losing its original structural logic. The geometry needed to remain geologically plausible while becoming visually compelling.",
    concept: "Geological time mapped to spatial depth. The oldest strata are deepest, densest, and most compressed. Younger layers are lighter, more diffuse.",
    process: "Core sample data was parsed and translated into Z-position offsets for procedurally generated geometry. Blender's geometry nodes system drove most of the layering logic.",
    featured: false,
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1501862700950-18382cd41497?w=1400&h=900&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1501862700950-18382cd41497?w=1400&h=900&fit=crop&auto=format",
    ],
    tags: ["experimental", "environment", "data", "geological"],
    seoTitle: "STRATUM — Digital Environment | ORVEX",
    seoDescription: "Experimental digital world built from geological data by ORVEX.",
  },
  {
    id: "6",
    slug: "lumen",
    number: "006",
    title: "LUMEN",
    subtitle: "Lighting & Material Study",
    category: "CGI Study",
    year: 2024,
    client: "Internal",
    services: ["CGI", "Lighting", "Material Design"],
    software: ["Blender", "Cycles", "Substance Painter"],
    description: "A material and lighting study examining how light interacts with complex surfaces — brushed metal, liquid glass, raw carbon, and biological textures.",
    challenge: "Creating physically accurate representations of materials with extreme optical properties, particularly the sub-surface scattering behavior of translucent materials.",
    concept: "Each scene isolates a single material category. Light becomes the subject; the material is the lens through which light reveals itself.",
    process: "A library of 40+ custom materials developed over 3 months. Each material's shader graph is documented and available in the ORVEX material library.",
    featured: false,
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=900&fit=crop&auto=format",
    gallery: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=900&fit=crop&auto=format",
    ],
    tags: ["material", "lighting", "study", "experimental"],
    seoTitle: "LUMEN — Lighting & Material Study | ORVEX",
    seoDescription: "Material and lighting study examining light-surface interaction by ORVEX.",
  },
];

export const services: Service[] = [
  {
    id: "1",
    number: "01",
    title: "3D MODELING",
    description: "Precision 3D geometry from concept to production-ready asset.",
    overview: "We create production-ready 3D models for any application — from real-time interactive use to hyper-detailed rendering. Every polygon is intentional.",
    deliverables: ["Production 3D files (FBX, OBJ, GLB)", "LOD variations", "Clean topology", "UV-mapped geometry", "Material assignments"],
    process: ["Reference & concept", "Blockout geometry", "Detail pass", "UV mapping", "Material setup", "Export & delivery"],
    timeline: "5–15 business days",
    startingPrice: 800,
    currency: "USD",
    packages: [
      { id: "1a", name: "BASIC", price: 800, description: "Single object, production-ready", features: ["1 object", "Clean topology", "UV mapping", "2 revisions", "FBX + OBJ"], duration: "5 days", popular: false },
      { id: "1b", name: "STANDARD", price: 2200, description: "Complex object with materials", features: ["Up to 3 objects", "Full material setup", "4 revisions", "All formats", "Substance textures"], duration: "10 days", popular: true },
      { id: "1c", name: "PREMIUM", price: 5500, description: "Full scene or product family", features: ["Unlimited objects", "Full scene", "6 revisions", "All formats", "Animation ready"], duration: "15 days", popular: false },
    ],
    gallery: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop&auto=format"],
    featured: true,
    visible: true,
    order: 1,
  },
  {
    id: "2",
    number: "02",
    title: "CGI VISUALIZATION",
    description: "Photorealistic render campaigns indistinguishable from photography.",
    overview: "Photorealistic CGI renders for advertising, product campaigns, editorial, and marketing. Executed to photography-standard quality.",
    deliverables: ["Final renders (up to 8K)", "Multiple compositions", "Layered PSD files", "License-ready files"],
    process: ["Brief & reference", "Mood development", "Scene build", "Lighting setup", "Render", "Composite & grade"],
    timeline: "8–20 business days",
    startingPrice: 1500,
    currency: "USD",
    packages: [
      { id: "2a", name: "BASIC", price: 1500, description: "3 rendered views", features: ["3 compositions", "4K output", "2 revisions", "1 product"], duration: "8 days", popular: false },
      { id: "2b", name: "STANDARD", price: 3800, description: "Campaign pack", features: ["8 compositions", "6K output", "4 revisions", "Multiple angles", "Color variants"], duration: "14 days", popular: true },
      { id: "2c", name: "PREMIUM", price: 9500, description: "Full campaign suite", features: ["20+ compositions", "8K output", "Unlimited revisions", "All variants", "Rush available"], duration: "20 days", popular: false },
    ],
    gallery: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=500&fit=crop&auto=format"],
    featured: true,
    visible: true,
    order: 2,
  },
  {
    id: "3",
    number: "03",
    title: "3D MOTION",
    description: "Cinematic 3D animation and motion sequences for brand and content.",
    overview: "From short loops to full cinematic sequences. 3D motion for brand campaigns, social content, title sequences, and immersive experiences.",
    deliverables: ["ProRes 4K video files", "Optimized web formats", "Loop variants", "Storyboard documentation"],
    process: ["Brief & storyboard", "Animatic", "Scene build", "Animation pass", "Rendering", "Grading & delivery"],
    timeline: "10–30 business days",
    startingPrice: 2500,
    currency: "USD",
    packages: [
      { id: "3a", name: "BASIC", price: 2500, description: "Short loop 5–15 seconds", features: ["15s max", "4K ProRes", "2 revisions", "Web-ready export"], duration: "10 days", popular: false },
      { id: "3b", name: "STANDARD", price: 6500, description: "30–60 second sequence", features: ["60s max", "4K ProRes", "4 revisions", "Sound design ready", "Storyboard"], duration: "20 days", popular: true },
      { id: "3c", name: "PREMIUM", price: 18000, description: "Full cinematic production", features: ["Unlimited duration", "Full production", "Unlimited revisions", "Director's cut", "Full deliverable pack"], duration: "30 days", popular: false },
    ],
    gallery: ["https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=500&fit=crop&auto=format"],
    featured: true,
    visible: true,
    order: 3,
  },
  {
    id: "4",
    number: "04",
    title: "PRODUCT VISUALIZATION",
    description: "Hero product imagery for e-commerce, campaigns, and packaging.",
    overview: "Studio-quality product renders that outperform photography in control, consistency, and iteration speed. Perfect for e-commerce, advertising, and packaging.",
    deliverables: ["Hero product renders", "360° view pack", "White background variants", "Campaign compositions"],
    process: ["Product brief", "Reference shoot or 3D model", "Scene composition", "Material calibration", "Render", "Retouch & delivery"],
    timeline: "7–18 business days",
    startingPrice: 1200,
    currency: "USD",
    packages: [
      { id: "4a", name: "BASIC", price: 1200, description: "5 hero renders", features: ["5 renders", "White BG + scene", "4K output", "2 revisions"], duration: "7 days", popular: false },
      { id: "4b", name: "STANDARD", price: 3200, description: "15 renders + 360°", features: ["15 renders", "360° pack", "Color variants", "4 revisions", "E-commerce ready"], duration: "12 days", popular: true },
      { id: "4c", name: "PREMIUM", price: 7800, description: "Full product library", features: ["Unlimited renders", "All variants", "Lifestyle scenes", "6 revisions", "Campaign ready"], duration: "18 days", popular: false },
    ],
    gallery: ["https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=500&fit=crop&auto=format"],
    featured: true,
    visible: true,
    order: 4,
  },
  {
    id: "5",
    number: "05",
    title: "BRAND & LOGO ANIMATION",
    description: "Motion identity systems that bring brand marks to life.",
    overview: "Transform your brand identity into a motion system. Logo animations, animated type, transition libraries, and complete brand motion guidelines.",
    deliverables: ["Master logo animation", "Format variations", "Reverse variants", "Brand motion guide", "Source files"],
    process: ["Brand audit", "Motion principles", "Concept development", "Animation", "Variations", "Delivery"],
    timeline: "8–16 business days",
    startingPrice: 1800,
    currency: "USD",
    packages: [
      { id: "5a", name: "BASIC", price: 1800, description: "Logo animation only", features: ["Logo reveal", "4 formats", "2 revisions", "MP4 + WebM"], duration: "8 days", popular: false },
      { id: "5b", name: "STANDARD", price: 4500, description: "Motion identity", features: ["Logo system", "Type animations", "Transitions", "4 revisions", "Guidelines"], duration: "12 days", popular: true },
      { id: "5c", name: "PREMIUM", price: 11000, description: "Full motion brand", features: ["Complete system", "All elements", "Custom components", "Unlimited revisions", "Video demo"], duration: "16 days", popular: false },
    ],
    gallery: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop&auto=format"],
    featured: false,
    visible: true,
    order: 5,
  },
  {
    id: "6",
    number: "06",
    title: "3D ADVERTISING",
    description: "Immersive CGI ad campaigns for digital and broadcast.",
    overview: "High-impact 3D advertising content for social, display, broadcast, and OOH. Built to stop the scroll and hold attention.",
    deliverables: ["Campaign renders", "Animated variants", "Format adaptations", "Copy-ready files"],
    process: ["Campaign brief", "Creative concept", "Production", "Revision", "Format delivery"],
    timeline: "12–25 business days",
    startingPrice: 4500,
    currency: "USD",
    packages: [
      { id: "6a", name: "BASIC", price: 4500, description: "Social campaign", features: ["3 formats", "Static + animated", "2 revisions", "Social ready"], duration: "12 days", popular: false },
      { id: "6b", name: "STANDARD", price: 9500, description: "Multi-platform", features: ["8 formats", "Full animation", "4 revisions", "All platforms"], duration: "18 days", popular: true },
      { id: "6c", name: "PREMIUM", price: 22000, description: "Broadcast + digital", features: ["Full campaign", "Broadcast spec", "Unlimited revisions", "All formats", "Rush available"], duration: "25 days", popular: false },
    ],
    gallery: ["https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800&h=500&fit=crop&auto=format"],
    featured: false,
    visible: true,
    order: 6,
  },
  {
    id: "7",
    number: "07",
    title: "DIGITAL ENVIRONMENTS",
    description: "Constructed worlds for gaming, XR, virtual production, and experiential.",
    overview: "Complete 3D environments built for real-time and offline use. From intimate spaces to vast landscapes, optimized for game engines, XR platforms, and broadcast virtual production.",
    deliverables: ["Complete 3D scene", "Optimized assets", "Lighting setup", "Engine-ready export"],
    process: ["World brief", "Concept art", "Modular blockout", "Asset creation", "Lighting & atmosphere", "Optimization"],
    timeline: "15–40 business days",
    startingPrice: 6000,
    currency: "USD",
    packages: [
      { id: "7a", name: "BASIC", price: 6000, description: "Interior scene", features: ["Single interior", "Render ready", "4 views", "3 revisions"], duration: "15 days", popular: false },
      { id: "7b", name: "STANDARD", price: 15000, description: "Full environment", features: ["Exterior + interior", "Real-time ready", "Full LODs", "5 revisions"], duration: "25 days", popular: true },
      { id: "7c", name: "PREMIUM", price: 38000, description: "Open world section", features: ["Large scale", "Procedural elements", "All optimization", "Unlimited revisions", "Engine setup"], duration: "40 days", popular: false },
    ],
    gallery: ["https://images.unsplash.com/photo-1501862700950-18382cd41497?w=800&h=500&fit=crop&auto=format"],
    featured: false,
    visible: true,
    order: 7,
  },
  {
    id: "8",
    number: "08",
    title: "CUSTOM CGI EXPERIENCES",
    description: "Bespoke dimensional experiences for unique creative briefs.",
    overview: "For briefs that don't fit a category. Experimental installations, art commissions, interactive experiences, one-of-a-kind visual projects. Contact us to discuss.",
    deliverables: ["Custom deliverables per brief"],
    process: ["Discovery call", "Custom proposal", "Agreed milestones", "Production", "Delivery"],
    timeline: "Custom",
    startingPrice: 0,
    currency: "USD",
    packages: [],
    gallery: ["https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=500&fit=crop&auto=format"],
    featured: false,
    visible: true,
    order: 8,
  },
];

export const journalPosts: JournalPost[] = [
  {
    id: "1",
    slug: "inside-orbital-motion-study",
    title: "Inside ORBITAL: Building a 3D Motion Study from Physics Data",
    excerpt: "How we translated orbital mechanics into a cinematic motion study — the process, the renders, and the technical challenges of visualizing invisible forces.",
    content: "Full article content here...",
    author: "ORVEX Studio",
    category: "Behind the Scenes",
    tags: ["process", "blender", "motion", "orbital"],
    coverImage: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&h=700&fit=crop&auto=format",
    publishDate: "2026-08-01",
    readTime: 8,
    status: "published",
    seoTitle: "Inside ORBITAL Motion Study | ORVEX Journal",
    seoDescription: "How ORVEX translated orbital mechanics into a cinematic 3D motion study.",
  },
  {
    id: "2",
    slug: "material-design-titanium-shader",
    title: "The Titanium Shader: 3 Weeks of Material Development",
    excerpt: "Building a photorealistic brushed titanium material from scratch in Blender — every decision, every test render, every failure and breakthrough.",
    content: "Full article content here...",
    author: "ORVEX Studio",
    category: "Blender Workflows",
    tags: ["blender", "materials", "shaders", "cgi"],
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=700&fit=crop&auto=format",
    publishDate: "2026-07-15",
    readTime: 12,
    status: "published",
    seoTitle: "Titanium Shader Development | ORVEX Journal",
    seoDescription: "Building a photorealistic brushed titanium material in Blender.",
  },
  {
    id: "3",
    slug: "cgi-vs-photography-2026",
    title: "CGI vs Photography in 2026: When to Choose Which",
    excerpt: "An honest comparison of CGI and photography for product campaigns — costs, timelines, control, and when each approach wins.",
    content: "Full article content here...",
    author: "ORVEX Studio",
    category: "Design Thinking",
    tags: ["cgi", "photography", "production", "strategy"],
    coverImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=700&fit=crop&auto=format",
    publishDate: "2026-06-28",
    readTime: 6,
    status: "published",
    seoTitle: "CGI vs Photography 2026 | ORVEX Journal",
    seoDescription: "An honest comparison of CGI and photography for brand campaigns.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Marcus Webb",
    company: "AXIOM Technologies",
    role: "Head of Brand",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format",
    testimonial: "ORVEX delivered renders that our internal photography studio couldn't match. The titanium material accuracy was extraordinary. Our campaign conversion rate increased 34% after switching to the CGI assets.",
    project: "AXIOM Product Visualization",
    rating: 5,
    featured: true,
  },
  {
    id: "2",
    name: "Priya Nakamura",
    company: "Studio Vantage",
    role: "Creative Director",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format",
    testimonial: "The MERIDIAN visualizations completely changed how we present projects to clients. The quality is cinematic. We've won three major pitches directly because of how the renders looked.",
    project: "MERIDIAN Architectural Visualization",
    rating: 5,
    featured: true,
  },
  {
    id: "3",
    name: "Kai Bergström",
    company: "VREX Studio",
    role: "Founder",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format",
    testimonial: "The VERTEX motion system is exactly what we needed — disciplined, scalable, and genuinely impressive. ORVEX understood our brand instinctively.",
    project: "VERTEX Brand Motion",
    rating: 5,
    featured: true,
  },
];

export const faqs: FAQ[] = [
  {
    id: "1",
    question: "What is ORVEX and what do you do?",
    answer: "ORVEX is a premium 3D design, CGI, and motion studio. We create photorealistic visualizations, dimensional brand identities, motion sequences, and digital environments for technology companies, luxury brands, architecture studios, advertising agencies, and more.",
    category: "About",
    order: 1,
  },
  {
    id: "2",
    question: "How do I start a project with ORVEX?",
    answer: "You can start in three ways: purchase a service package directly from our Services page, submit a project brief through our Contact page, or book a discovery call. We'll respond within 24 hours on business days.",
    category: "Getting Started",
    order: 2,
  },
  {
    id: "3",
    question: "What software do you use?",
    answer: "Our primary pipeline includes Blender (Cycles & EEVEE), Cinema 4D with Redshift, Houdini, Substance Painter, DaVinci Resolve, After Effects, and Nuke. We select tools based on the specific requirements of each project.",
    category: "Technical",
    order: 3,
  },
  {
    id: "4",
    question: "Do you offer rush turnarounds?",
    answer: "Yes, rush production is available on most service packages at a 40–60% premium depending on timeline compression. Contact us directly to discuss rush availability before purchasing.",
    category: "Production",
    order: 4,
  },
  {
    id: "5",
    question: "What file formats do you deliver?",
    answer: "We deliver in any format your project requires. Common deliverables include: 3D files (FBX, OBJ, GLB, USDZ), renders (TIFF, EXR, PNG, JPG), and video (ProRes 4K, H.264, H.265, WebM). Layered PSD and source files are available on PREMIUM packages.",
    category: "Deliverables",
    order: 5,
  },
  {
    id: "6",
    question: "How does the revision process work?",
    answer: "Each package includes a set number of revision rounds. A revision round covers consolidated feedback — we address all notes in a single pass. Additional revision rounds can be purchased. We track all revision feedback through the client portal.",
    category: "Process",
    order: 6,
  },
  {
    id: "7",
    question: "Do you require a deposit?",
    answer: "Yes. All projects require a 50% deposit before production begins. The remaining 50% is due upon delivery of the final files. For larger projects over $10,000, milestone payment structures are available.",
    category: "Payment",
    order: 7,
  },
  {
    id: "8",
    question: "Who owns the final files and renders?",
    answer: "Full commercial rights to all final deliverable files transfer to you upon final payment. We retain the right to display the work in our portfolio unless a confidentiality agreement is in place. Source project files are retained by ORVEX unless specifically negotiated.",
    category: "Rights",
    order: 8,
  },
];

export const bookings: Booking[] = [
  { id: "1", bookingRef: "ORVEX-BOOK-2026-0001", name: "Sarah Chen", email: "sarah@techcorp.com", company: "TechCorp", phone: "+1 555 0101", type: "Discovery Call", date: "2026-08-15", time: "10:00", status: "confirmed", notes: "Interested in product visualization for Q4 launch.", createdAt: "2026-08-10" },
  { id: "2", bookingRef: "ORVEX-BOOK-2026-0002", name: "Daniel Torres", email: "d.torres@archduo.com", company: "ArchDuo", phone: "+1 555 0182", type: "Project Consultation", date: "2026-08-16", time: "14:30", status: "pending", notes: "Residential visualization project in Dubai.", createdAt: "2026-08-11" },
  { id: "3", bookingRef: "ORVEX-BOOK-2026-0003", name: "Yuki Tanaka", email: "yuki@brandstudio.jp", company: "Brand Studio JP", phone: "+81 90 1234 5678", type: "Creative Consultation", date: "2026-08-18", time: "09:00", status: "confirmed", notes: "Motion identity for new product line.", createdAt: "2026-08-12" },
  { id: "4", bookingRef: "ORVEX-BOOK-2026-0004", name: "Emma Reynolds", email: "emma@luxegroup.co", company: "Luxe Group", phone: "+44 7700 900234", type: "Discovery Call", date: "2026-08-20", time: "11:00", status: "pending", notes: "Luxury fashion campaign CGI.", createdAt: "2026-08-13" },
];

export const orders: Order[] = [
  { id: "1", orderId: "ORVEX-ORD-2026-0041", customer: "Marcus Webb", email: "marcus@axiom.tech", service: "CGI Visualization", package: "STANDARD", amount: 3800, deposit: 1900, paymentStatus: "paid", projectStatus: "RENDERING", createdAt: "2026-07-28" },
  { id: "2", orderId: "ORVEX-ORD-2026-0042", customer: "Priya Nakamura", email: "priya@studiovantage.com", service: "Digital Environments", package: "PREMIUM", amount: 38000, deposit: 19000, paymentStatus: "partially_paid", projectStatus: "MODELING", createdAt: "2026-08-01" },
  { id: "3", orderId: "ORVEX-ORD-2026-0043", customer: "Kai Bergström", email: "kai@vrex.studio", service: "Brand & Logo Animation", package: "STANDARD", amount: 4500, deposit: 2250, paymentStatus: "paid", projectStatus: "COMPLETED", createdAt: "2026-07-15" },
  { id: "4", orderId: "ORVEX-ORD-2026-0044", customer: "Sarah Chen", email: "sarah@techcorp.com", service: "Product Visualization", package: "BASIC", amount: 1200, deposit: 600, paymentStatus: "pending", projectStatus: "DISCOVERY", createdAt: "2026-08-12" },
  { id: "5", orderId: "ORVEX-ORD-2026-0045", customer: "Emma Reynolds", email: "emma@luxegroup.co", service: "3D Advertising", package: "PREMIUM", amount: 22000, deposit: 11000, paymentStatus: "processing", projectStatus: "PLANNING", createdAt: "2026-08-13" },
];

export const customers: Customer[] = [
  { id: "1", name: "Marcus Webb", company: "AXIOM Technologies", email: "marcus@axiom.tech", phone: "+1 555 0201", country: "United States", totalSpent: 3800, projects: 1, orders: 1, bookings: 2, leadStatus: "won", lastActivity: "2026-08-10", createdAt: "2026-07-20" },
  { id: "2", name: "Priya Nakamura", company: "Studio Vantage", email: "priya@studiovantage.com", phone: "+1 555 0182", country: "United States", totalSpent: 57000, projects: 2, orders: 2, bookings: 3, leadStatus: "won", lastActivity: "2026-08-12", createdAt: "2026-06-01" },
  { id: "3", name: "Kai Bergström", company: "VREX Studio", email: "kai@vrex.studio", phone: "+46 70 123 4567", country: "Sweden", totalSpent: 4500, projects: 1, orders: 1, bookings: 1, leadStatus: "won", lastActivity: "2026-07-20", createdAt: "2026-07-01" },
  { id: "4", name: "Sarah Chen", company: "TechCorp", email: "sarah@techcorp.com", phone: "+1 555 0101", country: "United States", totalSpent: 0, projects: 0, orders: 1, bookings: 1, leadStatus: "qualified", lastActivity: "2026-08-13", createdAt: "2026-08-10" },
  { id: "5", name: "Emma Reynolds", company: "Luxe Group", email: "emma@luxegroup.co", phone: "+44 7700 900234", country: "United Kingdom", totalSpent: 0, projects: 0, orders: 1, bookings: 1, leadStatus: "proposal_sent", lastActivity: "2026-08-13", createdAt: "2026-08-13" },
];

export const messages: Message[] = [
  { id: "1", from: "Rania Khalil", email: "rania@designstudio.ae", company: "Design Studio AE", subject: "Product visualization for luxury perfume line", preview: "We're launching a new fragrance collection and need...", fullMessage: "We're launching a new fragrance collection and need photorealistic CGI renders for our campaign. Six bottles across four colorways. Timeline is 8 weeks before launch.", projectType: "Product Visualization", budget: "$5,000 – $10,000", timeline: "8 weeks", read: false, createdAt: "2026-08-13" },
  { id: "2", from: "James Okafor", email: "james@gamedev.studio", company: "Pixel Forge", subject: "Open world environment — fantasy biome", preview: "Working on a fantasy RPG and need a single biome...", fullMessage: "Working on a fantasy RPG and need a single biome environment built for Unreal Engine 5. Roughly 1km² of terrain with unique vegetation and architectural ruins.", projectType: "Digital Environments", budget: "$15,000 – $30,000", timeline: "10 weeks", read: false, createdAt: "2026-08-12" },
  { id: "3", from: "Leila Sousa", email: "leila@architectsco.br", company: "Architects Co.", subject: "Residential complex visualization — São Paulo", preview: "We have a 12-building residential complex and need...", fullMessage: "We have a 12-building residential complex and need exterior and interior visualizations for a sales campaign. We can provide BIM files and material specifications.", projectType: "Architecture CGI", budget: "$20,000+", timeline: "6 weeks", read: true, createdAt: "2026-08-11" },
];

export const invoices: Invoice[] = [
  { id: "1", invoiceNumber: "INV-2026-0041", customer: "Marcus Webb", email: "marcus@axiom.tech", project: "AXIOM CGI Campaign", subtotal: 3800, tax: 0, discount: 0, total: 3800, deposit: 1900, balance: 0, paymentStatus: "paid", dueDate: "2026-08-28", createdAt: "2026-07-28" },
  { id: "2", invoiceNumber: "INV-2026-0042", customer: "Priya Nakamura", email: "priya@studiovantage.com", project: "MERIDIAN Environment", subtotal: 38000, tax: 0, discount: 0, total: 38000, deposit: 19000, balance: 19000, paymentStatus: "partially_paid", dueDate: "2026-09-15", createdAt: "2026-08-01" },
  { id: "3", invoiceNumber: "INV-2026-0043", customer: "Kai Bergström", email: "kai@vrex.studio", project: "VERTEX Motion System", subtotal: 4500, tax: 0, discount: 0, total: 4500, deposit: 2250, balance: 0, paymentStatus: "paid", dueDate: "2026-07-30", createdAt: "2026-07-15" },
];

export const auditLog = [
  { id: "1", action: "UPDATED", entity: "PROJECT", entityName: "ORBITAL", user: "Admin", timestamp: "2026-08-13 14:32", detail: "Published status set to published" },
  { id: "2", action: "CREATED", entity: "BOOKING", entityName: "ORVEX-BOOK-2026-0004", user: "System", timestamp: "2026-08-13 12:18", detail: "New booking created by Emma Reynolds" },
  { id: "3", action: "UPDATED", entity: "ORDER", entityName: "ORVEX-ORD-2026-0041", user: "Admin", timestamp: "2026-08-10 09:45", detail: "Payment status updated to paid" },
  { id: "4", action: "CREATED", entity: "INVOICE", entityName: "INV-2026-0043", user: "Admin", timestamp: "2026-08-08 11:22", detail: "Invoice generated for Kai Bergström" },
  { id: "5", action: "DELETED", entity: "MEDIA", entityName: "draft_render_v2.jpg", user: "Admin", timestamp: "2026-08-07 16:55", detail: "Media file removed from library" },
];
