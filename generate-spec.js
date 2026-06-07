const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat
} = require('docx');
const fs = require('fs');

// ── COLORS ──────────────────────────────────────────────────────────────────
const NAVY    = "0D2B6B";
const GOLD    = "C9A84C";
const WHITE   = "FFFFFF";
const DARK    = "1A1A1A";
const GRAY    = "555555";
const LGRAY   = "F4F4F4";
const BORDER  = "CCCCCC";
const CODE_BG = "1E1E2E";
const CODE_FG = "CDD6F4";
const GREEN   = "166534";
const GRENBG  = "DCFCE7";
const BLUE    = "1E40AF";
const BLUEBG  = "DBEAFE";
const PURPLE  = "6B21A8";
const PURBG   = "F3E8FF";
const RED     = "991B1B";
const REDBG   = "FEE2E2";
const AMBER   = "92400E";
const AMBERBG = "FEF3C7";

const bdr = (c = BORDER) => ({ style: BorderStyle.SINGLE, size: 1, color: c });
const bds = (c) => ({ top: bdr(c), bottom: bdr(c), left: bdr(c), right: bdr(c) });
const nob = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });
const nobs = () => ({ top: nob(), bottom: nob(), left: nob(), right: nob() });

function sp(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ children: [new TextRun("")], spacing: { after: 0 } })
  );
}

// ── HELPERS ─────────────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Consolas", size: 28, bold: true, color: NAVY })],
    spacing: { before: 480, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: GOLD, space: 4 } }
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Consolas", size: 22, bold: true, color: NAVY })],
    spacing: { before: 320, after: 100 }
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: "Consolas", size: 19, bold: true, color: GRAY })],
    spacing: { before: 200, after: 80 }
  });
}

function body(text, bold = false, color = DARK) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 19, bold, color })],
    spacing: { after: 80 }
  });
}

function bull(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    children: [new TextRun({ text, font: "Arial", size: 19, color: DARK })],
    spacing: { after: 55 }
  });
}

function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Consolas", size: 17, color: CODE_FG })],
    shading: { fill: CODE_BG, type: ShadingType.CLEAR },
    spacing: { after: 0 },
    indent: { left: 360 }
  });
}

function codeBlock(lines) {
  return lines.map(l => code(l));
}

function label(text, bg = BLUEBG, color = BLUE) {
  return new Paragraph({
    children: [new TextRun({ text: ` ${text} `, font: "Consolas", size: 16, bold: true, color })],
    shading: { fill: bg, type: ShadingType.CLEAR },
    spacing: { after: 60 }
  });
}

function hc(text, w, bg = NAVY, fs = 17) {
  return new TableCell({
    borders: bds(NAVY),
    width: { size: w, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 90, bottom: 90, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: "Consolas", size: fs, bold: true, color: WHITE })]
    })]
  });
}

function dc(text, w, bg = WHITE, bold = false, align = AlignmentType.LEFT, color = DARK, fs = 17, font = "Arial") {
  return new TableCell({
    borders: bds(BORDER),
    width: { size: w, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, font, size: fs, bold, color })]
    })]
  });
}

function tbl(headers, rows, colW, hbg = NAVY) {
  const total = colW.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colW,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => hc(h, colW[i], hbg))
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((cell, ci) => {
            if (typeof cell === 'object' && cell !== null) {
              return dc(cell.text || "", colW[ci], cell.bg || (ri % 2 === 0 ? WHITE : LGRAY),
                cell.bold || false, cell.align || AlignmentType.LEFT, cell.color || DARK, cell.fs || 17, cell.font || "Arial");
            }
            return dc(String(cell), colW[ci], ri % 2 === 0 ? WHITE : LGRAY);
          })
        })
      )
    ]
  });
}

function featureBlock(tag, name, description, endpoints, schema, techNotes, dependencies) {
  const items = [];

  // Feature tag header
  items.push(new Paragraph({
    children: [
      new TextRun({ text: `[${tag}]`, font: "Consolas", size: 20, bold: true, color: WHITE }),
      new TextRun({ text: `  ${name}`, font: "Consolas", size: 20, bold: true, color: WHITE }),
    ],
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    spacing: { before: 240, after: 0 },
    indent: { left: 0 }
  }));

  // Description
  items.push(new Paragraph({
    children: [new TextRun({ text: description, font: "Arial", size: 19, color: DARK })],
    shading: { fill: BLUEBG, type: ShadingType.CLEAR },
    spacing: { after: 100 }
  }));

  // Endpoints
  if (endpoints && endpoints.length) {
    items.push(new Paragraph({
      children: [new TextRun({ text: "API Endpoints", font: "Consolas", size: 18, bold: true, color: GREEN })],
      spacing: { before: 80, after: 40 }
    }));
    endpoints.forEach(ep => {
      const [method, ...rest] = ep.split(" ");
      const path = rest.join(" ");
      items.push(new Paragraph({
        children: [
          new TextRun({ text: `  ${method} `, font: "Consolas", size: 17, bold: true, color: method === "GET" ? BLUE : method === "POST" ? GREEN : method === "DELETE" ? RED : AMBER }),
          new TextRun({ text: path, font: "Consolas", size: 17, color: DARK }),
        ],
        spacing: { after: 30 }
      }));
    });
  }

  // Schema
  if (schema && schema.length) {
    items.push(new Paragraph({
      children: [new TextRun({ text: "DB Schema (key fields)", font: "Consolas", size: 18, bold: true, color: PURPLE })],
      spacing: { before: 80, after: 40 }
    }));
    items.push(...codeBlock(schema));
    items.push(...sp(1));
  }

  // Tech Notes
  if (techNotes && techNotes.length) {
    items.push(new Paragraph({
      children: [new TextRun({ text: "Tech Notes", font: "Consolas", size: 18, bold: true, color: AMBER })],
      spacing: { before: 80, after: 40 }
    }));
    techNotes.forEach(n => items.push(bull(n)));
  }

  // Dependencies
  if (dependencies && dependencies.length) {
    items.push(new Paragraph({
      children: [new TextRun({ text: "Dependencies / Integrations", font: "Consolas", size: 18, bold: true, color: RED })],
      spacing: { before: 80, after: 40 }
    }));
    dependencies.forEach(d => items.push(bull(d)));
  }

  items.push(...sp(1));
  return items;
}

// ── DOCUMENT ────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 560, hanging: 280 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 900, hanging: 280 } } } },
        ]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 19 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Consolas", color: NAVY },
        paragraph: { spacing: { before: 480, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Consolas", color: NAVY },
        paragraph: { spacing: { before: 320, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 19, bold: true, font: "Consolas", color: GRAY },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "SARAH TRAVELS BD — Feature & Tech Spec for Antigravity AI", font: "Consolas", size: 16, color: GRAY }),
            new TextRun({ text: "    |    v1.0    |    June 2026", font: "Consolas", size: 16, color: BORDER }),
          ],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 3 } },
          spacing: { after: 0 }
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Sarah Travels BD  |  Page ", font: "Consolas", size: 15, color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Consolas", size: 15, color: GRAY }),
          ],
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 3 } },
          alignment: AlignmentType.CENTER,
          spacing: { before: 60 }
        })]
      })
    },
    children: [

      // ════════════════════════════════════════════════════════════════════
      // COVER
      // ════════════════════════════════════════════════════════════════════
      new Paragraph({ children: [new TextRun("")], spacing: { after: 1000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "SARAH TRAVELS BD", font: "Consolas", size: 72, bold: true, color: NAVY })],
        spacing: { after: 120 }
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Complete Feature Specification + Tech Stack", font: "Consolas", size: 32, bold: true, color: GOLD })],
        spacing: { after: 80 }
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Optimized for Antigravity AI Ingestion", font: "Arial", size: 22, color: GRAY, italics: true })],
        spacing: { after: 600 }
      }),
      tbl(["Field", "Value"], [
        ["Project", "Sarah Travels BD — Bangladesh OTA Platform"],
        ["Document Purpose", "AI code generation prompt spec — feed this entire document to Antigravity"],
        ["Stack", "Turborepo / NestJS / Next.js 14 / React Native / PostgreSQL / MongoDB / Redis"],
        ["Dev Tool", "Cursor Pro + Antigravity AI"],
        ["Total Features", "73+ features across 14 modules"],
        ["Target Market", "Bangladesh — B2C + B2B Travel, Umrah, Visa, Education, Manpower"],
        ["Version", "1.0 — June 2026"],
      ], [2400, 7360]),
      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════════════════════════════
      // SECTION 1: HOW TO USE THIS DOCUMENT
      // ════════════════════════════════════════════════════════════════════
      h1("HOW TO USE THIS DOCUMENT WITH ANTIGRAVITY"),
      body("Feed this entire document to Antigravity as the project specification. Each feature block follows this structure:", true),
      ...sp(1),
      tbl(["Field", "Meaning"], [
        ["[TAG]", "Unique feature identifier — use as NestJS module/service name"],
        ["Description", "What the feature does — use as the prompt context"],
        ["API Endpoints", "Exact REST endpoints to generate — method + path"],
        ["DB Schema", "Key Prisma/TypeORM fields to scaffold"],
        ["Tech Notes", "Architecture decisions Antigravity must follow"],
        ["Dependencies", "External APIs, packages, or other modules required"],
      ], [2000, 7760]),
      ...sp(1),
      body("Suggested Antigravity prompt prefix to prepend before each feature:", true),
      ...codeBlock([
        `You are building a NestJS microservice for Sarah Travels BD, a Bangladesh OTA platform.`,
        `Stack: NestJS + TypeScript + PostgreSQL (TypeORM) + MongoDB (Mongoose) + Redis + BullMQ.`,
        `Monorepo: Turborepo. All services live in apps/api/src/modules/<module-name>.`,
        `Follow NestJS best practices: controllers, services, DTOs, guards, interceptors.`,
        `All responses use a standard wrapper: { success, data, message, statusCode }.`,
        `All endpoints require JWT auth unless marked [PUBLIC].`,
        `Bengali language support: all user-facing strings use i18n keys.`,
        `Now build the following feature:`,
      ]),
      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════════════════════════════
      // SECTION 2: MONOREPO STRUCTURE
      // ════════════════════════════════════════════════════════════════════
      h1("MONOREPO STRUCTURE"),
      ...codeBlock([
        "sarah-travels-bd/",
        "├── apps/",
        "│   ├── web/                    # Next.js 14 — Customer frontend",
        "│   ├── admin/                  # Next.js 14 — Admin panel",
        "│   ├── agent/                  # Next.js 14 — B2B Agent portal",
        "│   ├── mobile/                 # React Native (Expo) — Customer + Agent apps",
        "│   └── api/                    # NestJS — All microservices",
        "│       └── src/",
        "│           └── modules/",
        "│               ├── auth/",
        "│               ├── flight/",
        "│               ├── hotel/",
        "│               ├── visa/",
        "│               ├── umrah/",
        "│               ├── tour/",
        "│               ├── education/",
        "│               ├── manpower/",
        "│               ├── booking/",
        "│               ├── payment/",
        "│               ├── agent/",
        "│               ├── accounting/",
        "│               ├── crm/",
        "│               ├── ai/",
        "│               ├── notification/",
        "│               ├── counter/",
        "│               └── loyalty/",
        "├── packages/",
        "│   ├── ui/                     # Shared React components",
        "│   ├── database/               # Prisma schema + migrations",
        "│   ├── config/                 # Shared env config",
        "│   └── types/                  # Shared TypeScript types",
        "├── turbo.json",
        "└── package.json",
      ]),
      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════════════════════════════
      // SECTION 3: TECH STACK (COMPLETE)
      // ════════════════════════════════════════════════════════════════════
      h1("COMPLETE TECH STACK"),

      h2("Backend"),
      tbl(["Layer", "Technology", "Version", "Purpose"], [
        ["Runtime", "Node.js", "20 LTS", "Backend runtime"],
        ["Framework", "NestJS", "10.x", "Microservices, DI, guards, interceptors"],
        ["Language", "TypeScript", "5.x", "Type safety across all services"],
        ["ORM (SQL)", "TypeORM", "0.3.x", "PostgreSQL — bookings, payments, accounting"],
        ["ODM (NoSQL)", "Mongoose", "8.x", "MongoDB — content: hotels, tours, visa info"],
        ["Validation", "class-validator + class-transformer", "latest", "DTO validation on all endpoints"],
        ["Auth", "@nestjs/jwt + passport", "latest", "JWT access + refresh token auth"],
        ["Queue", "BullMQ + @nestjs/bull", "latest", "Async: ticketing, notifications, refunds"],
        ["Cache", "ioredis + @nestjs/cache-manager", "latest", "Redis — search cache, sessions"],
        ["Config", "@nestjs/config", "latest", "Environment variable management"],
        ["HTTP Client", "Axios + @nestjs/axios", "latest", "GDS API calls, payment gateways"],
        ["PDF", "Puppeteer", "21.x", "PDF ticket and invoice generation"],
        ["File Upload", "Multer + AWS SDK v3", "latest", "Document uploads to S3/DO Spaces"],
        ["Scheduler", "@nestjs/schedule", "latest", "Cron: void window, schedule change detection"],
        ["Events", "@nestjs/event-emitter", "latest", "Domain events between modules"],
        ["Search", "Elasticsearch client", "8.x", "Flight and hotel fast search"],
        ["Logging", "Winston + nest-winston", "latest", "Structured logging with audit trail"],
        ["Testing", "Jest + Supertest", "latest", "Unit and e2e tests"],
      ], [1800, 2600, 1400, 4560]),

      ...sp(1),
      h2("Frontend (Web)"),
      tbl(["Layer", "Technology", "Version", "Purpose"], [
        ["Framework", "Next.js", "14 (App Router)", "SSR/SSG — SEO critical for OTA"],
        ["Language", "TypeScript", "5.x", "Type safety"],
        ["Styling", "Tailwind CSS", "3.x", "Utility-first CSS"],
        ["UI Components", "shadcn/ui", "latest", "Accessible component library"],
        ["State", "Zustand", "4.x", "Global client state (cart, auth, search)"],
        ["Server State", "TanStack Query", "5.x", "API data fetching and caching"],
        ["Forms", "React Hook Form + Zod", "latest", "Form validation"],
        ["i18n", "next-intl", "3.x", "Bengali + English language support"],
        ["Maps", "Leaflet / Google Maps API", "latest", "Hotel map view"],
        ["Charts", "Recharts", "latest", "Admin BI dashboard"],
        ["PDF Preview", "react-pdf", "latest", "Ticket preview in browser"],
        ["Date", "date-fns + Hijri calendar lib", "latest", "Gregorian + Hijri for Umrah"],
        ["Animation", "Framer Motion", "latest", "UI transitions"],
      ], [1800, 2600, 1800, 4160]),

      ...sp(1),
      h2("Mobile (React Native)"),
      tbl(["Layer", "Technology", "Version", "Purpose"], [
        ["Framework", "React Native + Expo", "SDK 51", "iOS + Android from one codebase"],
        ["Navigation", "React Navigation v6", "latest", "Stack + Tab + Drawer navigation"],
        ["State", "Zustand", "4.x", "Shared with web platform"],
        ["API", "TanStack Query", "5.x", "Data fetching, offline support"],
        ["Push Notifications", "Expo Notifications + Firebase FCM", "latest", "Push alerts"],
        ["Offline", "MMKV + AsyncStorage", "latest", "Save tickets offline"],
        ["Camera", "Expo Camera + ImagePicker", "latest", "Passport/document scanning"],
        ["PDF", "expo-print + expo-sharing", "latest", "Download and share tickets"],
      ], [1800, 2600, 1800, 4160]),

      ...sp(1),
      h2("Databases"),
      tbl(["Database", "Use Case", "Hosted On"], [
        ["PostgreSQL 16", "Bookings, users, agents, payments, accounting, loyalty — all transactional ACID data", "DigitalOcean Managed DB"],
        ["MongoDB 7", "Hotel content, tour packages, visa info, CMS content, search indexes — document data", "MongoDB Atlas"],
        ["Redis 7", "Search result cache (15 min TTL), sessions, BullMQ queues, rate limiting counters", "DigitalOcean Managed Redis"],
        ["Elasticsearch 8", "Fast full-text search: flight routes, hotels, destinations, autocomplete", "Elastic Cloud / Self-hosted"],
      ], [2000, 5200, 2560]),

      ...sp(1),
      h2("Infrastructure"),
      tbl(["Service", "Provider", "Purpose"], [
        ["Cloud", "DigitalOcean (primary) / AWS (backup)", "App hosting, managed databases"],
        ["CDN", "Cloudflare", "Static assets, DDoS protection, BD edge caching"],
        ["Container", "Docker + Docker Compose", "Local dev and staging"],
        ["Orchestration", "DigitalOcean App Platform / Kubernetes", "Production scaling"],
        ["CI/CD", "GitHub Actions", "Auto-deploy on merge to main"],
        ["File Storage", "DigitalOcean Spaces (S3-compatible)", "Visa docs, tickets, invoices, photos"],
        ["Email", "SendGrid", "Transactional emails: tickets, invoices, OTP"],
        ["Monitoring", "Grafana + Prometheus", "Uptime, response time, error rates"],
        ["Error Tracking", "Sentry", "Runtime error tracking frontend + backend"],
        ["Logs", "Logtail / Papertrail", "Centralized log management"],
      ], [1800, 3200, 4760]),

      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════════════════════════════
      // SECTION 4: STANDARD PATTERNS
      // ════════════════════════════════════════════════════════════════════
      h1("STANDARD CODE PATTERNS (Apply to All Modules)"),

      h2("Standard API Response"),
      ...codeBlock([
        "// packages/types/src/api-response.ts",
        "export interface ApiResponse<T> {",
        "  success: boolean;",
        "  data: T | null;",
        "  message: string;",
        "  statusCode: number;",
        "  meta?: { total?: number; page?: number; limit?: number; };",
        "}",
      ]),
      ...sp(1),

      h2("Standard NestJS Module Structure"),
      ...codeBlock([
        "apps/api/src/modules/<module>/",
        "├── <module>.module.ts",
        "├── <module>.controller.ts",
        "├── <module>.service.ts",
        "├── dto/",
        "│   ├── create-<module>.dto.ts",
        "│   ├── update-<module>.dto.ts",
        "│   └── query-<module>.dto.ts",
        "├── entities/",
        "│   └── <module>.entity.ts       # TypeORM entity",
        "├── schemas/",
        "│   └── <module>.schema.ts       # Mongoose schema (if MongoDB)",
        "├── guards/",
        "│   └── <module>.guard.ts",
        "└── interfaces/",
        "    └── <module>.interface.ts",
      ]),
      ...sp(1),

      h2("JWT Auth Guard — Apply to all protected routes"),
      ...codeBlock([
        "// Use @UseGuards(JwtAuthGuard) on controller",
        "// Use @Public() decorator to exempt public endpoints",
        "// User extracted from request: req.user = { id, email, role, agentId? }",
        "",
        "// Roles: CUSTOMER | AGENT | SUB_AGENT | STAFF | ACCOUNTANT | MANAGER | ADMIN",
        "// Use @Roles(Role.ADMIN, Role.MANAGER) + RolesGuard for RBAC",
      ]),
      ...sp(1),

      h2("Audit Log — Apply to all booking mutations"),
      ...codeBlock([
        "// Every create/update/delete on booking-related entities must log:",
        "// { userId, userRole, action, entityType, entityId, oldValue, newValue, ip, userAgent, timestamp }",
        "// Store in PostgreSQL audit_logs table — never delete these records",
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════════════════════════════
      // SECTION 5: FEATURE MODULES
      // ════════════════════════════════════════════════════════════════════
      h1("FEATURE MODULES — COMPLETE SPECIFICATION"),

      // ── MODULE 01: AUTH ────────────────────────────────────────────────
      ...featureBlock(
        "MODULE-01", "Authentication & User Management",
        "Handles registration, login, OTP verification, JWT token management, and role-based access. Supports customers, agents, sub-agents, and staff with different permission levels.",
        [
          "POST /auth/register                    # Email + phone registration",
          "POST /auth/login                       # Email/phone + password",
          "POST /auth/social-login                # Google / Facebook OAuth",
          "POST /auth/send-otp                    # Send OTP via SMS (SSL Wireless)",
          "POST /auth/verify-otp                  # Verify OTP — required before payment",
          "POST /auth/refresh-token               # Refresh JWT access token",
          "POST /auth/logout                      # Invalidate refresh token",
          "POST /auth/forgot-password             # Send reset link via email/SMS",
          "POST /auth/reset-password              # Reset with token",
          "GET  /auth/me                          # Get current user profile",
          "PUT  /auth/profile                     # Update profile",
          "POST /auth/change-password",
        ],
        [
          "users table:",
          "  id UUID PK, email VARCHAR UNIQUE, phone VARCHAR UNIQUE,",
          "  password_hash VARCHAR, role ENUM(CUSTOMER|AGENT|SUB_AGENT|STAFF|ACCOUNTANT|MANAGER|ADMIN),",
          "  is_verified BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true,",
          "  otp_code VARCHAR, otp_expires_at TIMESTAMP,",
          "  google_id VARCHAR, facebook_id VARCHAR,",
          "  preferred_language ENUM(en|bn) DEFAULT bn,",
          "  created_at TIMESTAMP, updated_at TIMESTAMP",
          "",
          "traveller_profiles table:",
          "  id UUID PK, user_id UUID FK, first_name VARCHAR, last_name VARCHAR,",
          "  date_of_birth DATE, gender ENUM(M|F), nationality VARCHAR,",
          "  passport_number VARCHAR, passport_expiry DATE,",
          "  passport_issue_country VARCHAR, is_primary BOOLEAN,",
          "  created_at TIMESTAMP",
        ],
        [
          "OTP via SSL Wireless SMS gateway — not Twilio (too expensive for BD)",
          "OTP must be verified before any payment action — enforce at middleware level",
          "JWT access token: 15 min expiry. Refresh token: 7 days, stored in HttpOnly cookie",
          "Passport expiry alert: if passport expires within 6 months, warn at login and booking",
          "Password must be hashed with bcrypt (rounds: 12)",
          "Rate limit login attempts: 5 per 15 minutes per IP",
          "Social login via NextAuth.js on frontend, token exchanged with backend",
        ],
        [
          "SSL Wireless SMS API — for OTP delivery",
          "Google OAuth2 API",
          "Facebook Login API",
          "Redis — store OTP codes and refresh token blacklist",
        ]
      ),

      // ── MODULE 02: FLIGHT ──────────────────────────────────────────────
      ...featureBlock(
        "MODULE-02", "Flight Booking",
        "Core revenue module. Integrates with Amadeus Self-Service API for flight search, booking, PNR management, ticketing, cancellation, reissue, and refund. Includes fare caching, GDS session pooling, and void window automation.",
        [
          "GET  /flights/search                   # [PUBLIC] Search flights — cache 15 min Redis",
          "GET  /flights/search/calendar           # [PUBLIC] Fare calendar — cheapest day grid",
          "GET  /flights/search/flexible           # [PUBLIC] +/-3 days flexible date search",
          "GET  /flights/fare-rules/:offerId       # Fare rules for selected offer",
          "GET  /flights/baggage/:offerId          # Baggage information",
          "GET  /flights/seats/:flightId           # Seat map",
          "POST /flights/price                     # Re-price offer before booking (Amadeus offer price)",
          "POST /flights/book                      # Create booking (PNR)",
          "POST /flights/ticket/:bookingId         # Issue ticket (charge BSP)",
          "GET  /flights/bookings                  # List user bookings",
          "GET  /flights/bookings/:id              # Get booking details + PNR status",
          "POST /flights/cancel/:bookingId         # Cancel booking",
          "POST /flights/void/:bookingId           # Void ticket (within 24hr window)",
          "POST /flights/reissue/:bookingId        # Date change / reissue",
          "POST /flights/refund/:bookingId         # Initiate refund",
          "GET  /flights/refund/:refundId          # Refund status",
          "GET  /flights/pnr/:pnr                  # PNR lookup",
          "POST /flights/price-alert               # Subscribe to price alert for a route",
          "GET  /flights/status/:flightNumber      # Real-time flight status (OAG/FlightStats)",
          "POST /flights/name-correction/:bookingId # Name correction request",
        ],
        [
          "flight_bookings table:",
          "  id UUID PK, pnr VARCHAR UNIQUE, user_id UUID FK, agent_id UUID FK NULLABLE,",
          "  trip_type ENUM(ONE_WAY|ROUND_TRIP|MULTI_CITY),",
          "  status ENUM(PENDING|BOOKED|TICKETED|CANCELLED|VOIDED|REFUNDED|EXPIRED),",
          "  total_amount DECIMAL(12,2), currency VARCHAR(3) DEFAULT 'BDT',",
          "  base_fare DECIMAL(12,2), tax DECIMAL(12,2), yq DECIMAL(12,2),",
          "  ait_amount DECIMAL(12,2),           -- AIT 0.3% auto-deducted",
          "  vat_amount DECIMAL(12,2),            -- VAT on service fee",
          "  service_fee DECIMAL(12,2),",
          "  agent_markup DECIMAL(12,2) DEFAULT 0,",
          "  amadeus_offer_id VARCHAR,",
          "  void_deadline TIMESTAMP,             -- booking_time + 24hr",
          "  ticketing_deadline TIMESTAMP,",
          "  payment_id UUID FK,",
          "  created_at TIMESTAMP, updated_at TIMESTAMP",
          "",
          "flight_passengers table:",
          "  id UUID PK, booking_id UUID FK,",
          "  type ENUM(ADT|CHD|INF), first_name VARCHAR, last_name VARCHAR,",
          "  date_of_birth DATE, gender ENUM(M|F), nationality VARCHAR,",
          "  passport_number VARCHAR, passport_expiry DATE,",
          "  ticket_number VARCHAR, seat_number VARCHAR,",
          "  meal_preference VARCHAR, special_request TEXT",
          "",
          "flight_segments table:",
          "  id UUID PK, booking_id UUID FK,",
          "  origin VARCHAR(3), destination VARCHAR(3),",
          "  departure_at TIMESTAMP, arrival_at TIMESTAMP,",
          "  flight_number VARCHAR, carrier_code VARCHAR(2),",
          "  cabin_class ENUM(Y|W|C|F), booking_class VARCHAR(1),",
          "  duration_minutes INT, stops INT DEFAULT 0",
          "",
          "price_alerts table:",
          "  id UUID PK, user_id UUID FK, origin VARCHAR(3), destination VARCHAR(3),",
          "  travel_date DATE, cabin_class VARCHAR, max_price DECIMAL(12,2),",
          "  is_active BOOLEAN DEFAULT true, last_checked_at TIMESTAMP",
        ],
        [
          "Amadeus Self-Service API — use REST SDK @amadeus-enterprise/amadeus",
          "GDS session pooling: maintain a pool of Amadeus sessions in Redis — reuse aggressively, Amadeus charges per new session",
          "Search result caching: cache flight search results in Redis with TTL 900 seconds (15 min). Key: MD5(origin+dest+date+cabin+pax)",
          "Rate limiting: max 10 Amadeus search requests per user per minute (Redis counter)",
          "AIT calculation: 0.3% of total ticket price — auto-calculated and stored separately, required for NBR filing",
          "VAT: 15% on service fee only (not ticket price) — store separately for Mushak challan",
          "Void window: BullMQ job scheduled at booking time + 23hr 50min — sends alert to ticket team. Auto-void if no action by deadline",
          "Auto-ticketing: BullMQ queue — tickets issued within 30 minutes of booking confirmation + payment success",
          "Schedule change detection: cron job every 2 hours polls Amadeus queues for schedule change notices on active PNRs",
          "PDF ticket: Puppeteer renders HTML template to PDF — include Bengali text support (Google Noto Sans Bengali font)",
          "Multi-PNR itinerary: complex routings across multiple airlines create multiple PNR records linked by itinerary_id",
        ],
        [
          "Amadeus Self-Service API (developer.amadeus.com)",
          "OAG / FlightStats API for real-time flight status",
          "BullMQ — ticketing queue, void window alerts, schedule change polling",
          "Redis — search cache, session pool",
          "Puppeteer — PDF ticket generation",
          "AWS S3 / DO Spaces — store generated PDF tickets",
          "WATI WhatsApp API — WhatsApp ticket delivery",
          "SSL Wireless — Bengali SMS confirmation",
          "MODULE-07 (Payment) — payment confirmation triggers ticketing",
          "MODULE-10 (Accounting) — every booking creates GL entries automatically",
        ]
      ),

      // ── MODULE 03: HOTEL ───────────────────────────────────────────────
      ...featureBlock(
        "MODULE-03", "Hotel Booking",
        "Hotel search and booking via Hotelbeds API (primary) and Expedia Partner Solutions (secondary). Includes content normalization, map view, reviews, and instant confirmation.",
        [
          "GET  /hotels/search                    # [PUBLIC] Search hotels by city/dates/pax",
          "GET  /hotels/search/map                # [PUBLIC] Hotel search with geo coordinates",
          "GET  /hotels/:hotelId                  # [PUBLIC] Hotel details + photos + amenities",
          "GET  /hotels/:hotelId/rooms            # Available rooms with rates",
          "GET  /hotels/:hotelId/reviews          # Guest reviews",
          "POST /hotels/book                      # Book a room",
          "GET  /hotels/bookings                  # User hotel bookings",
          "GET  /hotels/bookings/:id              # Booking details",
          "POST /hotels/cancel/:bookingId         # Cancel hotel booking",
        ],
        [
          "hotel_bookings table:",
          "  id UUID PK, user_id UUID FK, agent_id UUID FK NULLABLE,",
          "  hotelbeds_reference VARCHAR, hotel_code VARCHAR,",
          "  hotel_name VARCHAR, room_type VARCHAR, board_type VARCHAR,",
          "  check_in DATE, check_out DATE, nights INT,",
          "  adults INT, children INT,",
          "  total_amount DECIMAL(12,2), currency VARCHAR(3),",
          "  status ENUM(PENDING|CONFIRMED|CANCELLED|NO_SHOW),",
          "  cancellation_policy TEXT, cancellation_deadline TIMESTAMP,",
          "  payment_id UUID FK, created_at TIMESTAMP",
          "",
          "hotels collection (MongoDB):",
          "  hotelId, name, nameAr, nameBn (Bengali),",
          "  address, city, country, latitude, longitude,",
          "  starRating, photos[], amenities[], description,",
          "  checkInTime, checkOutTime, policies{},",
          "  source ENUM(hotelbeds|expedia), lastSyncedAt",
        ],
        [
          "Hotelbeds API: use Hotelbeds Hotel API for search and booking. Requires HMAC-SHA256 signature on each request",
          "Content normalization: map Hotelbeds and Expedia content to unified hotel schema stored in MongoDB",
          "Hotel content sync: cron job nightly to sync hotel content (photos, amenities, descriptions) to MongoDB",
          "Map view: Leaflet.js on frontend with hotel pins — coordinates from MongoDB",
          "Reviews: Hotelbeds provides guest reviews via their content API",
          "Currency: display in BDT using live exchange rate for USD/EUR hotel rates",
        ],
        [
          "Hotelbeds Hotel API (developer.hotelbeds.com)",
          "Expedia Partner Solutions (EPS) API (secondary fallback)",
          "Google Maps / Leaflet for map view",
          "MongoDB — hotel content storage",
          "MODULE-07 (Payment)",
          "MODULE-10 (Accounting)",
        ]
      ),

      // ── MODULE 04: VISA ────────────────────────────────────────────────
      ...featureBlock(
        "MODULE-04", "Visa Services",
        "Country-wise visa information, application management, document upload, status tracking, and VFS appointment booking. Sarah Travels BD specialty — fast-track processing.",
        [
          "GET  /visa/countries               # [PUBLIC] List all countries with visa info",
          "GET  /visa/countries/:code         # [PUBLIC] Country visa details + required docs",
          "GET  /visa/types/:countryCode      # [PUBLIC] Visa types for a country",
          "POST /visa/apply                   # Submit visa application",
          "GET  /visa/applications            # User's visa applications",
          "GET  /visa/applications/:id        # Application details + status",
          "PUT  /visa/applications/:id        # Update application",
          "POST /visa/documents/:appId        # Upload document (S3)",
          "DELETE /visa/documents/:docId      # Remove document",
          "PUT  /visa/status/:appId           # [STAFF] Update application status",
          "POST /visa/appointment/:appId      # Book VFS appointment",
          "GET  /visa/checklist/:countryCode  # Document checklist for country",
          "POST /visa/photo                   # [PUBLIC] Auto-crop passport photo tool",
        ],
        [
          "visa_applications table:",
          "  id UUID PK, user_id UUID FK, reference_number VARCHAR UNIQUE,",
          "  country_code VARCHAR(2), visa_type VARCHAR,",
          "  travel_date DATE, duration_days INT,",
          "  status ENUM(DRAFT|SUBMITTED|PROCESSING|APPROVED|REJECTED|CANCELLED),",
          "  assigned_staff_id UUID FK NULLABLE,",
          "  vfs_appointment_date TIMESTAMP NULLABLE,",
          "  vfs_appointment_ref VARCHAR NULLABLE,",
          "  service_fee DECIMAL(10,2),",
          "  notes TEXT, rejection_reason TEXT,",
          "  created_at TIMESTAMP, updated_at TIMESTAMP",
          "",
          "visa_documents table:",
          "  id UUID PK, application_id UUID FK,",
          "  document_type VARCHAR, file_name VARCHAR, file_url VARCHAR,",
          "  file_size INT, mime_type VARCHAR,",
          "  is_verified BOOLEAN DEFAULT false, uploaded_at TIMESTAMP",
          "",
          "visa_countries collection (MongoDB):",
          "  countryCode, countryName, countryNameBn (Bengali),",
          "  visaTypes[{ type, fee, processingDays, validity, entries }],",
          "  requiredDocuments[], embassyAddress, vfsAvailable BOOLEAN,",
          "  processingNotes, lastUpdated",
        ],
        [
          "Documents uploaded to S3/DO Spaces with pre-signed URLs — never serve directly",
          "Passport photo tool: sharp.js — auto-crop to 35x45mm, white background, JPEG",
          "Status notifications: WhatsApp + SMS on every status change",
          "VFS integration: manual appointment logging initially, VFS API if available",
          "Fast-track flag: staff can mark applications as fast-track — priority queue",
          "Bangladesh-specific: Indian eVisa, Saudi, UAE, UK, Schengen are highest volume — pre-build these templates",
        ],
        [
          "AWS S3 / DO Spaces — document storage",
          "sharp.js — passport photo processing",
          "VFS Global API (if available) — appointment booking",
          "MODULE-13 (Notification) — status change alerts",
        ]
      ),

      // ── MODULE 05: UMRAH ───────────────────────────────────────────────
      ...featureBlock(
        "MODULE-05", "Umrah & Hajj",
        "Complete Umrah package management with Nusuk platform integration (mandatory for Saudi visas), pilgrim document management, group coordination, SAR/BDT pricing, and installment plans.",
        [
          "GET  /umrah/packages               # [PUBLIC] List Umrah packages",
          "GET  /umrah/packages/:id           # [PUBLIC] Package details",
          "POST /umrah/packages               # [MANAGER] Create package",
          "PUT  /umrah/packages/:id           # [MANAGER] Update package",
          "POST /umrah/book                   # Book Umrah package",
          "GET  /umrah/bookings               # User Umrah bookings",
          "GET  /umrah/bookings/:id           # Booking details",
          "POST /umrah/pilgrims/:bookingId    # Add pilgrim to group",
          "PUT  /umrah/pilgrims/:pilgrimId    # Update pilgrim details",
          "POST /umrah/documents/:pilgrimId   # Upload pilgrim document",
          "POST /umrah/nusuk/submit/:bookingId # Submit to Nusuk platform",
          "GET  /umrah/nusuk/status/:bookingId # Nusuk visa status",
          "POST /umrah/installment/:bookingId  # Create installment plan",
          "GET  /umrah/installment/:bookingId  # Installment schedule",
          "POST /umrah/installment/pay/:installmentId # Record installment payment",
          "GET  /umrah/exchange-rate          # [PUBLIC] Live SAR/BDT rate",
        ],
        [
          "umrah_packages table:",
          "  id UUID PK, title VARCHAR, title_bn VARCHAR (Bengali),",
          "  duration_nights INT, hotel_makkah VARCHAR, hotel_makkah_stars INT,",
          "  hotel_madinah VARCHAR, hotel_madinah_stars INT,",
          "  price_sar DECIMAL(10,2), price_bdt DECIMAL(12,2),",
          "  includes TEXT[], excludes TEXT[],",
          "  flight_included BOOLEAN, visa_included BOOLEAN, transport_included BOOLEAN,",
          "  max_pilgrims INT, available_slots INT,",
          "  departure_date DATE, return_date DATE,",
          "  is_active BOOLEAN, is_group BOOLEAN, min_group_size INT,",
          "  created_at TIMESTAMP",
          "",
          "umrah_bookings table:",
          "  id UUID PK, package_id UUID FK, user_id UUID FK,",
          "  group_leader_id UUID FK NULLABLE,",
          "  total_pilgrims INT, total_amount_bdt DECIMAL(12,2),",
          "  paid_amount DECIMAL(12,2) DEFAULT 0,",
          "  installment_plan ENUM(FULL|3M|6M|12M),",
          "  status ENUM(PENDING|PARTIAL|PAID|SUBMITTED|VISA_APPROVED|COMPLETED|CANCELLED),",
          "  nusuk_reference VARCHAR NULLABLE,",
          "  nusuk_submitted_at TIMESTAMP, nusuk_status VARCHAR,",
          "  created_at TIMESTAMP",
          "",
          "umrah_pilgrims table:",
          "  id UUID PK, booking_id UUID FK,",
          "  first_name VARCHAR, last_name VARCHAR,",
          "  date_of_birth DATE, gender ENUM(M|F),",
          "  passport_number VARCHAR, passport_expiry DATE,",
          "  nid_number VARCHAR, mahram_id UUID FK NULLABLE,",
          "  is_mahram BOOLEAN DEFAULT false,",
          "  maktab_number VARCHAR NULLABLE,",
          "  nusuk_pilgrim_id VARCHAR NULLABLE,",
          "  status ENUM(PENDING|SUBMITTED|VISA_APPROVED|REJECTED)",
          "",
          "umrah_installments table:",
          "  id UUID PK, booking_id UUID FK, installment_number INT,",
          "  amount DECIMAL(12,2), due_date DATE,",
          "  paid_at TIMESTAMP NULLABLE, payment_id UUID FK NULLABLE,",
          "  status ENUM(PENDING|PAID|OVERDUE)",
        ],
        [
          "Nusuk API: Saudi Ministry of Hajj mandatory platform for all Umrah visa applications from 2024. Requires certified integration — contact Saudi embassy for API access",
          "SAR/BDT exchange rate: fetch live from a reliable forex API (e.g., ExchangeRate-API). Cache in Redis for 1 hour. Show rate at time of booking locked in booking record",
          "Hijri calendar: use hijri-js or similar npm package for Hijri date display",
          "Mahram verification: female pilgrims (under 45) must have a mahram — enforce in pilgrim form with mahram linking",
          "Installment logic: divide total amount by 3/6/12. Create installment records. BullMQ job checks overdue installments daily",
          "Female pilgrim age threshold: check age at time of Umrah departure — under 45 requires mahram",
          "Group leader: one pilgrim in group designated as leader — receives all communications",
          "Maktab assignment: manual entry by staff — Saudi tent allocation in Mina for Hajj",
        ],
        [
          "Nusuk Platform API (Saudi Ministry of Hajj)",
          "ExchangeRate-API or Open Exchange Rates — live SAR/BDT",
          "hijri-js — Hijri calendar support",
          "MODULE-07 (Payment) — installment payments",
          "MODULE-13 (Notification) — installment due alerts via WhatsApp/SMS",
          "MODULE-10 (Accounting) — installment revenue recognition",
        ]
      ),

      // ── MODULE 06: TOUR ────────────────────────────────────────────────
      ...featureBlock(
        "MODULE-06", "Tour Packages",
        "Domestic and international tour package management, group tours, custom tour builder, and package inquiry flow with CRM integration.",
        [
          "GET  /tours                         # [PUBLIC] List packages with filters",
          "GET  /tours/:id                     # [PUBLIC] Package details + itinerary",
          "GET  /tours/domestic                # [PUBLIC] Domestic tours (Cox's Bazar, Sylhet etc.)",
          "GET  /tours/international           # [PUBLIC] International tours",
          "POST /tours                         # [MANAGER] Create package",
          "PUT  /tours/:id                     # [MANAGER] Update package",
          "POST /tours/inquire/:id             # [PUBLIC] Package inquiry → CRM lead",
          "POST /tours/book/:id                # Book tour package",
          "GET  /tours/bookings                # User tour bookings",
          "GET  /tours/bookings/:id",
          "POST /tours/cancel/:bookingId",
        ],
        [
          "tour_packages collection (MongoDB):",
          "  id, title, titleBn, type ENUM(domestic|international|group|custom),",
          "  destination, duration{ days, nights },",
          "  price{ adult, child, currency },",
          "  itinerary[{ day, title, activities[], meals[] }],",
          "  includes[], excludes[],",
          "  photos[], highlights[],",
          "  minGroupSize, maxGroupSize,",
          "  departureDate, returnDate,",
          "  isSeasonalPackage BOOLEAN, season VARCHAR,",
          "  isActive BOOLEAN, isFeatured BOOLEAN,",
          "  createdAt, updatedAt",
          "",
          "tour_bookings table (PostgreSQL):",
          "  id UUID PK, tour_id VARCHAR, user_id UUID FK,",
          "  adults INT, children INT,",
          "  total_amount DECIMAL(12,2),",
          "  status ENUM(INQUIRY|CONFIRMED|PARTIAL|PAID|CANCELLED|COMPLETED),",
          "  special_requests TEXT, created_at TIMESTAMP",
        ],
        [
          "Domestic priority destinations: Cox's Bazar, Bandarban, Rangamati, Sylhet, Sundarbans, Saint Martin — build these first",
          "Seasonal packages: Eid packages, winter season, school holiday — add departure_date ranges",
          "Package inquiry: submit form → create CRM lead → WhatsApp notification to sales team",
          "Spot booking: same-day packages — mark isSpotBooking: true, simplified checkout",
          "BIWTC launch/ferry booking: for Sundarbans packages, add external link to BIWTC booking or manual coordination note",
        ],
        [
          "MongoDB — tour content storage",
          "MODULE-12 (CRM) — inquiry leads",
          "MODULE-07 (Payment)",
          "MODULE-13 (Notification)",
        ]
      ),

      // ── MODULE 07: PAYMENT ─────────────────────────────────────────────
      ...featureBlock(
        "MODULE-07", "Payment Gateway",
        "Unified payment service abstracting all Bangladesh payment gateways. Single interface for all modules to process payments. Handles webhooks, reconciliation, and refunds.",
        [
          "POST /payments/initiate             # Initiate payment — returns gateway URL or instructions",
          "POST /payments/verify               # Verify payment after callback",
          "GET  /payments/:id                  # Payment details",
          "GET  /payments/history              # User payment history",
          "POST /payments/refund/:paymentId    # Initiate refund",
          "GET  /payments/refund/:refundId     # Refund status",
          "POST /payments/webhook/sslcommerz   # [PUBLIC] SSLCommerz IPN webhook",
          "POST /payments/webhook/bkash        # [PUBLIC] bKash callback",
          "POST /payments/webhook/nagad        # [PUBLIC] Nagad callback",
          "POST /payments/webhook/rocket       # [PUBLIC] Rocket callback",
          "GET  /payments/methods              # [PUBLIC] Available payment methods",
          "POST /wallet/topup                  # Customer wallet top-up",
          "POST /wallet/pay                    # Pay from wallet balance",
          "GET  /wallet/balance                # Wallet balance",
          "GET  /wallet/transactions           # Wallet transaction history",
        ],
        [
          "payments table:",
          "  id UUID PK, user_id UUID FK, booking_type ENUM(FLIGHT|HOTEL|TOUR|VISA|UMRAH|EDUCATION|WALLET),",
          "  booking_id UUID, amount DECIMAL(12,2), currency VARCHAR(3) DEFAULT 'BDT',",
          "  gateway ENUM(SSLCOMMERZ|BKASH|NAGAD|ROCKET|DBBL_NEXUS|WALLET|CASH),",
          "  gateway_transaction_id VARCHAR, gateway_reference VARCHAR,",
          "  status ENUM(PENDING|SUCCESS|FAILED|REFUNDED|PARTIAL_REFUND),",
          "  otp_verified BOOLEAN DEFAULT false,",
          "  initiated_at TIMESTAMP, completed_at TIMESTAMP,",
          "  metadata JSONB  -- store gateway-specific response",
          "",
          "wallets table:",
          "  id UUID PK, user_id UUID FK UNIQUE,",
          "  balance DECIMAL(12,2) DEFAULT 0,",
          "  refund_balance DECIMAL(12,2) DEFAULT 0,",
          "  currency VARCHAR(3) DEFAULT 'BDT',",
          "  updated_at TIMESTAMP",
          "",
          "wallet_transactions table:",
          "  id UUID PK, wallet_id UUID FK,",
          "  type ENUM(TOPUP|PAYMENT|REFUND|WITHDRAWAL|ADJUSTMENT),",
          "  amount DECIMAL(12,2), balance_after DECIMAL(12,2),",
          "  reference_id UUID, description VARCHAR,",
          "  created_at TIMESTAMP",
        ],
        [
          "SSLCommerz: use their Node.js SDK (sslcommerz-lts). Sandbox available for testing",
          "bKash: use bKash Payment Gateway API v1.2.0-beta. Requires merchant account and sandbox credentials from bKash",
          "Nagad: Nagad Merchant API — requires merchant account. Uses RSA encryption for requests",
          "Rocket: DBBL Rocket API — mobile banking",
          "Payment flow: initiate → redirect to gateway → callback → verify → trigger booking completion via EventEmitter",
          "Webhook security: verify each webhook signature/hash before processing",
          "Idempotency: use gateway_transaction_id to prevent duplicate payment processing",
          "OTP must be verified BEFORE payment initiation — check otp_verified flag in session",
          "BullMQ: on payment success event, trigger: ticket issuance (flight), booking confirmation (hotel), status update (visa/umrah)",
          "Cash payments: for counter mode — manually record by staff with CASH gateway, no gateway redirect",
        ],
        [
          "SSLCommerz SDK (sslcommerz-lts npm)",
          "bKash Payment Gateway API",
          "Nagad Merchant API",
          "Rocket (DBBL) API",
          "BullMQ — payment success event triggers downstream actions",
          "MODULE-10 (Accounting) — every payment creates accounting journal entries",
          "MODULE-13 (Notification) — payment confirmation via SMS + WhatsApp",
        ]
      ),

      // ── MODULE 08: AGENT ───────────────────────────────────────────────
      ...featureBlock(
        "MODULE-08", "B2B Agent Portal",
        "Full B2B agent management: registration, KYC, credit wallet, commission engine, sub-agent hierarchy, markup control, and agent-specific booking tools.",
        [
          "POST /agents/register               # Agent registration + document upload",
          "GET  /agents/me                     # Agent profile",
          "PUT  /agents/me                     # Update agent profile",
          "GET  /agents/dashboard              # Dashboard stats: balance, bookings, commissions",
          "GET  /agents/wallet                 # Wallet balance + transactions",
          "POST /agents/deposit/request        # Request deposit (bank transfer)",
          "PUT  /agents/deposit/:id/confirm    # [ADMIN] Confirm deposit",
          "GET  /agents/commission             # Commission earned + pending + paid",
          "GET  /agents/commission/statement   # Monthly commission statement PDF",
          "POST /agents/sub-agents             # Add sub-agent",
          "GET  /agents/sub-agents             # List sub-agents",
          "PUT  /agents/sub-agents/:id/credit  # Set sub-agent credit limit",
          "PUT  /agents/sub-agents/:id/suspend # Suspend sub-agent",
          "POST /agents/book/flight            # Agent books flight for customer",
          "POST /agents/book/hotel             # Agent books hotel for customer",
          "POST /agents/book/visa              # Agent submits visa for customer",
          "GET  /agents/bookings               # All bookings made by agent",
          "GET  /agents/performance            # Monthly performance report",
          "GET  /agents                        # [ADMIN] List all agents",
          "PUT  /agents/:id/tier               # [ADMIN] Change agent tier",
          "PUT  /agents/:id/credit-limit       # [ADMIN] Set credit limit",
          "PUT  /agents/:id/suspend            # [ADMIN] Suspend agent",
        ],
        [
          "agents table:",
          "  id UUID PK, user_id UUID FK UNIQUE,",
          "  agency_name VARCHAR, trade_license VARCHAR, tin_number VARCHAR,",
          "  nid_number VARCHAR, contact_person VARCHAR,",
          "  tier ENUM(STANDARD|SILVER|GOLD|PLATINUM) DEFAULT STANDARD,",
          "  credit_limit DECIMAL(12,2) DEFAULT 50000,",
          "  current_credit_used DECIMAL(12,2) DEFAULT 0,",
          "  wallet_balance DECIMAL(12,2) DEFAULT 0,",
          "  commission_rate DECIMAL(5,2) DEFAULT 0,",
          "  parent_agent_id UUID FK NULLABLE,  -- for sub-agents",
          "  override_commission_rate DECIMAL(5,2) DEFAULT 0,  -- parent earns this on sub-agent bookings",
          "  kyc_status ENUM(PENDING|APPROVED|REJECTED) DEFAULT PENDING,",
          "  is_active BOOLEAN DEFAULT true,",
          "  atab_number VARCHAR NULLABLE,",
          "  created_at TIMESTAMP",
          "",
          "agent_deposits table:",
          "  id UUID PK, agent_id UUID FK,",
          "  amount DECIMAL(12,2), bank_name VARCHAR,",
          "  transaction_ref VARCHAR, deposit_slip_url VARCHAR,",
          "  status ENUM(PENDING|CONFIRMED|REJECTED),",
          "  confirmed_by UUID FK NULLABLE, confirmed_at TIMESTAMP NULLABLE,",
          "  notes TEXT, created_at TIMESTAMP",
          "",
          "agent_commissions table:",
          "  id UUID PK, agent_id UUID FK, booking_type VARCHAR, booking_id UUID,",
          "  gross_amount DECIMAL(12,2), commission_rate DECIMAL(5,2),",
          "  commission_amount DECIMAL(12,2),",
          "  override_agent_id UUID FK NULLABLE,",
          "  override_amount DECIMAL(12,2) DEFAULT 0,",
          "  status ENUM(PENDING|EARNED|PAID), earned_at TIMESTAMP, paid_at TIMESTAMP",
        ],
        [
          "Credit limit enforcement: before any agent booking, check: wallet_balance + available_credit >= booking_amount. Reject if insufficient",
          "Credit used tracking: on booking creation, increment current_credit_used. On payment, decrement and increment wallet_balance accordingly",
          "Sub-agent commission: when sub-agent makes a booking, parent agent earns override_commission_rate on top of sub-agent's commission",
          "Markup control: agents set markup per booking — store in booking record. Markup must be within min/max range set by admin per tier",
          "Duplicate booking detection: before creating PNR, check if same passenger + same flight + same date exists across all agents — flag for review",
          "Credit auto-suspension: if agent has overdue deposits > 7 days, auto-suspend credit limit (not account)",
          "KYC documents: trade license, TIN certificate, NID — upload to S3, reviewed by admin",
          "White-label: Gold and Platinum agents get subdomain. Store custom branding in agents table: logo_url, primary_color, secondary_color",
          "Impersonation: agent can book on behalf of customer — booking records include both agent_id and customer_id",
        ],
        [
          "MODULE-02 (Flight) — agent flight booking",
          "MODULE-03 (Hotel) — agent hotel booking",
          "MODULE-04 (Visa) — agent visa submission",
          "MODULE-07 (Payment) — agent wallet payments",
          "MODULE-10 (Accounting) — agent commission GL entries",
          "MODULE-13 (Notification) — deposit confirmation, credit alerts",
        ]
      ),

      // ── MODULE 09: MANPOWER ────────────────────────────────────────────
      ...featureBlock(
        "MODULE-09", "Manpower Worker Travel",
        "Group departure management for migrant workers. Employer/agency as booking party, bulk passenger management, BMET clearance tracking, OTB status, and bulk invoice generation.",
        [
          "POST /manpower/groups               # Create worker group departure",
          "GET  /manpower/groups               # List groups (agency-scoped)",
          "GET  /manpower/groups/:id           # Group details + worker list",
          "POST /manpower/groups/:id/workers   # Add worker to group",
          "POST /manpower/groups/:id/workers/bulk # Bulk upload workers (Excel/CSV)",
          "PUT  /manpower/workers/:id          # Update worker details",
          "POST /manpower/workers/:id/documents # Upload worker document",
          "PUT  /manpower/workers/:id/bmet     # Update BMET clearance status",
          "PUT  /manpower/workers/:id/otb      # Update OK to Board status",
          "POST /manpower/groups/:id/book      # Book flights for entire group",
          "GET  /manpower/groups/:id/invoice   # Download bulk invoice (PDF)",
          "GET  /manpower/groups/:id/manifest  # Download passenger manifest",
          "GET  /manpower/template/excel       # Download Excel upload template",
        ],
        [
          "manpower_groups table:",
          "  id UUID PK, agency_id UUID FK,  -- agent who represents the employer",
          "  employer_name VARCHAR, employer_country VARCHAR,",
          "  departure_date DATE, origin VARCHAR(3), destination VARCHAR(3),",
          "  total_workers INT, status ENUM(DRAFT|BOOKED|DEPARTED|COMPLETED),",
          "  flight_booking_id UUID FK NULLABLE,",
          "  invoice_url VARCHAR NULLABLE,",
          "  notes TEXT, created_at TIMESTAMP",
          "",
          "manpower_workers table:",
          "  id UUID PK, group_id UUID FK,",
          "  first_name VARCHAR, last_name VARCHAR,",
          "  date_of_birth DATE, gender ENUM(M|F),",
          "  passport_number VARCHAR, passport_expiry DATE,",
          "  nid_number VARCHAR, mobile_number VARCHAR,",
          "  bmet_clearance_status ENUM(PENDING|CLEARED|REJECTED),",
          "  bmet_clearance_date DATE NULLABLE,",
          "  ok_to_board_status ENUM(PENDING|APPROVED|REJECTED),",
          "  medical_fitness ENUM(PENDING|FIT|UNFIT),",
          "  medical_expiry DATE NULLABLE,",
          "  smart_card_number VARCHAR NULLABLE,",
          "  visa_number VARCHAR NULLABLE,",
          "  visa_expiry DATE NULLABLE,",
          "  ticket_number VARCHAR NULLABLE,",
          "  created_at TIMESTAMP",
        ],
        [
          "Excel/CSV bulk upload: use exceljs npm package. Provide downloadable template with exact column headers",
          "Validation on upload: check passport expiry > 6 months, required fields present, no duplicate passport numbers",
          "Bulk invoice: Puppeteer PDF — employer/agency name as billing party, list all workers with ticket numbers",
          "Passenger manifest: Puppeteer PDF — airline-format passenger list for check-in",
          "BMET status: manual entry by staff — no API available, staff enters after physical verification",
          "High-volume routes: DAC-DXB, DAC-DOH, DAC-RUH, DAC-KWI — pre-set as quick-select destinations",
        ],
        [
          "exceljs — Excel file parsing and generation",
          "Puppeteer — bulk invoice and manifest PDF",
          "MODULE-02 (Flight) — group flight booking",
          "MODULE-08 (Agent) — agency-scoped access",
          "MODULE-13 (Notification) — BMET/OTB status updates",
        ]
      ),

      // ── MODULE 10: ACCOUNTING ──────────────────────────────────────────
      ...featureBlock(
        "MODULE-10", "Double-Entry Accounting",
        "Full double-entry bookkeeping engine. Every booking, payment, commission, and refund automatically creates journal entries. Produces cash book, bank book, P&L, and balance sheet. NBR VAT/AIT compliant.",
        [
          "GET  /accounting/dashboard          # [ACCOUNTANT+] Financial summary",
          "GET  /accounting/cashbook           # Cash book entries (date range)",
          "GET  /accounting/bankbook           # Bank transactions",
          "GET  /accounting/ledger             # General ledger by account",
          "GET  /accounting/pl                 # Profit & Loss statement",
          "GET  /accounting/balance-sheet      # Balance sheet",
          "GET  /accounting/commissions        # Commission earned vs paid report",
          "GET  /accounting/refunds            # Refund report by airline/route",
          "GET  /accounting/ait-report         # AIT deduction report for NBR",
          "GET  /accounting/vat-report         # VAT (Mushak) report for NBR",
          "POST /accounting/mushak/generate    # Generate Mushak challan PDF",
          "GET  /accounting/bsp/reconciliation # BSP reconciliation report",
          "POST /accounting/journal            # [ACCOUNTANT] Manual journal entry",
          "GET  /accounting/trial-balance      # Trial balance",
        ],
        [
          "chart_of_accounts table:",
          "  id UUID PK, code VARCHAR UNIQUE, name VARCHAR, name_bn VARCHAR,",
          "  type ENUM(ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE),",
          "  parent_id UUID FK NULLABLE, is_active BOOLEAN",
          "",
          "-- Key accounts:",
          "-- 1001: Cash, 1002: Bank - DBBL, 1003: bKash Receivable",
          "-- 1100: Accounts Receivable (Customers), 1101: Agent Receivable",
          "-- 2001: Accounts Payable (Airlines - BSP), 2002: Agent Wallet Payable",
          "-- 4001: Flight Revenue, 4002: Hotel Revenue, 4003: Visa Revenue",
          "-- 4004: Umrah Revenue, 4005: Tour Revenue, 4006: Agent Commission Income",
          "-- 5001: GDS Cost, 5002: Hotel Cost, 5003: Staff Salaries",
          "-- 2100: AIT Payable, 2101: VAT Payable",
          "",
          "journal_entries table:",
          "  id UUID PK, reference_type VARCHAR, reference_id UUID,",
          "  description VARCHAR, entry_date DATE,",
          "  created_by UUID FK, created_at TIMESTAMP",
          "",
          "journal_lines table:",
          "  id UUID PK, journal_id UUID FK,",
          "  account_id UUID FK, type ENUM(DEBIT|CREDIT),",
          "  amount DECIMAL(12,2), currency VARCHAR(3) DEFAULT 'BDT',",
          "  narration VARCHAR",
        ],
        [
          "Auto-journal on flight booking paid: DR Accounts Receivable (customer) / CR Flight Revenue + CR AIT Payable + CR VAT Payable",
          "Auto-journal on payment received: DR Cash/Bank/bKash / CR Accounts Receivable",
          "Auto-journal on refund: reverse original entries",
          "Auto-journal on commission earned: DR Commission Expense / CR Agent Wallet Payable",
          "Every module triggers accounting via @OnEvent('payment.success') EventEmitter — accounting module listens and creates journals",
          "AIT report: monthly aggregate of ait_amount from flight_bookings — for NBR Advance Income Tax filing",
          "VAT/Mushak: 15% on service_fee only. Generate Mushak 6.3 format challan as PDF using Puppeteer",
          "BSP reconciliation: compare ticketed bookings with BSP billing file (manual CSV upload initially)",
          "All amounts stored in BDT as functional currency. Foreign currency bookings converted at booking-time rate stored in record",
        ],
        [
          "NestJS EventEmitter — listens to payment.success, refund.completed, commission.earned events from other modules",
          "Puppeteer — Mushak challan PDF generation",
          "exceljs — export reports to Excel for accountant",
        ]
      ),

      // ── MODULE 11: CRM ─────────────────────────────────────────────────
      ...featureBlock(
        "MODULE-11", "CRM & Marketing",
        "Lead management, call tracking, WhatsApp/SMS/email marketing, Facebook lead ad capture, automated follow-up sequences, and customer segmentation.",
        [
          "POST /crm/leads                     # Create lead (manual or from web form)",
          "GET  /crm/leads                     # List leads with filters",
          "GET  /crm/leads/:id                 # Lead details",
          "PUT  /crm/leads/:id                 # Update lead status/notes",
          "POST /crm/leads/:id/note            # Add note to lead",
          "POST /crm/leads/:id/call            # Log call",
          "POST /crm/leads/facebook            # [PUBLIC] Facebook Lead Ad webhook",
          "POST /crm/whatsapp/send             # Send WhatsApp message",
          "POST /crm/sms/send                  # Send SMS",
          "POST /crm/email/send                # Send email",
          "POST /crm/broadcast/whatsapp        # WhatsApp broadcast to segment",
          "POST /crm/broadcast/sms             # SMS broadcast to segment",
          "GET  /crm/campaigns                 # Marketing campaigns",
          "POST /crm/campaigns                 # Create campaign",
          "GET  /crm/segments                  # Customer segments",
        ],
        [
          "leads table:",
          "  id UUID PK, source ENUM(WEBSITE|FACEBOOK|WHATSAPP|PHONE|WALK_IN|AGENT_REFERRAL),",
          "  name VARCHAR, phone VARCHAR, email VARCHAR,",
          "  interest ENUM(FLIGHT|HOTEL|TOUR|VISA|UMRAH|EDUCATION|MANPOWER),",
          "  destination VARCHAR, travel_date DATE,",
          "  budget DECIMAL(10,2) NULLABLE,",
          "  status ENUM(NEW|CONTACTED|QUALIFIED|PROPOSAL|WON|LOST),",
          "  assigned_to UUID FK NULLABLE,",
          "  facebook_lead_id VARCHAR NULLABLE,",
          "  notes TEXT, last_contact_at TIMESTAMP,",
          "  converted_booking_id UUID NULLABLE,",
          "  created_at TIMESTAMP",
          "",
          "call_logs table:",
          "  id UUID PK, lead_id UUID FK, user_id UUID FK NULLABLE,",
          "  direction ENUM(INBOUND|OUTBOUND),",
          "  duration_seconds INT, outcome ENUM(ANSWERED|NO_ANSWER|BUSY|CALLBACK),",
          "  notes TEXT, follow_up_at TIMESTAMP NULLABLE, created_at TIMESTAMP",
        ],
        [
          "Facebook Lead Ads: set up webhook endpoint — Facebook sends lead data on form submit. Map fields to leads table",
          "WhatsApp via WATI: use WATI API (wati.io). Send template messages (pre-approved by Meta) for booking confirmations",
          "SMS via SSL Wireless: POST to SSL Wireless REST API. Cheaper than Twilio for BD — critical for cost control",
          "IMO: no official API — use WhatsApp as primary, note that migrant worker segment uses IMO",
          "Automated sequences: BullMQ delayed jobs — e.g., lead created → wait 2hr → if not contacted → send WhatsApp reminder to assigned staff",
          "Birthday offer: cron job daily → query users with birthday today → send personalized WhatsApp offer",
          "Customer segmentation: query PostgreSQL by booking frequency, last booking date, preferred destination, total spend",
        ],
        [
          "WATI WhatsApp Business API (wati.io)",
          "SSL Wireless SMS REST API",
          "Facebook Lead Ads Webhook API (Meta for Developers)",
          "SendGrid — email campaigns",
          "BullMQ — delayed follow-up jobs",
        ]
      ),

      // ── MODULE 12: AI ──────────────────────────────────────────────────
      ...featureBlock(
        "MODULE-12", "AI Features",
        "Claude API-powered AI trip planner, visa assistant, customer support chatbot, price prediction, and fraud scoring. All AI responses support Bengali and English.",
        [
          "POST /ai/trip-planner               # [PUBLIC] AI trip plan from natural language",
          "POST /ai/visa-assistant             # [PUBLIC] Visa guidance chatbot",
          "POST /ai/support-chat               # Customer support chatbot",
          "POST /ai/recommend-packages         # Smart package recommendations",
          "POST /ai/price-predict              # Book now or wait? prediction",
          "POST /ai/fraud-score/:bookingId     # [INTERNAL] Fraud risk score",
          "GET  /ai/chat/history/:sessionId    # Chat history",
        ],
        [
          "ai_chat_sessions table:",
          "  id UUID PK, session_id VARCHAR UNIQUE,",
          "  user_id UUID FK NULLABLE, type ENUM(TRIP_PLANNER|VISA|SUPPORT|RECOMMEND),",
          "  language ENUM(en|bn) DEFAULT bn,",
          "  messages JSONB[],  -- { role: user|assistant, content, timestamp }",
          "  created_at TIMESTAMP, last_message_at TIMESTAMP",
          "",
          "ai_fraud_scores table:",
          "  id UUID PK, booking_id UUID, booking_type VARCHAR,",
          "  score DECIMAL(4,2),  -- 0.00 to 1.00",
          "  risk_level ENUM(LOW|MEDIUM|HIGH|CRITICAL),",
          "  flags JSONB,  -- { newDevice, unusualRoute, highValue, multipleCards }",
          "  action_taken ENUM(NONE|FLAGGED|BLOCKED|MANUAL_REVIEW),",
          "  created_at TIMESTAMP",
        ],
        [
          "Anthropic Claude API — model: claude-sonnet-4-20250514",
          "System prompt for trip planner: include available routes, packages, seasonal info. Respond in user's language (detect from input)",
          "System prompt for visa assistant: include country visa requirements from MongoDB visa_countries collection",
          "Fraud scoring: rule-based + Claude analysis. Flags: new device + high-value booking, unusual route for user, multiple failed payment attempts, velocity (>3 bookings in 1 hour)",
          "Price prediction: feed last 30-day fare history for route + current price + days to departure → Claude predicts trend",
          "Bengali language: Claude handles Bengali natively — detect language from user input, respond in same language",
          "Streaming: use Claude streaming API for real-time chat response — pipe via SSE to frontend",
        ],
        [
          "Anthropic Claude API (api.anthropic.com) — model claude-sonnet-4-20250514",
          "Server-Sent Events (SSE) for streaming chat responses",
          "MODULE-04 (Visa) — visa_countries data for visa assistant context",
          "MODULE-02 (Flight) — fare history for price prediction",
        ]
      ),

      // ── MODULE 13: NOTIFICATION ────────────────────────────────────────
      ...featureBlock(
        "MODULE-13", "Notification Service",
        "Unified notification service fan-out. All modules emit events — notification service handles delivery via WhatsApp, SMS, email, and push. All notifications support Bengali.",
        [
          "POST /notifications/send            # [INTERNAL] Send notification",
          "GET  /notifications/preferences     # User notification preferences",
          "PUT  /notifications/preferences     # Update preferences",
          "GET  /notifications                 # User notification history",
          "PUT  /notifications/:id/read        # Mark as read",
        ],
        [
          "notifications table:",
          "  id UUID PK, user_id UUID FK,",
          "  type ENUM(BOOKING_CONFIRMED|TICKET_ISSUED|PAYMENT_SUCCESS|REFUND_PROCESSED|",
          "            VISA_STATUS|UMRAH_VISA|FLIGHT_ALERT|PRICE_ALERT|INSTALLMENT_DUE|",
          "            PASSPORT_EXPIRY|PROMO|SYSTEM),",
          "  channel ENUM(WHATSAPP|SMS|EMAIL|PUSH|ALL),",
          "  title VARCHAR, title_bn VARCHAR,",
          "  body TEXT, body_bn TEXT,",
          "  data JSONB, is_read BOOLEAN DEFAULT false,",
          "  sent_at TIMESTAMP, delivered_at TIMESTAMP NULLABLE,",
          "  created_at TIMESTAMP",
        ],
        [
          "Event-driven: all modules emit events via NestJS EventEmitter. Notification service subscribes to all events",
          "Bengali first: all notifications must have Bengali text (body_bn). Send in user's preferred language",
          "WhatsApp templates: pre-register message templates with Meta (WATI). Templates required for: booking confirmation, ticket, payment, refund, schedule change",
          "SMS: SSL Wireless REST API. Keep SMS under 160 chars for single SMS billing",
          "Push: Firebase FCM via expo-notifications on mobile",
          "Email: SendGrid — HTML templates for tickets and invoices",
          "Fallback: if WhatsApp fails → fallback to SMS. If email fails → log and retry 3x",
          "Priority queue: TICKET_ISSUED and PAYMENT_SUCCESS are high priority — send immediately. PROMO is low priority — batch send",
        ],
        [
          "WATI WhatsApp API",
          "SSL Wireless SMS API",
          "Firebase Admin SDK (FCM)",
          "SendGrid email API",
          "BullMQ — notification queues with priority levels",
          "NestJS EventEmitter — receives events from all modules",
        ]
      ),

      // ── MODULE 14: EDUCATION ───────────────────────────────────────────
      ...featureBlock(
        "MODULE-14", "Education Consultancy",
        "Student profile management, university directory, course application tracking, CAS letter management, student visa integration, and embassy appointment booking.",
        [
          "GET  /education/countries           # [PUBLIC] Study destination countries",
          "GET  /education/universities        # [PUBLIC] University list with filters",
          "GET  /education/universities/:id    # [PUBLIC] University details + courses",
          "POST /education/students            # Create student profile",
          "GET  /education/students/:id        # Student profile",
          "PUT  /education/students/:id        # Update student profile",
          "POST /education/applications        # Submit university application",
          "GET  /education/applications        # Student's applications",
          "GET  /education/applications/:id    # Application details",
          "PUT  /education/applications/:id/status # [STAFF] Update status",
          "POST /education/documents/:appId    # Upload document",
          "POST /education/inquire             # [PUBLIC] Consultation inquiry",
        ],
        [
          "students table:",
          "  id UUID PK, user_id UUID FK,",
          "  full_name VARCHAR, date_of_birth DATE, gender ENUM(M|F),",
          "  passport_number VARCHAR, passport_expiry DATE,",
          "  nid_number VARCHAR, phone VARCHAR,",
          "  last_qualification ENUM(SSC|HSC|BACHELOR|MASTER),",
          "  gpa DECIMAL(4,2), institution VARCHAR, passing_year INT,",
          "  ielts_score DECIMAL(3,1) NULLABLE, toefl_score INT NULLABLE,",
          "  pte_score DECIMAL(4,1) NULLABLE,",
          "  preferred_country VARCHAR, preferred_subject VARCHAR,",
          "  budget_usd INT NULLABLE, created_at TIMESTAMP",
          "",
          "education_applications table:",
          "  id UUID PK, student_id UUID FK, university_id VARCHAR,",
          "  course_name VARCHAR, intake ENUM(JAN|MAY|SEP),",
          "  status ENUM(DRAFT|SUBMITTED|OFFER_RECEIVED|CAS_ISSUED|VISA_APPLIED|ENROLLED|REJECTED),",
          "  offer_letter_url VARCHAR NULLABLE,",
          "  cas_number VARCHAR NULLABLE, cas_expiry DATE NULLABLE,",
          "  embassy_appointment_date TIMESTAMP NULLABLE,",
          "  service_fee DECIMAL(10,2),",
          "  notes TEXT, created_at TIMESTAMP",
          "",
          "universities collection (MongoDB):",
          "  id, name, country, city, ranking, logoUrl,",
          "  courses[{ name, level, duration, tuitionFee, currency, intakes[] }],",
          "  requirementsPerCountry{ BD: { ielts, toefl, gpa } },",
          "  scholarships[], applicationDeadlines{}, websiteUrl",
        ],
        [
          "Top priority countries: UK, Canada, Australia, Malaysia, Hungary — build these first",
          "CAS letter: UK-specific — Confirmation of Acceptance for Studies. Track CAS number and expiry (usually 6 months)",
          "Document expiry alerts: cron job daily — check passport expiry, CAS expiry, bank statement age (must be < 3 months)",
          "Student visa: on CAS issue, create visa application automatically in MODULE-04 (Visa)",
          "Service fee: education consultancy service fee is separate from visa fee — stored in application record",
          "Inquiry to lead: education inquiry creates CRM lead in MODULE-11 (CRM) with interest=EDUCATION",
        ],
        [
          "MongoDB — university directory",
          "MODULE-04 (Visa) — student visa application",
          "MODULE-11 (CRM) — education inquiry leads",
          "MODULE-13 (Notification) — application status updates",
          "AWS S3 / DO Spaces — document storage",
        ]
      ),

      // ── MODULE 15: COUNTER/POS ─────────────────────────────────────────
      ...featureBlock(
        "MODULE-15", "Counter / POS Mode",
        "Walk-in customer management for Sarah Travels BD office. Staff books on behalf of walk-in customers, records cash payments, prints receipts, and maintains unified customer files.",
        [
          "POST /counter/customers             # [STAFF] Create walk-in customer",
          "GET  /counter/customers/search      # [STAFF] Search customer by name/phone",
          "GET  /counter/customers/:id         # Customer file (all services linked)",
          "POST /counter/book/flight           # [STAFF] Book flight for walk-in",
          "POST /counter/book/visa             # [STAFF] Submit visa for walk-in",
          "POST /counter/book/umrah            # [STAFF] Book Umrah for walk-in",
          "POST /counter/payment/cash          # [STAFF] Record cash payment",
          "GET  /counter/receipt/:bookingId    # [STAFF] Generate receipt PDF",
          "GET  /counter/daily-report          # [MANAGER] Daily counter report",
        ],
        [
          "counter_customers table:",
          "  id UUID PK, full_name VARCHAR, phone VARCHAR,",
          "  email VARCHAR NULLABLE,",
          "  passport_number VARCHAR NULLABLE, passport_expiry DATE NULLABLE,",
          "  address TEXT NULLABLE, notes TEXT,",
          "  created_by UUID FK,  -- staff member",
          "  created_at TIMESTAMP",
          "",
          "-- Counter bookings link to main booking tables (flight_bookings, visa_applications etc.)",
          "-- with is_counter_booking BOOLEAN DEFAULT false flag",
          "-- and counter_customer_id UUID FK NULLABLE",
        ],
        [
          "Counter mode is a simplified UI in the admin/apps panel — not a separate app",
          "Cash payment: POST /counter/payment/cash creates payment record with gateway=CASH and manual confirmation",
          "Receipt: 58mm and 80mm thermal printer support via browser print API — generate receipt as print-optimized HTML",
          "Customer file: one unified view showing all services for this customer — flights, visas, Umrah, education",
          "Staff can search existing users by phone — if found, link counter booking to existing user account",
          "All counter bookings flagged is_counter_booking=true for reporting separation",
        ],
        [
          "All booking modules (02–06, 14) — counter mode uses same booking services",
          "MODULE-07 (Payment) — cash payment recording",
          "Puppeteer — receipt PDF",
          "Browser Print API — thermal printer support",
        ]
      ),

      // ── MODULE 16: LOYALTY ─────────────────────────────────────────────
      ...featureBlock(
        "MODULE-16", "Loyalty Program (Phase 3)",
        "Points-based loyalty system with Silver/Gold/Platinum tiers, referral program, cashback campaigns, and automated birthday/anniversary offers.",
        [
          "GET  /loyalty/balance               # Points balance + tier",
          "GET  /loyalty/transactions          # Points history",
          "GET  /loyalty/tiers                 # Tier benefits",
          "POST /loyalty/redeem                # Redeem points for wallet credit",
          "POST /loyalty/refer                 # Generate referral code",
          "GET  /loyalty/referrals             # Referral history + earnings",
          "GET  /loyalty/campaigns             # Active cashback campaigns",
          "POST /loyalty/campaigns             # [ADMIN] Create campaign",
        ],
        [
          "loyalty_accounts table:",
          "  id UUID PK, user_id UUID FK UNIQUE,",
          "  points_balance INT DEFAULT 0,",
          "  lifetime_points INT DEFAULT 0,",
          "  tier ENUM(STANDARD|SILVER|GOLD|PLATINUM) DEFAULT STANDARD,",
          "  tier_updated_at TIMESTAMP,",
          "  referral_code VARCHAR UNIQUE,",
          "  referred_by UUID FK NULLABLE, updated_at TIMESTAMP",
          "",
          "loyalty_transactions table:",
          "  id UUID PK, account_id UUID FK,",
          "  type ENUM(EARN|REDEEM|EXPIRE|BONUS|REFERRAL),",
          "  points INT, booking_type VARCHAR, booking_id UUID,",
          "  description VARCHAR, expires_at TIMESTAMP NULLABLE,",
          "  created_at TIMESTAMP",
          "",
          "loyalty_campaigns table:",
          "  id UUID PK, name VARCHAR, type ENUM(CASHBACK|BONUS_POINTS|DISCOUNT),",
          "  applicable_to ENUM(ALL|FLIGHT|HOTEL|TOUR|UMRAH),",
          "  value DECIMAL(5,2), value_type ENUM(PERCENT|FIXED),",
          "  min_booking_amount DECIMAL(10,2),",
          "  start_date DATE, end_date DATE, is_active BOOLEAN,",
          "  usage_limit INT NULLABLE, used_count INT DEFAULT 0",
        ],
        [
          "Points earning: 1 point per BDT 100 spent on flights, 2 points per BDT 100 on hotels, 5 points per BDT 100 on Umrah",
          "Tier thresholds: Silver = 1,000 lifetime points, Gold = 5,000, Platinum = 20,000",
          "Tier benefits: Silver = 10% bonus points, Gold = 20% bonus + priority support, Platinum = 30% bonus + dedicated agent",
          "Referral: referee gets 200 points on first booking > BDT 5,000. Referrer gets 500 points",
          "Points expiry: points earned expire 12 months from earning date — BullMQ cron job monthly",
          "Birthday offer: cron job daily — query users with today's birthday → send 100 bonus points + WhatsApp message",
          "Redemption: 100 points = BDT 10 wallet credit. Min redemption: 500 points",
        ],
        [
          "BullMQ — points expiry cron, birthday offers",
          "MODULE-07 (Payment) — cashback credited to wallet after booking",
          "MODULE-13 (Notification) — tier upgrade, points earned, referral success",
        ]
      ),

      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════════════════════════════
      // SECTION 6: FRONTEND PAGES
      // ════════════════════════════════════════════════════════════════════
      h1("FRONTEND PAGES — Next.js App Router"),
      h2("Customer Web (apps/web)"),
      tbl(["Route", "Page", "Key Components", "Auth"], [
        ["/", "Homepage", "Hero search (flights), featured packages, popular routes, trust badges (ATAB/IATA)", "Public"],
        ["/flights", "Flight Search Results", "Filter sidebar, flight cards, fare breakdown, sort options, fare calendar", "Public"],
        ["/flights/[offerId]", "Flight Details", "Segment details, fare rules, baggage, seat map, passenger form", "Public"],
        ["/flights/book", "Booking Checkout", "Passenger details, add-ons, price summary, payment selector", "Auth"],
        ["/hotels", "Hotel Search", "Search form, map view toggle, hotel cards, filters", "Public"],
        ["/hotels/[id]", "Hotel Details", "Photos, rooms, amenities, reviews, map, book button", "Public"],
        ["/tours", "Tour Packages", "Filter by type/destination, package cards, comparison", "Public"],
        ["/tours/[id]", "Tour Details", "Itinerary, inclusions, photos, inquiry form", "Public"],
        ["/visa", "Visa Services", "Country selector, visa types, requirements", "Public"],
        ["/visa/[country]", "Country Visa Guide", "Requirements, documents, fees, apply button", "Public"],
        ["/visa/apply/[appId]", "Visa Application", "Multi-step form, document upload", "Auth"],
        ["/umrah", "Umrah Packages", "Package cards with SAR/BDT pricing, group options", "Public"],
        ["/umrah/[id]", "Umrah Package Detail", "Inclusions, hotel details, installment calculator", "Public"],
        ["/education", "Education Consultancy", "Country selector, university browse, inquiry form", "Public"],
        ["/account", "My Account", "Profile, traveller profiles, passport info", "Auth"],
        ["/account/bookings", "My Bookings", "All bookings across verticals, status badges", "Auth"],
        ["/account/wallet", "Wallet", "Balance, transactions, top-up", "Auth"],
        ["/payment/[id]", "Payment Page", "Gateway selector, OTP, payment summary", "Auth"],
        ["/payment/success", "Payment Success", "Confirmation, download ticket, WhatsApp share", "Auth"],
      ], [2000, 1800, 3800, 1560]),

      ...sp(1),
      h2("Admin Panel (apps/admin)"),
      tbl(["Route", "Page", "Access"], [
        ["/dashboard", "Overview dashboard — bookings, revenue, agents, tickets today", "Manager+"],
        ["/bookings/flights", "All flight bookings — search, filter, manage", "Staff+"],
        ["/bookings/hotels", "All hotel bookings", "Staff+"],
        ["/bookings/visa", "Visa applications — status management", "Staff+"],
        ["/bookings/umrah", "Umrah bookings + pilgrim management", "Staff+"],
        ["/bookings/manpower", "Worker group management", "Staff+"],
        ["/customers", "Customer database + booking history", "Staff+"],
        ["/agents", "Agent management — KYC, credit, tier, deposit confirmation", "Manager+"],
        ["/agents/deposits", "Pending deposit confirmations", "Manager+"],
        ["/accounting/dashboard", "Financial summary", "Accountant+"],
        ["/accounting/cashbook", "Cash book entries", "Accountant+"],
        ["/accounting/pl", "P&L statement", "Accountant+"],
        ["/accounting/ait-vat", "AIT/VAT reports for NBR", "Accountant+"],
        ["/crm/leads", "Lead pipeline — kanban or table view", "Staff+"],
        ["/crm/campaigns", "Marketing campaigns", "Manager+"],
        ["/counter", "Walk-in counter booking mode", "Staff+"],
        ["/settings/airlines", "Airline markup rules configuration", "Admin"],
        ["/settings/users", "Staff account management", "Admin"],
      ], [2200, 4700, 2460]),

      ...sp(1),
      h2("Agent Portal (apps/agent)"),
      tbl(["Route", "Page", "Notes"], [
        ["/dashboard", "Agent dashboard — wallet, today's bookings, commission", ""],
        ["/search/flights", "Flight search with net fare + markup visible to agent", ""],
        ["/search/hotels", "Hotel search with agent rates", ""],
        ["/bookings", "All agent bookings across verticals", ""],
        ["/wallet", "Wallet balance, transactions, deposit request", ""],
        ["/commission", "Commission earned, pending, paid + monthly statement PDF", ""],
        ["/sub-agents", "Sub-agent management — add, set credit limit, suspend", "Gold/Platinum only"],
        ["/customers/book", "Book on behalf of customer (impersonation flow)", ""],
        ["/branding", "White-label logo and color settings", "Gold/Platinum only"],
      ], [2200, 4700, 2460]),

      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════════════════════════════
      // SECTION 7: ENVIRONMENT VARIABLES
      // ════════════════════════════════════════════════════════════════════
      h1("ENVIRONMENT VARIABLES"),
      body("All services read from .env via @nestjs/config. Store secrets in DigitalOcean App Platform env or AWS Secrets Manager — never commit to Git."),
      ...sp(1),
      ...codeBlock([
        "# Database",
        "DATABASE_URL=postgresql://user:pass@host:5432/sarahtravels",
        "MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sarahtravels",
        "REDIS_URL=redis://host:6379",
        "",
        "# Auth",
        "JWT_SECRET=<strong-random-256-bit-key>",
        "JWT_REFRESH_SECRET=<different-strong-key>",
        "JWT_EXPIRY=15m",
        "JWT_REFRESH_EXPIRY=7d",
        "",
        "# Amadeus",
        "AMADEUS_CLIENT_ID=<from-developers.amadeus.com>",
        "AMADEUS_CLIENT_SECRET=<from-developers.amadeus.com>",
        "AMADEUS_HOSTNAME=test  # or production",
        "",
        "# Hotelbeds",
        "HOTELBEDS_API_KEY=<from-developer.hotelbeds.com>",
        "HOTELBEDS_SECRET=<from-developer.hotelbeds.com>",
        "",
        "# Payments",
        "SSLCOMMERZ_STORE_ID=<store-id>",
        "SSLCOMMERZ_STORE_PASS=<store-password>",
        "SSLCOMMERZ_IS_LIVE=false  # true for production",
        "BKASH_APP_KEY=<bkash-merchant-key>",
        "BKASH_APP_SECRET=<bkash-merchant-secret>",
        "BKASH_USERNAME=<bkash-merchant-username>",
        "BKASH_PASSWORD=<bkash-merchant-password>",
        "NAGAD_MERCHANT_ID=<nagad-merchant-id>",
        "NAGAD_MERCHANT_PRIVATE_KEY=<rsa-private-key>",
        "NAGAD_IS_LIVE=false",
        "",
        "# Notifications",
        "WATI_API_ENDPOINT=https://live-server.wati.io",
        "WATI_ACCESS_TOKEN=<wati-access-token>",
        "SSL_WIRELESS_API_URL=http://208.87.35.170/api.php",
        "SSL_WIRELESS_APITOKEN=<token>",
        "SSL_WIRELESS_SID=<sender-id>",
        "SENDGRID_API_KEY=<sendgrid-key>",
        "SENDGRID_FROM_EMAIL=noreply@sarahtravelsbd.com",
        "FIREBASE_SERVICE_ACCOUNT=<base64-encoded-firebase-json>",
        "",
        "# AI",
        "ANTHROPIC_API_KEY=<anthropic-api-key>",
        "",
        "# Storage",
        "DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com",
        "DO_SPACES_BUCKET=sarahtravels-docs",
        "DO_SPACES_KEY=<spaces-key>",
        "DO_SPACES_SECRET=<spaces-secret>",
        "",
        "# OAuth",
        "GOOGLE_CLIENT_ID=<google-oauth-client-id>",
        "GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>",
        "FACEBOOK_APP_ID=<facebook-app-id>",
        "FACEBOOK_APP_SECRET=<facebook-app-secret>",
        "",
        "# App",
        "APP_URL=https://sarahtravelsbd.com",
        "API_URL=https://api.sarahtravelsbd.com",
        "NODE_ENV=development",
        "PORT=3001",
        "",
        "# Nusuk (Umrah)",
        "NUSUK_API_URL=<nusuk-api-endpoint>",
        "NUSUK_API_KEY=<nusuk-api-key>",
        "",
        "# Exchange Rate",
        "EXCHANGE_RATE_API_KEY=<exchangerate-api-key>",
      ]),
      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════════════════════════════
      // SECTION 8: BANGLADESHI COMPLIANCE RULES
      // ════════════════════════════════════════════════════════════════════
      h1("BANGLADESH COMPLIANCE RULES — HARD REQUIREMENTS"),
      body("These rules must be enforced at the application layer — not optional:", true, RED),
      ...sp(1),
      tbl(["Rule", "Where to Enforce", "Implementation"], [
        ["AIT 0.3% on every air ticket", "flight-service — on booking creation", "ait_amount = ROUND(total_ticket_price * 0.003, 2). Store separately. Report monthly to NBR"],
        ["VAT 15% on service fee only (not ticket price)", "payment-service — on checkout", "vat_amount = ROUND(service_fee * 0.15, 2). Generate Mushak 6.3 challan on demand"],
        ["OTP verification before payment", "payment-service — pre-payment guard", "Check otp_verified_at < 10 minutes in session. Reject payment if not verified"],
        ["Agent TIN required for B2B registration", "agent-service — registration validation", "Validate TIN format (12 digits). Store tin_number as required field"],
        ["Passport expiry warning (< 6 months)", "auth-service — on login, flight-service — on booking", "Query traveller_profiles — warn if passport_expiry < TODAY + 6 months"],
        ["ATAB/IATA license display", "Frontend — footer and trust section", "Display license numbers prominently. Store in site config"],
        ["Bengali language for all user communications", "notification-service", "All SMS, WhatsApp messages must have Bengali version. Use body_bn field"],
        ["Duplicate PNR prevention", "flight-service — pre-booking check", "Query: same passenger_passport + same flight_number + same departure_at. Flag if found"],
        ["BSP reconciliation monthly", "accounting-service", "Export ticketed bookings as BSP format CSV. Admin uploads BSP file to reconcile"],
      ], [2400, 2400, 4560]),

      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════════════════════════════
      // SECTION 9: PHASE BUILD ORDER
      // ════════════════════════════════════════════════════════════════════
      h1("BUILD ORDER FOR ANTIGRAVITY"),
      body("Build modules in this exact order — later modules depend on earlier ones:", true),
      ...sp(1),
      tbl(["Order", "Module", "Why First"], [
        ["1", "MODULE-01: Auth", "Every other module needs auth guards and user context"],
        ["2", "MODULE-07: Payment", "Flight booking needs payment confirmation events"],
        ["3", "MODULE-10: Accounting", "Listens to payment events — must be ready when payments go live"],
        ["4", "MODULE-13: Notification", "All modules send notifications — must be ready"],
        ["5", "MODULE-02: Flight", "Core revenue — Amadeus integration, PNR, ticketing"],
        ["6", "MODULE-08: Agent", "B2B portal — builds on top of flight module"],
        ["7", "MODULE-04: Visa", "Sarah Travels BD specialty — high priority"],
        ["8", "MODULE-05: Umrah", "High-margin vertical — Phase 1 launch requirement"],
        ["9", "MODULE-15: Counter", "Walk-in office support — Phase 1 launch requirement"],
        ["10", "MODULE-11: CRM", "Lead capture and marketing — Phase 1 after launch"],
        ["11", "MODULE-03: Hotel", "Phase 2 — Hotelbeds integration"],
        ["12", "MODULE-06: Tour", "Phase 2 — content in MongoDB"],
        ["13", "MODULE-09: Manpower", "Phase 2 — builds on flight module"],
        ["14", "MODULE-14: Education", "Phase 2 — builds on visa module"],
        ["15", "MODULE-12: AI", "Phase 2 — after content modules are populated"],
        ["16", "MODULE-16: Loyalty", "Phase 3 — after user base is established"],
      ], [700, 2500, 6160]),

      ...sp(1),
      new Paragraph({
        children: [new TextRun({ text: "END OF SPECIFICATION — FEED ENTIRE DOCUMENT TO ANTIGRAVITY", font: "Consolas", size: 22, bold: true, color: WHITE })],
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 }
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("./SarahTravelsBD_Antigravity_Spec_v1.0.docx", buf);
  console.log("Done.");
});
