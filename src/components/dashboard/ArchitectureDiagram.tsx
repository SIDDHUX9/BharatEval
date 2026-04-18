import { motion } from "framer-motion";
import {
  Users,
  Feather,
  BookOpen,
  Languages,
  Scale,
  Database,
  Cpu,
  Globe,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Zap,
  FileText,
  BarChart3,
} from "lucide-react";

// ─── Shared primitives ────────────────────────────────────────────────────────

function Box({
  icon: Icon,
  title,
  subtitle,
  color = "text-primary",
  delay = 0,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color?: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`border border-border bg-card p-3 flex flex-col items-center text-center gap-1 min-w-[100px] ${className}`}
      style={{ boxShadow: "1px 2px 6px rgba(74,63,53,0.07)" }}
    >
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-xs font-bold leading-tight" style={{ fontFamily: "'Lora', serif" }}>{title}</span>
      {subtitle && <span className="text-[10px] text-muted-foreground italic leading-tight">{subtitle}</span>}
    </motion.div>
  );
}

function Arrow({ dir = "right", delay = 0 }: { dir?: "right" | "down"; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center justify-center text-muted-foreground/60 shrink-0"
    >
      {dir === "right" ? <ArrowRight className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      <span className="text-primary/40">✦</span>
      {children}
    </div>
  );
}

function Layer({
  label,
  color,
  children,
  delay = 0,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="border border-border bg-card overflow-hidden"
      style={{ boxShadow: "1px 2px 6px rgba(74,63,53,0.06)" }}
    >
      <div className={`px-4 py-2 border-b border-border ${color} flex items-center gap-2`}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{label}</span>
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

// ─── User Flow Diagram ────────────────────────────────────────────────────────

function UserFlowDiagram() {
  const steps = [
    {
      icon: Users,
      title: "Educator / Researcher",
      subtitle: "Enters the Athenaeum",
      color: "text-chart-2",
    },
    {
      icon: Feather,
      title: "Scriptorium",
      subtitle: "Generate or upload questions",
      color: "text-primary",
    },
    {
      icon: BookOpen,
      title: "Question Bank",
      subtitle: "Review & validate",
      color: "text-chart-1",
    },
    {
      icon: Languages,
      title: "Rosetta Chamber",
      subtitle: "Translate to 22 languages",
      color: "text-chart-2",
    },
    {
      icon: Scale,
      title: "The Tribunal",
      subtitle: "Run AI evaluation",
      color: "text-chart-3",
    },
    {
      icon: BarChart3,
      title: "BharatBench Score",
      subtitle: "Composite metric output",
      color: "text-chart-4",
    },
  ];

  const branchSteps = [
    { icon: FileText, title: "Export CSV", subtitle: "Kaggle / research", color: "text-muted-foreground" },
    { icon: Globe, title: "Cross-Lingual Report", subtitle: "Per-language metrics", color: "text-chart-2" },
    { icon: CheckCircle, title: "Validated Dataset", subtitle: "500+ questions", color: "text-chart-3" },
  ];

  return (
    <div className="space-y-6">
      <SectionLabel>User Flow — End-to-End Journey</SectionLabel>

      {/* Main flow */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {steps.map((step, i) => (
            <div key={step.title} className="flex items-center gap-2">
              <Box
                icon={step.icon}
                title={step.title}
                subtitle={step.subtitle}
                color={step.color}
                delay={i * 0.08}
                className="w-28"
              />
              {i < steps.length - 1 && <Arrow dir="right" delay={i * 0.08 + 0.05} />}
            </div>
          ))}
        </div>
      </div>

      {/* Branch outputs */}
      <div className="flex items-start gap-3 pl-4">
        <div className="flex flex-col items-center gap-1 pt-1">
          <div className="w-px h-4 bg-border" />
          <ArrowDown className="w-3 h-3 text-muted-foreground/50" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground italic mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Outputs from BharatBench evaluation</p>
          <div className="flex flex-wrap gap-3">
            {branchSteps.map((b, i) => (
              <Box
                key={b.title}
                icon={b.icon}
                title={b.title}
                subtitle={b.subtitle}
                color={b.color}
                delay={0.5 + i * 0.08}
                className="w-32"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Feedback loop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="border border-dashed border-border/60 p-3 flex items-center gap-3 bg-muted/20"
      >
        <CheckCircle className="w-4 h-4 text-chart-3 shrink-0" />
        <p className="text-xs text-muted-foreground italic">
          <span className="font-semibold text-foreground">Feedback loop:</span> Teacher reviews feed back into question validation → improving BharatBench calibration over time.
        </p>
      </motion.div>
    </div>
  );
}

// ─── System Architecture Diagram ─────────────────────────────────────────────

function SystemArchDiagram() {
  return (
    <div className="space-y-4">
      <SectionLabel>System Architecture — Component Layers</SectionLabel>

      <div className="grid grid-cols-1 gap-3">

        {/* Layer 1: Frontend */}
        <Layer label="Frontend — React + Vite" color="bg-primary/8 text-primary" delay={0.05}>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Globe, label: "Landing Page", sub: "Marketing + CTA" },
              { icon: BarChart3, label: "The Gazette", sub: "Overview + Metrics" },
              { icon: Feather, label: "Scriptorium", sub: "Question Generation" },
              { icon: BookOpen, label: "The Archives", sub: "Question Bank" },
              { icon: Languages, label: "Rosetta Chamber", sub: "Translation UI" },
              { icon: Scale, label: "The Tribunal", sub: "Evaluation UI" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-2 border border-border bg-background px-3 py-2"
              >
                <item.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <div>
                  <div className="text-xs font-semibold leading-tight">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground italic">{item.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Layer>

        <div className="flex justify-center">
          <Arrow dir="down" delay={0.3} />
        </div>

        {/* Layer 2: Convex Backend */}
        <Layer label="Backend — Convex (Reactive DB + Functions)" color="bg-chart-2/10 text-chart-2" delay={0.35}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { icon: Database, label: "questions", sub: "MCQ, numerical, short/long, case study" },
              { icon: Database, label: "translations", sub: "BLEU + semantic scores per language" },
              { icon: Database, label: "evaluations", sub: "Sessions, model stats, language stats" },
              { icon: Database, label: "feedback", sub: "Teacher ratings + validation" },
              { icon: Zap, label: "ai.ts (Actions)", sub: "generateQuestion, translateQuestion, runEval" },
              { icon: Cpu, label: "Cron / Scheduler", sub: "Background jobs, bulk seeding" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-start gap-2 border border-border bg-background px-3 py-2"
              >
                <item.icon className="w-3.5 h-3.5 text-chart-2 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold leading-tight" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item.label}</div>
                  <div className="text-[10px] text-muted-foreground italic">{item.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Layer>

        <div className="flex justify-center">
          <Arrow dir="down" delay={0.6} />
        </div>

        {/* Layer 3: AI Services */}
        <Layer label="AI Services — LLM Gateway" color="bg-chart-3/10 text-chart-3" delay={0.65}>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Zap, label: "Groq (Primary)", sub: "llama-3.3-70b · fast inference" },
              { icon: Cpu, label: "OpenAI (Fallback)", sub: "gpt-4o-mini · quality fallback" },
              { icon: CheckCircle, label: "VLY Integration", sub: "Unified AI gateway" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.06 }}
                className="flex items-center gap-2 border border-border bg-background px-3 py-2 flex-1 min-w-[160px]"
              >
                <item.icon className="w-3.5 h-3.5 text-chart-3 shrink-0" />
                <div>
                  <div className="text-xs font-semibold leading-tight">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground italic">{item.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Layer>

        <div className="flex justify-center">
          <Arrow dir="down" delay={0.85} />
        </div>

        {/* Layer 4: Data & Export */}
        <Layer label="Data & Export Layer" color="bg-chart-4/10 text-chart-4" delay={0.9}>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: FileText, label: "bharateval_questions.csv", sub: "500+ validated questions" },
              { icon: BarChart3, label: "cross_language_metrics.csv", sub: "BLEU, semantic, BharatBench" },
              { icon: Globe, label: "Kaggle Dataset", sub: "Public research release" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95 + i * 0.06 }}
                className="flex items-center gap-2 border border-border bg-background px-3 py-2 flex-1 min-w-[180px]"
              >
                <item.icon className="w-3.5 h-3.5 text-chart-4 shrink-0" />
                <div>
                  <div className="text-xs font-semibold leading-tight" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{item.label}</div>
                  <div className="text-[10px] text-muted-foreground italic">{item.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Layer>
      </div>
    </div>
  );
}

// ─── BharatBench Score Breakdown ─────────────────────────────────────────────

function BharatBenchBreakdown() {
  const metrics = [
    { label: "Accuracy", desc: "Cross-language average correctness", weight: "40%", color: "bg-primary" },
    { label: "Consistency", desc: "< 15% performance gap across languages", weight: "25%", color: "bg-chart-2" },
    { label: "Cultural Fit", desc: "Non-English language performance ratio", weight: "20%", color: "bg-chart-3" },
    { label: "Bias Index", desc: "Low language gap = high score", weight: "15%", color: "bg-chart-4" },
  ];

  return (
    <div className="space-y-4">
      <SectionLabel>BharatBench Score™ — Metric Composition</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-border bg-card p-4"
            style={{ boxShadow: "1px 2px 4px rgba(74,63,53,0.06)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>{m.label}</span>
              <span className="text-xs font-bold text-primary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{m.weight}</span>
            </div>
            <p className="text-xs text-muted-foreground italic mb-2">{m.desc}</p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: m.weight }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                className={`h-full ${m.color} rounded-full`}
              />
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="border border-border bg-muted/20 p-3 text-center"
      >
        <p className="text-xs text-muted-foreground italic">
          <span className="font-semibold text-foreground">BharatBench = </span>
          0.4 × Accuracy + 0.25 × Consistency + 0.20 × CulturalFit + 0.15 × (1 − BiasIndex)
        </p>
      </motion.div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ArchitectureDiagram() {
  return (
    <div className="space-y-10" style={{ fontFamily: "'Libre Baskerville', serif" }}>
      {/* Header */}
      <div className="text-center border-b-2 border-t-2 border-border py-3" style={{ borderStyle: "double" }}>
        <h2 className="text-lg font-bold tracking-widest uppercase" style={{ fontFamily: "'Lora', serif" }}>
          The Blueprint
        </h2>
        <p className="text-xs text-muted-foreground italic mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          User Flow & System Architecture · BharatEval Framework
        </p>
      </div>

      <UserFlowDiagram />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-primary text-sm">✦</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <SystemArchDiagram />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-primary text-sm">✦</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <BharatBenchBreakdown />
    </div>
  );
}
