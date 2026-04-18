import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, TrendingUp, Languages, Loader2, Sparkles, Type } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
};

// Free-text translation result type
interface FreeTranslationResult {
  translatedContent: string;
  bleuScore: number | null;
  semanticScore: number | null;
  language: string;
}

export default function TranslationPanel() {
  const stats = useQuery(api.translations.getStats);
  const questions = useQuery(api.questions.list, { limit: 20 });
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [selectedLang, setSelectedLang] = useState("hi");
  const [isTranslating, setIsTranslating] = useState(false);
  const translateQuestion = useAction(api.ai.translateQuestion);

  // Free-text translation state
  const [freeText, setFreeText] = useState("");
  const [freeLang, setFreeLang] = useState("hi");
  const [isFreeTranslating, setIsFreeTranslating] = useState(false);
  const [freeResult, setFreeResult] = useState<FreeTranslationResult | null>(null);
  const translateFreeText = useAction(api.ai.translateFreeText);

  const hiTranslations = useQuery(api.translations.getByLanguage, { language: "hi", limit: 10 });
  const taTranslations = useQuery(api.translations.getByLanguage, { language: "ta", limit: 10 });

  const handleTranslate = async () => {
    if (!selectedQuestion) {
      toast.error("Please select a question to translate.");
      return;
    }
    const question = questions?.find((q) => q._id === selectedQuestion);
    if (!question) return;

    setIsTranslating(true);
    try {
      const result = await translateQuestion({
        questionId: question._id,
        targetLanguage: selectedLang,
        contentEnglish: question.contentEnglish,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });
      if (result && result.success) {
        toast.success(
          "Translated to " + (LANGUAGE_NAMES[selectedLang] ?? selectedLang) +
          (result.bleuScore != null ? ". BLEU: " + result.bleuScore : "") +
          (result.semanticScore != null ? ", Semantic: " + result.semanticScore : "")
        );
      } else {
        toast.error("Translation failed. Please try again.");
      }
    } catch (err: any) {
      toast.error("Translation failed: " + (err?.message || "Please try again."));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFreeTranslate = async () => {
    if (!freeText.trim()) {
      toast.error("Please enter some text to translate.");
      return;
    }
    setIsFreeTranslating(true);
    setFreeResult(null);
    try {
      const result = await translateFreeText({
        text: freeText.trim(),
        targetLanguage: freeLang,
      });
      setFreeResult({
        translatedContent: result.translatedContent,
        bleuScore: result.bleuScore ?? null,
        semanticScore: result.semanticScore ?? null,
        language: freeLang,
      });
      toast.success("Translated to " + (LANGUAGE_NAMES[freeLang] ?? freeLang));
    } catch (err: any) {
      toast.error("Translation failed: " + (err?.message || "Please try again."));
    } finally {
      setIsFreeTranslating(false);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Libre Baskerville', serif" }}>
      {/* Rosetta Chamber header */}
      <div className="text-center border-b-2 border-t-2 border-border py-3 mb-6" style={{ borderStyle: "double" }}>
        <h2 className="text-lg font-bold tracking-widest uppercase" style={{ fontFamily: "'Lora', serif" }}>
          The Rosetta Chamber
        </h2>
        <p className="text-sm text-muted-foreground italic mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          Semantic-Preserving Translation Across 22 Indian Languages
        </p>
      </div>

      {/* Free-Text Translation Tool */}
      <div className="border-2 border-border overflow-hidden bg-card" style={{ boxShadow: "2px 3px 10px rgba(74,63,53,0.08)" }}>
        <div className="bg-muted/40 px-5 py-3 border-b border-border flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>Free-Text Translation</h3>
          <span className="text-sm text-muted-foreground italic ml-auto">Translate any text outside the question bank</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="text-sm italic text-muted-foreground mb-1 block">Text to Translate (English)</label>
              <Textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Enter any text, sentence, or question to translate..."
                className="text-sm min-h-[80px] resize-none"
                style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
              />
            </div>
            <div>
              <label className="text-sm italic text-muted-foreground mb-1 block">Target Language</label>
              <Select value={freeLang} onValueChange={setFreeLang}>
                <SelectTrigger className="text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGE_NAMES).filter(([k]) => k !== "en").map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-sm">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleFreeTranslate}
                disabled={isFreeTranslating || !freeText.trim()}
                className="w-full mt-3"
                size="sm"
              >
                {isFreeTranslating ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" />Translating...</span>
                ) : (
                  <span className="flex items-center gap-2"><Languages className="w-3 h-3" />Translate</span>
                )}
              </Button>
            </div>
          </div>

          {/* Free translation result */}
          {freeResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border p-4 mt-2 bg-muted/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">{LANGUAGE_NAMES[freeResult.language] ?? freeResult.language}</Badge>
                <span className="text-sm text-muted-foreground italic" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Translation Result</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground" style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}>
                {freeResult.translatedContent}
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {freeResult.bleuScore != null && (
                  <span className="text-sm text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    BLEU: <span className="font-medium text-foreground">{freeResult.bleuScore}</span>
                  </span>
                )}
                {freeResult.semanticScore != null && (
                  <span className="text-sm text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Semantic: <span className="font-medium text-foreground">{freeResult.semanticScore}</span>
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* AI Translation Tool (Question Bank) */}
      <div className="border-2 border-border overflow-hidden bg-card" style={{ boxShadow: "2px 3px 10px rgba(74,63,53,0.08)" }}>
        <div className="bg-muted/40 px-5 py-3 border-b border-border flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>Question Bank Translation</h3>
          <span className="text-sm text-muted-foreground italic ml-auto">Translate & save to archives</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-sm italic text-muted-foreground mb-1 block">Select Question</label>
              <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
                <SelectTrigger className="text-sm h-9">
                  <SelectValue placeholder="Choose a question to translate..." />
                </SelectTrigger>
                <SelectContent>
                  {questions?.map((q) => (
                    <SelectItem key={q._id} value={q._id} className="text-sm">
                      <span className="truncate">{q.contentEnglish.slice(0, 60)}...</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm italic text-muted-foreground mb-1 block">Target Language</label>
              <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger className="text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGE_NAMES).filter(([k]) => k !== "en").map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-sm">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleTranslate} disabled={isTranslating || !selectedQuestion} className="w-full sm:w-auto">
            {isTranslating ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Translating...</span>
            ) : (
              <span className="flex items-center gap-2"><Languages className="w-4 h-4" />Translate with AI</span>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Languages, value: stats?.total ?? 0, label: "Total Translations", color: "text-primary" },
          { icon: CheckCircle, value: stats?.validated ?? 0, label: "Validated", color: "text-chart-3" },
          { icon: TrendingUp, value: stats?.avgBleuScore ?? 0, label: "Avg BLEU Score", color: "text-chart-2" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="border border-border p-5 relative paper-lift bg-card" style={{ boxShadow: "1px 2px 6px rgba(74,63,53,0.06)" }}>
              <div className="flex items-center gap-3">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <div>
                  <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Lora', serif" }}>{s.value}</div>
                  <div className="text-sm text-muted-foreground italic">{s.label}</div>
                </div>
              </div>
              <span className="absolute bottom-2 right-2 text-primary/15 text-xs">✦</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Language Coverage */}
      <div className="border-2 border-border overflow-hidden bg-card" style={{ boxShadow: "2px 3px 10px rgba(74,63,53,0.08)" }}>
        <div className="bg-muted/40 px-5 py-3 border-b border-border">
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>Language Coverage</h3>
          <p className="text-sm text-muted-foreground italic">The question refracted through each language</p>
        </div>
        <div className="p-5 space-y-3">
          {stats?.byLanguage?.map((lang) => (
            <div key={lang.language} className="flex items-center gap-3">
              <span className="text-sm w-28 text-muted-foreground italic">{LANGUAGE_NAMES[lang.language] ?? lang.language}</span>
              <Progress value={(lang.count / (stats.total || 1)) * 100} className="flex-1 h-1.5" />
              <span className="text-sm font-medium w-8 text-right text-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{lang.count}</span>
            </div>
          ))}
          {(!stats?.byLanguage || stats.byLanguage.length === 0) && (
            <p className="text-sm text-muted-foreground italic text-center py-4">No translation data yet. Use the AI Translation Engine above.</p>
          )}
        </div>
      </div>

      {/* Hindi Translations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="default" className="text-xs">हिंदी</Badge>
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>Hindi Translations</h3>
        </div>
        <div className="space-y-2">
          {hiTranslations?.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="border border-border p-4 relative paper-lift bg-card" style={{ boxShadow: "1px 2px 4px rgba(74,63,53,0.05)" }}>
                <p className="text-sm mb-2 text-foreground" style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}>{t.translatedContent}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {t.bleuScore != null && (
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      BLEU: <span className="font-medium text-foreground">{t.bleuScore}</span>
                    </span>
                  )}
                  {t.semanticScore != null && (
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      Semantic: <span className="font-medium text-foreground">{t.semanticScore}</span>
                    </span>
                  )}
                  {t.isValidated && <span className="stamp text-[9px] text-chart-3" style={{ borderColor: "currentColor" }}>VALIDATED</span>}
                </div>
              </div>
            </motion.div>
          ))}
          {hiTranslations?.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-6">No Hindi translations yet. Use the AI Translation Engine above.</p>
          )}
        </div>
      </div>

      {/* Tamil Translations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">தமிழ்</Badge>
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Lora', serif" }}>Tamil Translations</h3>
        </div>
        <div className="space-y-2">
          {taTranslations?.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="border border-border p-4 relative paper-lift bg-card" style={{ boxShadow: "1px 2px 4px rgba(74,63,53,0.05)" }}>
                <p className="text-sm mb-2 text-foreground" style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}>{t.translatedContent}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {t.bleuScore != null && (
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      BLEU: <span className="font-medium text-foreground">{t.bleuScore}</span>
                    </span>
                  )}
                  {t.semanticScore != null && (
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      Semantic: <span className="font-medium text-foreground">{t.semanticScore}</span>
                    </span>
                  )}
                  {t.isValidated && <span className="stamp text-[9px] text-chart-3" style={{ borderColor: "currentColor" }}>VALIDATED</span>}
                </div>
              </div>
            </motion.div>
          ))}
          {taTranslations?.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-6">No Tamil translations yet. Use the AI Translation Engine above.</p>
          )}
        </div>
      </div>
    </div>
  );
}