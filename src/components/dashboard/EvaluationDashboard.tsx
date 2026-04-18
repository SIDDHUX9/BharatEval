import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, Globe, TrendingUp, Zap, Play, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
};

const STATUS_STYLES: Record<number, { label: string; color: string }> = {
  0: { label: "CERTIFIED", color: "text-chart-3" },
  1: { label: "PROVISIONAL", color: "text-chart-4" },
  2: { label: "PROVISIONAL", color: "text-chart-4" },
  3: { label: "REVIEW", color: "text-destructive" },
};

const AVAILABLE_MODELS = ["gpt-4o-mini", "gpt-4o"];
const AVAILABLE_LANGUAGES = ["en", "hi", "ta"];

export default function EvaluationDashboard() {
  const modelStats = useQuery(api.evaluations.getModelStats);
  const languageStats = useQuery(api.evaluations.getLanguageStats);
  const sessions = useQuery(api.evaluations.getSessions);
  const bharatBench = useQuery(api.evaluations.getBharatBenchScore);
  const questions = useQuery(api.questions.list, { limit: 10 });

  const createSession = useMutation(api.evaluations.createSession);
  const runSession = useAction(api.ai.runEvaluationSession);

  const [isRunning, setIsRunning] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4o-mini"]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["en", "hi"]);

  const handleRunEvaluation = async () => {
    if (!questions || questions.length === 0) {
      toast.error("No questions available. Please add questions first.");
      return;
    }
    setIsRunning(true);
    try {
      const sessionId = await createSession({
        name: `Evaluation Run — ${new Date().toLocaleDateString("en-IN")}`,
        description: `Automated evaluation across ${selectedModels.join(", ")} in ${selectedLangs.map((l) => LANGUAGE_NAMES[l] ?? l).join(", ")}`,
        models: selectedModels,
        languages: selectedLangs,
        subjects: ["all"],
      });

      toast.info("Evaluation session started. This may take a few minutes...");

      await runSession({
        sessionId,
        questionIds: questions.slice(0, 5).map((q) => q._id),
        models: selectedModels,
        languages: selectedLangs,
      });

      toast.success("Evaluation complete! Results updated.");
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("integration") || msg.includes("key") || msg.includes("401") || msg.includes("unauthorized") || msg.includes("VLY")) {
        toast.error("AI service not configured. Please set VLY_INTEGRATION_KEY in the API Keys (Backend) tab.");
      } else {
        toast.error("Evaluation failed: " + (msg || "Please try again."));
      }
    } finally {
      setIsRunning(false);
    }
  };

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const toggleLang = (lang: string) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Libre Baskerville', serif" }}>
      {/* Gazette masthead */}
      <div className="text-center border-b-2 border-t-2 border-border py-3 mb-6" style={{ borderStyle: "double" }}>
        <h2 className="text-lg font-bold tracking-widest uppercase" style={{ fontFamily: "'Lora', serif" }}>
          The Bharat Evaluation Gazette
        </h2>
        <p className="text-xs text-muted-foreground italic mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Official Record of AI Model Performance in Indian Education
        </p>
      </div>

      {/* Run Evaluation */}
      <div className="border-2 border-border overflow-hidden bg-card" style={{ boxShadow: "2px 3px 10px rgba(74,63,53,0.08)" }}>
        <div className="bg-muted/40 px-5 py-3 border-b border-border flex items-center gap-2">
          <Play className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>Run New Evaluation</h3>
          <span className="text-xs text-muted-foreground italic ml-auto">Live AI benchmarking</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs italic text-muted-foreground mb-2 block">Models to Evaluate</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model}
                    onClick={() => toggleModel(model)}
                    className={`text-xs px-3 py-1.5 border transition-colors ${
                      selectedModels.includes(model)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs italic text-muted-foreground mb-2 block">Languages</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => toggleLang(lang)}
                    className={`text-xs px-3 py-1.5 border transition-colors ${
                      selectedLangs.includes(lang)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {LANGUAGE_NAMES[lang] ?? lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button
            onClick={handleRunEvaluation}
            disabled={isRunning || selectedModels.length === 0 || selectedLangs.length === 0}
            className="w-full sm:w-auto"
          >
            {isRunning ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Running Evaluation...</span>
            ) : (
              <span className="flex items-center gap-2"><Play className="w-4 h-4" />Run Evaluation (5 questions)</span>
            )}
          </Button>
          <p className="text-xs text-muted-foreground italic">Evaluates the first 5 questions from the archive across selected models and languages.</p>
        </div>
      </div>

      {/* Model Performance — The Bench */}
      <div className="border-2 border-border overflow-hidden" style={{ background: "#fffcf5", boxShadow: "2px 3px 10px rgba(74,63,53,0.08)" }}>
        <div className="bg-muted/40 px-5 py-3 border-b border-border flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>The Bench of Evaluation</h3>
          <span className="text-xs text-muted-foreground italic ml-auto">Model Performance Comparison</span>
        </div>
        <div className="p-5 space-y-4">
          {modelStats?.map((model, i) => {
            const statusInfo = STATUS_STYLES[i] ?? { label: "REVIEW", color: "text-destructive" };
            return (
              <motion.div key={model.model} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}.</span>
                    <span className="text-sm font-semibold" style={{ fontFamily: "'Lora', serif" }}>{model.model}</span>
                    <span className="text-xs text-muted-foreground italic">{model.total} evaluations</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{model.avgLatencyMs}ms</span>
                    <span className={`stamp text-[10px] ${statusInfo.color}`} style={{ borderColor: "currentColor" }}>{statusInfo.label}</span>
                    <span className="text-sm font-bold text-primary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{model.accuracy}%</span>
                  </div>
                </div>
                <Progress value={model.accuracy} className="h-1.5" />
              </motion.div>
            );
          })}
          {(!modelStats || modelStats.length === 0) && (
            <p className="text-sm text-muted-foreground italic text-center py-6">
              No evaluation data yet. Run an evaluation above to populate results.
            </p>
          )}
        </div>
      </div>

      {/* Cross-Lingual Performance */}
      <div className="border-2 border-border overflow-hidden bg-card" style={{ boxShadow: "2px 3px 10px rgba(74,63,53,0.08)" }}>
        <div className="bg-muted/40 px-5 py-3 border-b border-border flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>Cross-Lingual Performance</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {languageStats?.map((lang, i) => (
              <motion.div key={lang.language} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center p-4 border border-border bg-muted/20">
                <div className="text-2xl font-bold text-primary mb-1" style={{ fontFamily: "'Lora', serif" }}>{lang.accuracy}%</div>
                <div className="text-sm text-foreground font-medium">{LANGUAGE_NAMES[lang.language] ?? lang.language}</div>
                <div className="text-xs text-muted-foreground italic">{lang.total} evaluations</div>
                <Progress value={lang.accuracy} className="h-1 mt-2" />
              </motion.div>
            ))}
            {(!languageStats || languageStats.length === 0) && (
              <div className="col-span-3 text-center py-6 text-muted-foreground italic text-sm">
                No language evaluation data yet. Run an evaluation to see cross-lingual metrics.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BharatBench Score — computed from real data */}
      <div className="border-2 border-border overflow-hidden bg-card" style={{ boxShadow: "2px 3px 10px rgba(74,63,53,0.08)" }}>
        <div className="bg-muted/40 px-5 py-3 border-b border-border flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>BharatBench Score™</h3>
          <span className="text-xs text-muted-foreground italic ml-auto">Composite Evaluation Metric</span>
        </div>
        <div className="p-5">
          {bharatBench ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Accuracy", value: bharatBench.accuracy, desc: "Cross-language avg" },
                { label: "Consistency", value: bharatBench.consistency, desc: "< 15% lang gap" },
                { label: "Cultural Fit", value: bharatBench.culturalFit, desc: "Non-English perf" },
                { label: "Bias Index", value: bharatBench.biasIndex, desc: "Low gap = high score" },
              ].map((metric, i) => (
                <motion.div key={metric.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="text-center p-4 border border-border bg-background">
                  <div className="text-3xl font-bold text-primary" style={{ fontFamily: "'Lora', serif" }}>{metric.value}</div>
                  <div className="text-xs font-bold mt-1 uppercase tracking-wide" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{metric.label}</div>
                  <div className="text-xs text-muted-foreground italic mt-0.5">{metric.desc}</div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-6">
              BharatBench score will appear after running evaluations.
            </p>
          )}
        </div>
      </div>

      {/* Evaluation Sessions — from real DB */}
      <div className="border-2 border-border overflow-hidden bg-card" style={{ boxShadow: "2px 3px 10px rgba(74,63,53,0.08)" }}>
        <div className="bg-muted/40 px-5 py-3 border-b border-border flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>The Docket</h3>
          <span className="text-xs text-muted-foreground italic ml-auto">Recent Evaluation Sessions</span>
        </div>
        <div className="p-5 space-y-3">
          {sessions && sessions.length > 0 ? (
            sessions.slice(0, 5).map((session, i) => (
              <div key={session._id} className="flex items-start justify-between p-3 border border-border bg-muted/10">
                <div>
                  <p className="text-xs text-muted-foreground italic mb-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Case #{session._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm font-semibold" style={{ fontFamily: "'Lora', serif" }}>{session.name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {session.models.map((m) => (
                      <span key={m} className="text-xs text-muted-foreground">{m}</span>
                    ))}
                    <span className="text-xs text-muted-foreground">·</span>
                    {session.languages.map((l) => (
                      <span key={l} className="text-xs text-muted-foreground">{LANGUAGE_NAMES[l] ?? l}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {session.totalQuestions && (
                    <span className="text-xs text-muted-foreground italic">{session.totalQuestions} Q</span>
                  )}
                  <span
                    className={`stamp text-[10px] ${
                      session.status === "completed" ? "text-chart-3" : session.status === "running" ? "text-chart-4" : "text-muted-foreground"
                    }`}
                    style={{ borderColor: "currentColor" }}
                  >
                    {session.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-6">
              No evaluation sessions yet. Run your first evaluation above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}