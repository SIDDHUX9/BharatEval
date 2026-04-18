import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Languages,
  BarChart3,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Globe,
  Feather,
  Scale,
  Moon,
  Sun,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import QuestionBank from "@/components/dashboard/QuestionBank";
import TranslationPanel from "@/components/dashboard/TranslationPanel";
import EvaluationDashboard from "@/components/dashboard/EvaluationDashboard";
import GenerateQuestion from "@/components/dashboard/GenerateQuestion";
import ArchitectureDiagram from "@/components/dashboard/ArchitectureDiagram";

// Dark mode hook
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setDark(false);
    }
  }, []);

  return { dark, toggle };
}

const LANGUAGES_FULL = [
  { code: "en", name: "English", status: "active" },
  { code: "hi", name: "Hindi", status: "active" },
  { code: "ta", name: "Tamil", status: "active" },
  { code: "te", name: "Telugu", status: "beta" },
  { code: "bn", name: "Bengali", status: "beta" },
  { code: "mr", name: "Marathi", status: "beta" },
  { code: "gu", name: "Gujarati", status: "planned" },
  { code: "kn", name: "Kannada", status: "planned" },
  { code: "ml", name: "Malayalam", status: "planned" },
  { code: "pa", name: "Punjabi", status: "planned" },
  { code: "or", name: "Odia", status: "planned" },
  { code: "as", name: "Assamese", status: "planned" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [seeded, setSeeded] = useState(false);
  const { dark, toggle: toggleDark } = useDarkMode();

  const seedQuestions = useMutation(api.questions.seedSampleQuestions);
  const seedTranslations = useMutation(api.translations.seedSampleTranslations);
  const seedEvaluations = useMutation(api.evaluations.seedSampleEvaluations);

  const questionStats = useQuery(api.questions.getStats);
  const translationStats = useQuery(api.translations.getStats);
  const feedbackStats = useQuery(api.feedback.getStats);

  useEffect(() => {
    if (!seeded) {
      setSeeded(true);
      seedQuestions().then((result) => {
        if (result?.seeded) {
          seedTranslations().then(() => seedEvaluations());
          toast.success("The archives have been populated.");
        }
      });
    }
  }, [seeded]);

  const stats = [
    {
      label: "Questions",
      value: questionStats?.total ?? 0,
      sub: `${questionStats?.validated ?? 0} validated`,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      label: "Translations",
      value: translationStats?.total ?? 0,
      sub: `${translationStats?.languages ?? 0} languages`,
      icon: Languages,
      color: "text-chart-2",
    },
    {
      label: "Avg BLEU",
      value: translationStats?.avgBleuScore ?? 0,
      sub: "Translation quality",
      icon: TrendingUp,
      color: "text-chart-3",
    },
    {
      label: "Reviews",
      value: feedbackStats?.total ?? 0,
      sub: `Avg ${feedbackStats?.avgRating ?? 0}/5`,
      icon: Users,
      color: "text-chart-4",
    },
  ];

  const navItems = [
    { icon: BarChart3, label: "The Gazette", sublabel: "Overview & Evaluation", tab: "overview" },
    { icon: BookOpen, label: "The Archives", sublabel: "Question Bank", tab: "questions" },
    { icon: Languages, label: "Rosetta Chamber", sublabel: "Translations", tab: "translations" },
    { icon: Feather, label: "The Scriptorium", sublabel: "Generate Questions", tab: "generate" },
    { icon: Scale, label: "The Blueprint", sublabel: "Architecture & Flow", tab: "architecture" },
  ];

  const currentNav = navItems.find((n) => n.tab === activeTab) ?? navItems[0];

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "'Libre Baskerville', serif" }}>
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0">
        <div className="p-5 border-b border-sidebar-border">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-primary text-lg">✦</span>
            <div>
              <h1 className="font-bold text-sm" style={{ fontFamily: "'Lora', serif" }}>भारतEval</h1>
              <p className="text-xs text-sidebar-foreground/60 italic">The Athenaeum</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-bold text-sidebar-foreground/50 uppercase tracking-widest mb-3 px-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            Chambers
          </p>
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-all rounded-sm group ${
                activeTab === item.tab
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold leading-tight">{item.label}</div>
                <div className="text-xs text-sidebar-foreground/55 italic leading-tight">{item.sublabel}</div>
              </div>
              {activeTab === item.tab && <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 opacity-60" />}
            </button>
          ))}
        </nav>

        {/* Stats mini in sidebar */}
        <div className="px-4 py-3 border-t border-sidebar-border space-y-2">
          <p className="text-xs text-sidebar-foreground/50 uppercase tracking-widest mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>At a Glance</p>
          <div className="grid grid-cols-2 gap-1.5">
            {stats.map((s) => (
              <div key={s.label} className="bg-sidebar-accent/40 px-2 py-1.5 rounded-sm">
                <div className="text-sm font-bold text-sidebar-foreground" style={{ fontFamily: "'Lora', serif" }}>{s.value}</div>
                <div className="text-[10px] text-sidebar-foreground/55 italic leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Language coverage mini */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 uppercase tracking-widest mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Languages</p>
          <div className="flex flex-wrap gap-1">
            {[
              { code: "EN", status: "active" },
              { code: "HI", status: "active" },
              { code: "TA", status: "active" },
              { code: "TE", status: "beta" },
              { code: "BN", status: "beta" },
              { code: "MR", status: "beta" },
            ].map((lang) => (
              <span
                key={lang.code}
                className={`text-[10px] px-1.5 py-0.5 border ${
                  lang.status === "active"
                    ? "border-primary/50 text-primary bg-primary/10"
                    : "border-sidebar-border text-sidebar-foreground/50"
                }`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {lang.code}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-sidebar-border space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs gap-2"
            onClick={toggleDark}
          >
            {dark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            {dark ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs"
            onClick={() => navigate("/")}
          >
            ← Return to Athenaeum
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <currentNav.icon className="w-4 h-4 text-primary" />
            <div>
              <h2 className="text-base font-bold leading-tight" style={{ fontFamily: "'Lora', serif" }}>{currentNav.label}</h2>
              <p className="text-xs text-muted-foreground italic leading-tight">{currentNav.sublabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Breadcrumb */}
            <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground italic">
              <span>भारतEval</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">{currentNav.label}</span>
            </span>
            <button
              onClick={toggleDark}
              className="p-1.5 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="p-8"
          >
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Overview header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary/50 text-xs">✦</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      The Athenaeum · Overview
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold" style={{ fontFamily: "'Lora', serif" }}>Bharat Evaluation Gazette</h3>
                  <p className="text-sm text-muted-foreground italic mt-1">
                    Live metrics, AI model benchmarks, and cross-lingual performance across Indian education.
                  </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="border border-border p-5 relative paper-lift bg-card"
                      style={{ boxShadow: "1px 2px 6px rgba(74,63,53,0.07)" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-muted-foreground italic">{stat.label}</span>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Lora', serif" }}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-1 italic">{stat.sub}</div>
                      <span className="absolute bottom-2 right-2 text-primary/10 text-xs">✦</span>
                    </motion.div>
                  ))}
                </div>

                {/* Language coverage */}
                <div className="border border-border p-5 bg-card" style={{ boxShadow: "1px 2px 6px rgba(74,63,53,0.06)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>Language Coverage</h3>
                    <span className="text-xs text-muted-foreground italic ml-auto">22 scheduled languages · 3 active</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES_FULL.map((lang) => (
                      <Badge
                        key={lang.code}
                        variant={lang.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {lang.status === "active" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {lang.status === "beta" && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {lang.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Evaluation dashboard */}
                <EvaluationDashboard />
              </div>
            )}

            {activeTab === "questions" && <QuestionBank />}
            {activeTab === "translations" && <TranslationPanel />}
            {activeTab === "generate" && <GenerateQuestion />}
            {activeTab === "architecture" && <ArchitectureDiagram />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}