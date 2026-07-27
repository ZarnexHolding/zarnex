/**
 * Long-form company content, keyed by slug.
 *
 * Split from `companies.ts` so the index and the WebGL scene never pull page
 * content into their bundles. A company with no entry here renders a hero and
 * an honest "profile in preparation" — never invented copy.
 *
 * Every string traces to that company's own profile documents. See:
 *   docs/02-ifmc.md · docs/03-glitch-morph.md · docs/04-xlive.md · docs/05-energ.md
 */

export type ServiceGroup = { group: string; items: string[] };

export type Project = {
  name: string;
  client?: string;
  year?: string;
  scope: string;
  /**
   * Media key from lib/media.ts. Set ONLY where the client's own brand is
   * visible in the frame — an image attributed to the wrong project is worse
   * than no image at all.
   */
  image?: string;
};

export type Stat = { value: string; label: string };

export type CompanyContent = {
  /** <= 45 words. */
  overview: string;
  services: ServiceGroup[];
  /** Section hidden entirely when absent — no placeholders. */
  projects?: Project[];
  /** Rendered as a typographic wall until SVG marks and clearances arrive. */
  clients?: string[];
  clientsNote?: string;
  stats?: Stat[];
  vision?: string;
  mission?: string;
  /**
   * Slugs of companies this one genuinely works with. Sector overlap alone is a
   * weak signal — X Live shares no sector with Laniakea or Lumen, yet those are
   * exactly who it delivers a mega-event alongside. Falls back to shared
   * sectors when not set.
   */
  related?: string[];
  /** Media key for the full-bleed hero. */
  hero?: string;
  /** Media keys for the gallery. Section hidden when absent. */
  gallery?: string[];
};

export const COMPANY_CONTENT: Record<string, CompanyContent> = {
  "x-live": {
    overview:
      "A fully integrated event production and experience engineering company. Designers, engineers, fabricators and project managers under one roof, delivering turnkey events, exhibitions, fit-out and temporary structures across the Middle East.",
    stats: [
      { value: "3×", label: "Saudi Arabian Grand Prix delivered" },
      { value: "4", label: "Fabrication sectors served" },
      { value: "6", label: "Production divisions" },
    ],
    services: [
      {
        group: "Technical Production",
        items: [
          "Stage design and fabrication",
          "Lighting design and programming",
          "Professional audio systems",
          "LED screens and media facades",
          "Projection mapping",
          "Special effects",
        ],
      },
      {
        group: "Event Build & Fabrication",
        items: [
          "Branding and signage systems",
          "Custom structures and scenic elements",
          "Exhibition stands and pavilions",
          "Temporary installations",
          "Modular build solutions",
        ],
      },
      {
        group: "Live Show & Entertainment",
        items: [
          "Opening and closing ceremonies",
          "Live shows and performances",
          "Artist and talent coordination",
          "Show calling and cue management",
          "Technical run-throughs",
        ],
      },
      {
        group: "Event Operations",
        items: [
          "End-to-end project management",
          "Production scheduling and logistics",
          "Vendor coordination",
          "Health, safety and risk management",
          "On-ground supervision",
        ],
      },
      {
        group: "Digital & Immersive",
        items: [
          "Virtual and hybrid events",
          "AR and VR activations",
          "Interactive installations",
          "Virtual production",
        ],
      },
      {
        group: "Fit-out & Metal Fabrication",
        items: [
          "Laser, plasma and waterjet cutting",
          "CNC machining and milling",
          "Certified structural welding",
          "Architectural metalwork",
          "Powder coating and anodizing",
        ],
      },
    ],
    projects: [
      {
        name: "Saudi Arabian Grand Prix 2025",
        client: "Saudi Motorsport Co.",
        year: "Q1 2025",
        scope:
          "Full venue branding, grandstand fascia and risers, permanent wayfinding, facade and tent branding, temporary structures.",
        image: "sagp-entrance-night",
      },
      {
        name: "Dakar Rally 2024",
        client: "ASO / KSA Events",
        year: "Jan 2024",
        scope:
          "Route directional signage, branding systems, temporary structures and canopies.",
        image: "dakar-red-sea-camp",
      },
      {
        name: "Red Bull Air Race 2024",
        client: "Red Bull GmbH",
        year: "2024",
        scope:
          "Temporary structures, event branding, custom fabricated elements and bridge branding.",
      },
      {
        name: "WRC Branding & Activation 2024",
        client: "International Federation",
        year: "2024",
        scope:
          "Full venue branding, activation structures, exhibition stands and printed media.",
      },
      {
        name: "ENEC Exhibition Stand 2024",
        client: "ENEC",
        year: "2024",
        scope:
          "Custom double-deck exhibition stand with graphics and LED/AV integration.",
      },
      {
        name: "Fortinet Corporate Event 2024",
        client: "Fortinet Inc.",
        year: "2024",
        scope:
          "Corporate event branding, signage systems, stage environment and custom fabrication.",
        image: "fortinet-stand",
      },
      {
        name: "Katusha Event 2025",
        client: "Katusha",
        year: "2025",
        scope:
          "Exhibition stand, bespoke fabricated structures, branding and signage systems.",
        image: "katusha-stand",
      },
    ],
    clients: [
      "International motorsport federations",
      "Government ministries and authorities",
      "Corporate and luxury brands",
      "Event organizers and agencies",
      "Tourism and entertainment commissions",
    ],
    clientsNote: "Client categories as stated in the company profile.",
    // The mega-event delivery stack: the show, the light, the pictures.
    related: ["laniakea", "lumen-arabia", "glitch-morph"],
    hero: "jeddah-heart-of-racing",
    gallery: [
      "jcc-facade",
      "circuit-barriers-night",
      "aramco-tower-wrap",
      "f1-lightbox-gallery",
      "jcc-bridge-day",
      "paddock-graphics",
      "wayfinding-totem",
      "fastest-street-circuit",
      "jcc-signage",
      "katusha-stand-interior",
      "exhibition-stand-blue",
    ],
  },

  ifmc: {
    overview:
      "Integrated facility management, environmental services, workforce solutions and civil infrastructure across Saudi Arabia. A single operator for the systems that keep buildings, events and cities running.",
    stats: [
      { value: "600+", label: "Workforce" },
      { value: "4M+", label: "Gallons of sewage treated daily" },
      { value: "10", label: "Sewage treatment plants operated" },
      { value: "20,000t", label: "Recycling capacity" },
    ],
    services: [
      {
        group: "Facilities Management",
        items: [
          "Facility operations and support centre",
          "Total property care",
          "Maintenance and operation services",
          "Strategic consultancy and feasibility",
        ],
      },
      {
        group: "Cleaning & Hospitality",
        items: [
          "Comprehensive cleaning services",
          "Facade and high-pressure cleaning",
          "Healthcare and infection control",
          "Hospitality and housekeeping",
          "Pest control and fumigation",
        ],
      },
      {
        group: "Engineering & Technical",
        items: [
          "MEP maintenance",
          "HVAC systems",
          "Lift and elevator maintenance",
          "ELV and building systems",
          "Fire and safety",
        ],
      },
      {
        group: "Civil Construction",
        items: [
          "Structural and concrete works",
          "Infrastructure and utility networks",
          "Industrial and commercial buildings",
          "Excavation and earthworks",
          "Project management and supervision",
        ],
      },
      {
        group: "Environmental Solutions",
        items: [
          "Waste and wastewater management",
          "Sewage treatment plants",
          "Water and sewage tankers",
          "Recycling and resource recovery",
          "RO desalination and water treatment",
        ],
      },
      {
        group: "Workforce & Security",
        items: [
          "Construction and hospitality manpower",
          "Aviation and logistics staffing",
          "Professional and executive search",
          "CCTV and access control",
          "Licensed security deployment",
        ],
      },
    ],
    projects: [
      {
        name: "Formula 1 Saudi Arabia",
        client: "DO & CO",
        year: "2025",
        scope:
          "Hospitality staffing with trained uniformed personnel, strict hygiene protocols and ongoing supervision.",
      },
      {
        name: "Diriyah Season",
        client: "Blink Experience",
        year: "2019",
        scope:
          "End-to-end waste management and environmental support across the heritage zone for public and VIP events.",
      },
      {
        name: "Jeddah Season",
        client: "Sela",
        year: "2021–22",
        scope:
          "Waste collection, segregation and disposal with real-time volume monitoring and rotating sanitation teams.",
      },
      {
        name: "Jeddah Municipality rainstorm response",
        client: "Jeddah Municipality",
        year: "2023",
        scope:
          "Rapid-response waste clearance, drainage support and debris removal across urban and residential zones.",
      },
      {
        name: "AGS International Schools",
        client: "AGS",
        year: "2022–25",
        scope:
          "Full integrated FM: cleaning and sanitation, preventive HVAC and MEP maintenance, landscaping, recycling programme.",
      },
      {
        name: "Dawiyat Data Centres",
        client: "Dawiyat / China Saudi Communications",
        year: "1 year",
        scope:
          "Civil, power, cooling, ELV, fire and plumbing systems across data centres in Riyadh and Dammam.",
      },
      {
        name: "TAWAL B2S telecom towers",
        client: "TAWAL / China Com Service",
        year: "1 year",
        scope:
          "35 towers, 35–60m, kingdom-wide: foundations, erection, power, grounding, testing and commissioning.",
      },
      {
        name: "Saudi Arabian Grand Prix",
        client: "PROFM / Aramco",
        year: "2021–24",
        scope:
          "Office cleaning and facility support in a high-performance industrial environment under Aramco standards.",
      },
    ],
    clients: [
      "Halliburton",
      "Worley",
      "Radisson Blu",
      "Le Méridien",
      "LuLu",
      "DO & CO",
      "Jeddah Municipality",
      "Saudi Fransi Capital",
      "Nesma Infrastructure & Technology",
      "Sela",
      "Blink Experience",
      "Saudi Motorsport",
      "AGS International Schools",
      "Almana",
      "Renovix Construction",
      "Alansari Holding",
      "UNIMAC",
      "Access World",
    ],
    // Everything IFMC keeps running: the buildings, the events, the power.
    related: ["zarnex-real-estate", "x-live", "energ"],
    hero: "workforce-assembly",
    gallery: [
      "workforce-site",
      "industrial-plant",
      "school-classroom",
      "sports-track-cleaning",
      "facility-floor-care",
      "perimeter-works",
      "landscaping-works",
      "tanker-fleet",
      "water-tanker-depot",
      "gym-facility-care",
      "paddock-club-team",
    ],
  },

  "glitch-morph": {
    overview:
      "A next-generation creative studio bridging classic storytelling with the technologies of tomorrow. Concept, 3D, virtual production and post — engineered to inspire a world yet to come.",
    stats: [
      { value: "200+", label: "Projects delivered" },
      { value: "50+", label: "Clients" },
      { value: "6", label: "Studio divisions" },
    ],
    vision:
      "To reengineer the creative landscape — blending human artistry with machine precision, tradition with technology, Earth with digital universes.",
    services: [
      {
        group: "Concept Development",
        items: [
          "Narrative and world building",
          "Creative strategy",
          "Experience design",
        ],
      },
      {
        group: "3D Animation Studio",
        items: [
          "Architectural visualisation",
          "3D events design",
          "Digital twins",
          "Metaverse environments",
        ],
      },
      {
        group: "Virtual Reality",
        items: ["AR experiences", "VR experiences", "Mixed reality"],
      },
      {
        group: "Production House",
        items: [
          "Ideation and pre-production",
          "Shooting and direction",
          "Hybrid physical and virtual production",
        ],
      },
      {
        group: "Content Production",
        items: [
          "Video production",
          "Photography",
          "20K screen content graphics",
          "Social media content",
          "Real estate marketing content",
        ],
      },
      {
        group: "Post-Production",
        items: ["Editing", "VFX", "Sound mix", "Colour science"],
      },
    ],
    clients: [
      "NEOM",
      "Ferrari",
      "BMW",
      "Mercedes-AMG",
      "Louis Vuitton",
      "Givenchy",
      "Versace Home",
      "Van Cleef & Arpels",
      "IWC Schaffhausen",
      "Ulysse Nardin",
      "Jaguar",
      "Nissan",
      "Porsche",
      "Burj Khalifa",
      "Expo 2020 Dubai",
      "COP27",
      "COP28 UAE",
      "Mubadala",
      "DAMAC",
      "DAR Global",
      "Saudi Founding Day",
      "Saudi Arabian Grand Prix",
      "Dubai World Trade Centre",
      "GITEX Technology Week",
      "du",
      "Arla",
      "Vichy Laboratoires",
      "Pico",
      "GL Events",
      "Auditoire",
    ],
    // The content and experience side of the group.
    related: ["wr1-studios", "laniakea", "hikma-comics"],
    hero: "nissan-pavilion-night",
    gallery: [
      "du-activation",
      "nissan-tunnel",
      "liwa-gate",
      "cop28-green-zone",
      "vichy-installation",
      "iwc-boutique",
      "bmw-stand",
      "activation-aerial",
      "island-masterplan",
      "retail-facade",
      "showroom-desert",
    ],
  },

  energ: {
    overview:
      "A solar EPC delivering turnkey renewable energy across residential, commercial, industrial and agricultural sectors in Saudi Arabia and the GCC — from feasibility and design through installation, commissioning and long-term maintenance.",
    stats: [
      { value: "80%", label: "Reduction in electricity and fuel costs" },
      { value: "25+ yr", label: "System lifespan" },
      { value: "6", label: "Phase delivery methodology" },
    ],
    vision:
      "To be the leading solar energy provider supporting food security, water sustainability, and rural development across Saudi Arabia and the GCC.",
    mission:
      "To design, install, and maintain solar power systems that improve operational efficiency, reduce costs, and lower carbon emissions for agriculture.",
    services: [
      {
        group: "Solar Water Pumping",
        items: [
          "Deep well pump systems",
          "Variable frequency drives",
          "Irrigation networks",
          "Livestock water supply",
          "Smart monitoring",
        ],
      },
      {
        group: "Farm Power Systems",
        items: [
          "Irrigation and cooling",
          "Lighting and office power",
          "Cold storage",
          "Electric fencing",
          "Water treatment",
        ],
      },
      {
        group: "Hybrid & Storage",
        items: [
          "Solar with grid and battery",
          "Battery energy storage",
          "Backup power",
          "Off-grid independence",
        ],
      },
      {
        group: "Solar PV Systems",
        items: [
          "Ground-mounted plants",
          "Rooftop installations",
          "DC collection systems",
          "AC distribution",
          "Remote monitoring",
        ],
      },
      {
        group: "Engineering & Design",
        items: [
          "Solar resource assessment",
          "Energy demand analysis",
          "Load calculations and pump sizing",
          "System simulation",
          "ROI modelling",
        ],
      },
      {
        group: "Operation & Maintenance",
        items: [
          "Performance monitoring",
          "Preventive maintenance",
          "Troubleshooting",
          "System optimisation",
          "Operator training",
        ],
      },
    ],
    // What ENER-G powers, and who plans it.
    related: ["ifmc", "zarnex-real-estate", "neptune-studios"],
    hero: "array-desert-dawn",
    gallery: [
      "ground-mount-array",
      "engineers-array-sunset",
      "rooftop-inspection",
      "pivot-irrigation-aerial",
      "battery-storage-room",
      "control-room",
      "rooftop-mosque-array",
      "site-installation",
      "structure-build",
    ],
  },
};

export const getContent = (slug: string): CompanyContent | undefined =>
  COMPANY_CONTENT[slug];
