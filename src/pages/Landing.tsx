import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRef, useEffect, useState } from "react";
import { ArrowRight, CheckCircle, BookOpen, Scale, Feather, Moon, Sun } from "lucide-react";

const LANGUAGES = ["हिंदी", "தமிழ்", "తెలుగు", "বাংলা", "मराठी", "ਪੰਜਾਬੀ", "ગુજરાતી", "ಕನ್ನಡ", "മലയാളം", "ଓଡ଼ିଆ", "অসমীয়া", "संस्कृत"];

const MARGINALIA = [
  { text: "First edition, 2024", pos: "top-32 left-4", rotate: "-rotate-90" },
  { text: "Verified by 147 scholars", pos: "top-64 right-4", rotate: "rotate-90" },
  { text: "Suitable for all Indian boards", pos: "top-96 left-4", rotate: "-rotate-90" },
  { text: "22 languages supported", pos: "bottom-64 right-4", rotate: "rotate-90" },
];

const FEATURES = [
  {
    icon: Feather,
    title: "The Scriptorium",
    subtitle: "Question Generation",
    desc: "Generate curriculum-aligned questions using LLMs fine-tuned on NCERT/SCERT content. Like a scholar's quill, writing with precision.",
  },
  {
    icon: BookOpen,
    title: "The Rosetta Chamber",
    subtitle: "Translation Engine",
    desc: "Semantic-preserving translation across 22 Indian languages with back-translation validation and difficulty calibration.",
  },
  {
    icon: Scale,
    title: "The Tribunal",
    subtitle: "AI Evaluation",
    desc: "Benchmark AI models with the BharatBench Score — a composite metric for accuracy, consistency, cultural fit, and bias.",
  },
];

const SUBJECTS = [
  { name: "Mathematics", symbol: "∑", count: "2,400+" },
  { name: "Physics", symbol: "⚛", count: "1,800+" },
  { name: "Chemistry", symbol: "⚗", count: "1,600+" },
  { name: "Biology", symbol: "⊕", count: "1,900+" },
  { name: "Social Science", symbol: "⊞", count: "2,100+" },
  { name: "Humanities", symbol: "✦", count: "1,500+" },
];

// Ink writing text animation
function InkText({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <span ref={ref} className="inline-block">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ delay: delay + i * 0.03, duration: 0.3 }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// Wax seal component
function WaxSeal({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 15 }}
      className="relative inline-flex items-center justify-center w-20 h-20 rounded-full"
      style={{
        background: "radial-gradient(circle at 35% 35%, #c0a080, #8d6e4c)",
        boxShadow: "2px 3px 8px rgba(74,63,53,0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
      }}
    >
      <span className="text-[9px] font-bold text-white text-center leading-tight px-2 uppercase tracking-wide" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {text}
      </span>
    </motion.div>
  );
}

// Ornamental divider
function OrnamentalDivider() {
  return (
    <div className="flex items-center gap-3 my-8">
      <div className="flex-1 h-px bg-border" />
      <span className="text-primary text-lg">✦</span>
      <span className="text-muted-foreground text-sm">✦</span>
      <span className="text-primary text-lg">✦</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

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

  return { dark, toggle };
}

export default function Landing() {
  const navigate = useNavigate();
  const { dark, toggle: toggleDark } = useDarkMode();
  const [currentLang, setCurrentLang] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLang((prev) => (prev + 1) % LANGUAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden" style={{ fontFamily: "'Libre Baskerville', serif" }}>
      {/* Paper texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Marginalia — side annotations */}
      {MARGINALIA.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 + i * 0.3 }}
          className={`fixed ${m.pos} ${m.rotate} hidden lg:block z-10`}
        >
          <span className="marginalia text-sm">{m.text}</span>
        </motion.div>
      ))}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-primary text-2xl">✦</span>
                <span className="font-bold text-lg" style={{ fontFamily: "'Lora', serif" }}>भारतEval</span>
              </motion.div>
              <div className="hidden sm:block w-px h-5 bg-border mx-1" />
              <span className="hidden sm:block text-sm text-muted-foreground italic">The Athenaeum</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-base text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors italic">Features</a>
              <a href="#subjects" className="hover:text-foreground transition-colors italic">Subjects</a>
              <a href="#gazette" className="hover:text-foreground transition-colors italic">Gazette</a>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDark}
                className="p-2 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={dark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Button size="sm" onClick={() => navigate("/dashboard")} className="text-sm px-4">
                Enter the Scriptorium <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero — The Athenaeum */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          {/* Ornamental frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative border-2 border-border p-10 md:p-16 text-center bg-card"
            style={{
              boxShadow: "0 0 0 6px var(--muted), 0 0 0 8px var(--border)",
            }}
          >
            {/* Corner ornaments */}
            {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
              <span key={i} className={`absolute ${pos} text-primary/40 text-xl leading-none`}>✦</span>
            ))}

            {/* Edition badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-6"
            >
              <span className="stamp text-sm">Edition I · Anno 2024</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-6xl md:text-8xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Lora', serif" }}
            >
              भारतEval
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="w-32 h-0.5 bg-primary mx-auto mb-6"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xl md:text-2xl text-muted-foreground italic mb-2"
              style={{ fontFamily: "'Lora', serif" }}
            >
              The Indian Curriculum Evaluation Standard
            </motion.p>

            {/* Rotating language display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center justify-center gap-3 mb-8 h-10"
            >
              <span className="text-base text-muted-foreground">Where</span>
              <motion.span
                key={currentLang}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-2xl font-bold text-primary"
                style={{ fontFamily: "'Lora', serif" }}
              >
                {LANGUAGES[currentLang]}
              </motion.span>
              <span className="text-base text-muted-foreground">meets one rigorous standard</span>
            </motion.div>

            {/* Wax seals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex items-center justify-center gap-6 mb-8"
            >
              <WaxSeal text="NCERT Aligned" delay={1.5} />
              <WaxSeal text="22 Languages" delay={1.7} />
              <WaxSeal text="Verified" delay={1.9} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                size="lg"
                className="px-10 text-base"
                onClick={() => navigate("/dashboard")}
              >
                Enter the Scriptorium
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="px-10 text-base italic" onClick={() => navigate("/dashboard")}>
                View the Gazette
              </Button>
            </motion.div>
          </motion.div>

          {/* Ink-written tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.3 }}
            className="text-center text-base text-muted-foreground italic mt-6"
          >
            <InkText text='"Benchmarking AI for Bharat — 250 million students, one standard of excellence"' delay={2.4} />
          </motion.p>
        </div>
      </section>

      <OrnamentalDivider />

      {/* Features — Three Pillars */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>The Three Chambers</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: "'Lora', serif" }}>Platform Architecture</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="paper-lift"
              >
                <div
                  className="border-2 border-border p-7 h-full relative bg-card"
                  style={{ boxShadow: "2px 3px 8px rgba(74,63,53,0.08)" }}
                >
                  {/* Roman numeral */}
                  <div className="text-sm text-muted-foreground/50 mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {["I.", "II.", "III."][i]}
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center mb-4 bg-primary/5">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-1" style={{ fontFamily: "'Lora', serif" }}>{f.title}</h3>
                  <p className="text-sm text-primary italic mb-3">{f.subtitle}</p>
                  <p className="text-base text-muted-foreground leading-relaxed">{f.desc}</p>
                  {/* Corner ornament */}
                  <span className="absolute bottom-3 right-3 text-primary/20 text-base">✦</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <OrnamentalDivider />

      {/* Metrics — like old ledger entries */}
      <section className="py-14 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "250M+", label: "Students Impacted", note: "across India" },
              { value: "22", label: "Indian Languages", note: "all scheduled" },
              { value: "11,300+", label: "Validated Questions", note: "NCERT aligned" },
              { value: "40+", label: "BLEU Score Avg", note: "translation quality" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2" style={{ fontFamily: "'Lora', serif" }}>{m.value}</div>
                <div className="text-base font-medium text-foreground">{m.label}</div>
                <div className="text-sm text-muted-foreground italic mt-1">{m.note}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <OrnamentalDivider />

      {/* Subjects — like library catalog */}
      <section id="subjects" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>The Library Catalog</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: "'Lora', serif" }}>NCERT-Aligned Subjects</h2>
            <p className="text-base text-muted-foreground italic mt-3">Classes VI through XII · All major boards</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {SUBJECTS.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="paper-lift"
              >
                <div
                  className="border border-border p-6 text-center relative bg-card"
                  style={{ boxShadow: "1px 2px 6px rgba(74,63,53,0.06)" }}
                >
                  <div className="text-4xl mb-3 text-primary/70">{s.symbol}</div>
                  <div className="font-semibold text-base" style={{ fontFamily: "'Lora', serif" }}>{s.name}</div>
                  <div className="text-sm text-muted-foreground mt-1 italic">{s.count} questions</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <OrnamentalDivider />

      {/* The Gazette — Leaderboard */}
      <section id="gazette" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Gazette masthead */}
            <div className="text-center mb-8">
              <div className="gazette-header mb-3">
                <h2 className="text-3xl font-bold tracking-widest uppercase" style={{ fontFamily: "'Lora', serif" }}>
                  The Bharat Evaluation Gazette
                </h2>
              </div>
              <p className="text-sm text-muted-foreground italic" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Official Record of AI Model Performance · Volume I, Issue 4 · 17 April 2024
              </p>
            </div>

            {/* Leaderboard table */}
            <div
              className="border-2 border-border overflow-hidden bg-card"
              style={{ boxShadow: "2px 3px 10px rgba(74,63,53,0.1)" }}
            >
              <div className="bg-muted/50 px-5 py-3 border-b border-border">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Class 10 Physics — Hindi Language Benchmark
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      {["Rank", "Model", "Score", "Consistency", "Bias", "Status"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-sm font-bold text-muted-foreground uppercase tracking-wide" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { rank: 1, model: "Sarvam-2.0", score: 84.3, consistency: "91%", bias: "0.02", status: "CERTIFIED", statusColor: "text-chart-3" },
                      { rank: 2, model: "GPT-4o", score: 79.7, consistency: "76%", bias: "0.04", status: "PROVISIONAL", statusColor: "text-chart-4" },
                      { rank: 3, model: "Llama-3-70B", score: 76.2, consistency: "82%", bias: "0.03", status: "PROVISIONAL", statusColor: "text-chart-4" },
                      { rank: 4, model: "Mitra-1.5", score: 71.8, consistency: "68%", bias: "0.07", status: "REVIEW", statusColor: "text-destructive" },
                      { rank: 5, model: "OpenAI-o1", score: 69.4, consistency: "71%", bias: "0.05", status: "REVIEW", statusColor: "text-destructive" },
                    ].map((row, i) => (
                      <motion.tr
                        key={row.rank}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-5 py-4 font-bold text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{row.rank}</td>
                        <td className="px-5 py-4 font-semibold text-base" style={{ fontFamily: "'Lora', serif" }}>{row.model}</td>
                        <td className="px-5 py-4 font-bold text-primary text-lg" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{row.score}</td>
                        <td className="px-5 py-4 text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{row.consistency}</td>
                        <td className="px-5 py-4 text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{row.bias}</td>
                        <td className="px-5 py-4">
                          <span className={`stamp text-xs ${row.statusColor}`} style={{ borderColor: "currentColor" }}>
                            {row.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <OrnamentalDivider />

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-6">
              <WaxSeal text="BharatEval Authority" delay={0.2} />
            </div>
            <h2 className="text-4xl font-bold mb-5" style={{ fontFamily: "'Lora', serif" }}>
              Ready to Evaluate AI for Bharat?
            </h2>
            <p className="text-muted-foreground italic mb-10 text-lg leading-relaxed">
              Join researchers, educators, and ed-tech companies building equitable AI<br />
              for India's 250M+ students across all 22 scheduled languages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Button
                size="lg"
                className="px-10 text-base"
                onClick={() => navigate("/dashboard")}
              >
                Enter the Scriptorium
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="px-10 text-base italic">
                Read the Prospectus
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground italic">
              {["Free to use", "Open source", "NCERT aligned"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg">✦</span>
              <span className="font-bold text-base" style={{ fontFamily: "'Lora', serif" }}>भारतEval</span>
              <span className="text-muted-foreground text-sm italic">· The Athenaeum</span>
            </div>
            <div className="text-center">
              <div className="stamp text-xs">Department of Educational Standards · Est. 2024</div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Built for Bharat's 250M+ students
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}