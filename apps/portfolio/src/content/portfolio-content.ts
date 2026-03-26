export const content = {
  meta: {
    title: "Than Nguyen — Fullstack Engineer",
    description:
      "Fullstack engineer specialising in internal tooling and enterprise workflow platforms. Currently open to fullstack roles.",
    url: "https://thannguyendev.org",
    image: "/og-image.png",
  },

  nav: {
    name: "Than Nguyen",
    links: [
      { label: "About", href: "#about" },
      { label: "Skills", href: "#skills" },
      { label: "Project", href: "#project" },
      { label: "Demo", href: "#demo" },
      { label: "Contact", href: "#contact" },
    ],
    demoLink: {
      label: "View Demo",
      href: "https://app.thannguyendev.org",
    },
  },

  hero: {
    badge: "Open to fullstack roles",
    heading: "Fullstack Engineer",
    subheading: "Internal Tools & Enterprise Workflows",
    tagline:
      "I build production-grade platforms that operations teams actually rely on — with proper multi-tenancy, role-based access control, and CI/CD from day one.",
    cta: {
      primary: {
        label: "View Live Demo",
        href: "https://app.thannguyendev.org",
      },
      secondary: {
        label: "GitHub",
        href: "https://github.com/thannguyen9x-vn-dev/supportops-monorepo",
      },
    },
  },

  about: {
    id: "about",
    heading: "About",
    paragraphs: [
      "I specialise in fullstack development for internal tooling — service desks, workflow platforms, and multi-tenant SaaS products used inside organisations.",
      "My focus is production readiness from the start: clear data models, proper access control, observable deployments, and UIs that don't get in the way of the people using them.",
      "SupportOps is my flagship side project — an end-to-end service request platform built with Next.js, NestJS, PostgreSQL, and Redis, deployed on a real server with Docker and Nginx.",
    ],
    stats: [
      { value: "4", label: "Roles in RBAC system" },
      { value: "3", label: "Apps in monorepo" },
      { value: "CI/CD", label: "GitHub Actions + SSH deploy" },
      { value: "SSL", label: "Let's Encrypt + Nginx" },
    ],
  },

  skills: {
    id: "skills",
    heading: "Core Skills",
    groups: [
      {
        category: "Frontend",
        items: ["Next.js 16 (App Router)", "React 19", "TypeScript", "MUI 7"],
      },
      {
        category: "Backend",
        items: ["NestJS 11", "Prisma ORM", "PostgreSQL 16", "Redis / BullMQ"],
      },
      {
        category: "Infrastructure",
        items: ["Docker", "Nginx", "GitHub Actions", "Let's Encrypt SSL"],
      },
      {
        category: "Architecture",
        items: ["pnpm Monorepo", "Turborepo", "Multi-tenant SaaS", "RBAC"],
      },
    ],
  },

  project: {
    id: "project",
    heading: "Featured Project",
    name: "SupportOps",
    tagline:
      "Enterprise-grade internal service request management platform",
    description:
      "A multi-tenant platform for managing service requests across an organisation. Built with four distinct roles, SLA tracking, escalation rules, file attachments, email notifications, and full audit trails — from scratch.",
    highlights: [
      "Multi-tenant with per-tenant data isolation at the database level",
      "4-role RBAC: Tenant Admin, Ops Coordinator, Technician, Employee",
      "SLA tracking with automatic escalation via background jobs",
      "Request lifecycle: Draft → Submitted → Assigned → In Progress → Resolved",
      "Activity timeline and audit log on every request",
      "File attachments with signed URL access control",
      "Email notifications via Resend with daily rate limiting",
    ],
    links: {
      demo: "https://app.thannguyendev.org",
      github:
        "https://github.com/thannguyen9x-vn-dev/supportops-monorepo",
    },
  },

  demonstrates: {
    heading: "What This Project Demonstrates",
    items: [
      {
        title: "Multi-tenant architecture",
        description:
          "Row-level tenant isolation in PostgreSQL. Every query is scoped to the current tenant — no data leakage across organisation boundaries.",
      },
      {
        title: "Role-based access control",
        description:
          "Guards at the NestJS layer and conditional rendering on the frontend. Roles determine visible data and permitted actions throughout the stack.",
      },
      {
        title: "Production deployment pipeline",
        description:
          "GitHub Actions builds Docker images, pushes to GHCR, deploys via SSH, runs Prisma migrations, auto-seeds on first deploy, then smoke-tests before completing.",
      },
      {
        title: "Monorepo with shared packages",
        description:
          "pnpm workspaces and Turborepo coordinate builds across API, web, worker, and shared packages. Type contracts shared via a dedicated types package.",
      },
      {
        title: "Background job processing",
        description:
          "BullMQ on Redis handles email notifications and SLA escalation scheduling — decoupled from the HTTP request/response cycle.",
      },
      {
        title: "Clean API design",
        description:
          "RESTful NestJS API with OpenAPI docs, Prisma-managed schema migrations, JWT auth with refresh token rotation, and rate limiting via @nestjs/throttler.",
      },
    ],
  },

  demo: {
    id: "demo",
    heading: "Try the Demo",
    url: "https://app.thannguyendev.org",
    note: "The demo runs on a real server with a real database. Each role has a separate account so you can explore the platform from different perspectives.",
    roles: [
      {
        role: "Tenant Admin",
        description:
          "Full platform control — manage team members, tenant settings, and all service requests",
      },
      {
        role: "Ops Coordinator",
        description:
          "Assign and oversee service requests, manage SLA rules and escalation policies",
      },
      {
        role: "Technician",
        description:
          "Work on assigned requests, update progress status, and add activity notes",
      },
      {
        role: "Employee",
        description:
          "Submit service requests, track progress, and communicate via activity thread",
      },
    ],
    credential:
      "Demo credentials available upon request — contact me via email or LinkedIn below.",
  },

  technical: {
    heading: "Technical Snapshot",
    stack: [
      {
        layer: "Frontend",
        value: "Next.js 16 · React 19 · MUI 7 · App Router · Standalone build",
      },
      {
        layer: "Backend",
        value: "NestJS 11 · Prisma 6 · PostgreSQL 16 · JWT + Refresh tokens",
      },
      {
        layer: "Queue",
        value: "BullMQ · Redis 7 · async jobs for email & SLA escalation",
      },
      {
        layer: "Infrastructure",
        value: "Docker · Nginx 1.27 · Let's Encrypt · pnpm 9 · Node 20",
      },
      {
        layer: "CI/CD",
        value:
          "GitHub Actions · GHCR image registry · SSH deploy · Turbo build cache",
      },
      {
        layer: "Architecture",
        value:
          "pnpm monorepo · Turborepo · shared types package · shared UI library",
      },
    ],
    github:
      "https://github.com/thannguyen9x-vn-dev/supportops-monorepo",
  },

  contact: {
    id: "contact",
    heading: "Get in Touch",
    intro:
      "I'm open to fullstack engineering roles, particularly in internal tooling, enterprise SaaS, or platform engineering. Feel free to reach out.",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/thannguyen9x-vn-dev",
        description: "github.com/thannguyen9x-vn-dev",
      },
      {
        label: "LinkedIn",
        href: "https://linkedin.com/in/thannguyendev",
        description: "linkedin.com/in/thannguyendev",
      },
      {
        label: "Email",
        href: "mailto:thannguyen@thannguyendev.org",
        description: "thannguyen@thannguyendev.org",
      },
    ],
  },

  footer: {
    name: "Than Nguyen",
    year: 2025,
    tagline: "Built with Next.js · Deployed on thannguyendev.org",
    github: "https://github.com/thannguyen9x-vn-dev",
  },
} as const;
