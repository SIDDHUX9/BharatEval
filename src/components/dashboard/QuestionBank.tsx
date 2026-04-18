import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BookOpen, CheckCircle, Download, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const SUBJECT_LABELS: Record<string, string> = {
  mathematics: "Mathematics",
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  social_science: "Social Science",
  humanities: "Humanities",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-chart-3",
  medium: "text-chart-4",
  hard: "text-destructive",
};

const TYPE_LABELS: Record<string, string> = {
  mcq: "MCQ",
  numerical: "Numerical",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
  case_study: "Case Study",
};

const LANG_LABELS: Record<string, string> = {
  en: "English",
  hi: "हिन्दी (Hindi)",
  ta: "தமிழ் (Tamil)",
};

const GRADE_LABELS: Record<string, string> = {
  class_6: "Class VI",
  class_7: "Class VII",
  class_8: "Class VIII",
  class_9: "Class IX",
  class_10: "Class X",
  class_11: "Class XI",
  class_12: "Class XII",
};

type GeneratedQuestion = {
  questionNumber: number;
  questionType: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
};

export function exportToCSV(questions: any[], translations: any[]) {
  const rows = questions.map((q) => {
    const hiTrans = translations.find((t) => t.questionId === q._id && t.language === "hi");
    const taTrans = translations.find((t) => t.questionId === q._id && t.language === "ta");
    return {
      question_id: q._id,
      subject: q.subject,
      topic: q.topic,
      grade_level: q.gradeLevel,
      difficulty: q.difficulty,
      blooms_level: q.bloomsLevel,
      question_type: q.questionType,
      content_english: q.contentEnglish,
      options: q.options ? q.options.join(" | ") : "",
      correct_answer: q.correctAnswer ?? "",
      explanation: q.explanation ?? "",
      content_hindi: hiTrans?.translatedContent ?? "",
      bleu_score_hi: hiTrans?.bleuScore ?? "",
      semantic_score_hi: hiTrans?.semanticScore ?? "",
      content_tamil: taTrans?.translatedContent ?? "",
      bleu_score_ta: taTrans?.bleuScore ?? "",
      semantic_score_ta: taTrans?.semanticScore ?? "",
      is_validated: q.isValidated ? "true" : "false",
      tags: q.tags ? q.tags.join(", ") : "",
    };
  });

  const headers = Object.keys(rows[0] || {});
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = String((row as any)[h] ?? "").replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bharateval_questions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function QuestionBank() {
  const [subject, setSubject] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  // Generate panel state
  const [showGenPanel, setShowGenPanel] = useState(false);
  const [genGrade, setGenGrade] = useState("class_10");
  const [genSubject, setGenSubject] = useState("mathematics");
  const [genLang, setGenLang] = useState("en");
  const [genDifficulty, setGenDifficulty] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const questions = useQuery(api.questions.list, {
    subject: subject !== "all" ? subject : undefined,
    difficulty: difficulty !== "all" ? difficulty : undefined,
    limit: 50,
  });

  const allQuestions = useQuery(api.questions.list, { limit: 1000 });
  const allTranslations = useQuery(api.translations.getAll);
  const generateBulk = useAction(api.ai.generateBulkQuestions);
  const createMany = useMutation(api.questions.createMany);

  const handleExport = () => {
    if (!allQuestions || allQuestions.length === 0) {
      toast.error("No questions to export.");
      return;
    }
    exportToCSV(allQuestions, allTranslations ?? []);
    toast.success(`Exported ${allQuestions.length} questions as CSV.`);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedQuestions([]);
    setShowAnswers({});
    try {
      const result = await generateBulk({
        gradeLevel: genGrade,
        subject: genSubject,
        language: genLang,
        difficulty: genDifficulty,
      });
      setGeneratedQuestions(result as GeneratedQuestion[]);
      toast.success("5 questions generated!");
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed. Check your AI API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToBank = async () => {
    if (generatedQuestions.length === 0) return;
    setIsSaving(true);
    try {
      const toSave = generatedQuestions.map((q) => ({
        subject: genSubject,
        topic: SUBJECT_LABELS[genSubject] ?? genSubject,
        questionType: q.questionType,
        difficulty: genDifficulty,
        bloomsLevel: "apply",
        gradeLevel: genGrade,
        contentEnglish: q.content,
        options: q.options && q.options.length > 0 ? q.options : undefined,
        correctAnswer: q.correctAnswer || undefined,
        explanation: q.explanation || undefined,
        tags: [genSubject, genDifficulty, genLang],
      }));
      const res = await createMany({ questions: toSave });
      toast.success(`Saved ${res.count} questions to the bank!`);
      setGeneratedQuestions([]);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save questions.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAnswer = (idx: number) => {
    setShowAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div style={{ fontFamily: "'Libre Baskerville', serif" }}>
      {/* Archives header */}
      <div className="text-center border-b-2 border-t-2 border-border py-3 mb-6" style={{ borderStyle: "double" }}>
        <h2 className="text-lg font-bold tracking-widest uppercase" style={{ fontFamily: "'Lora', serif" }}>
          The Archives
        </h2>
        <p className="text-xs text-muted-foreground italic mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          NCERT-Aligned Question Bank · Classes VI–XII
        </p>
      </div>

      {/* Generate 5 Questions Panel Toggle */}
      <div className="mb-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowGenPanel(!showGenPanel); setGeneratedQuestions([]); }}
          className="gap-2 text-xs h-8 border-primary/40 text-primary hover:bg-primary/5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate 5 Questions with AI
          {showGenPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      {/* Generate Panel */}
      <AnimatePresence>
        {showGenPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div
              className="border border-primary/20 p-5 space-y-5"
              style={{ background: "#fffcf5", boxShadow: "1px 2px 8px rgba(74,63,53,0.08)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-wide" style={{ fontFamily: "'Lora', serif" }}>
                    ✦ AI Exam Question Generator
                  </h3>
                  <p className="text-xs text-muted-foreground italic mt-0.5">
                    Generate 5 exam-style questions in your chosen language
                  </p>
                </div>
                <button onClick={() => setShowGenPanel(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Class</label>
                  <Select value={genGrade} onValueChange={setGenGrade}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GRADE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Subject</label>
                  <Select value={genSubject} onValueChange={setGenSubject}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SUBJECT_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Language</label>
                  <Select value={genLang} onValueChange={setGenLang}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LANG_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Difficulty</label>
                  <Select value={genDifficulty} onValueChange={setGenDifficulty}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy" className="text-xs">Easy</SelectItem>
                      <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                      <SelectItem value="hard" className="text-xs">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2 text-xs"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate 5 Questions
                  </>
                )}
              </Button>

              {/* Generated Questions Display */}
              <AnimatePresence>
                {generatedQuestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Exam header */}
                    <div className="text-center border-b border-t border-border py-3" style={{ borderStyle: "double" }}>
                      <p className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {SUBJECT_LABELS[genSubject]} · {GRADE_LABELS[genGrade]} · {LANG_LABELS[genLang]} · {genDifficulty.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground italic mt-0.5">
                        NCERT-Aligned Examination · BharatEval Framework
                      </p>
                    </div>

                    {generatedQuestions.map((q, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="border border-border p-4 space-y-2"
                        style={{ background: "#fffdf7" }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                Q{q.questionNumber}.
                              </span>
                              <span className="text-xs text-muted-foreground italic">
                                [{TYPE_LABELS[q.questionType] ?? q.questionType}]
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                [{q.marks} {q.marks === 1 ? "mark" : "marks"}]
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}>
                              {q.content}
                            </p>
                          </div>
                        </div>

                        {/* MCQ Options */}
                        {q.options && q.options.length > 0 && (
                          <div className="space-y-1 mt-2 ml-4">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2 text-xs text-foreground/80">
                                <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                  ({String.fromCharCode(97 + oi)})
                                </span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Show/Hide Answer */}
                        <button
                          onClick={() => toggleAnswer(idx)}
                          className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary mt-2 italic"
                        >
                          {showAnswers[idx] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {showAnswers[idx] ? "Hide Answer" : "Show Answer"}
                        </button>

                        <AnimatePresence>
                          {showAnswers[idx] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 p-3 border border-chart-3/20 bg-chart-3/5 space-y-1">
                                <p className="text-xs font-semibold text-chart-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                  ✓ Answer:
                                </p>
                                <p className="text-xs text-foreground/80">{q.correctAnswer}</p>
                                {q.explanation && (
                                  <>
                                    <p className="text-xs font-semibold text-muted-foreground mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                                      Explanation:
                                    </p>
                                    <p className="text-xs text-muted-foreground italic">{q.explanation}</p>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}

                    {/* Save to bank */}
                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSaveToBank}
                        disabled={isSaving}
                        className="text-xs gap-1.5 h-8"
                      >
                        {isSaving ? "Saving…" : "Save All to Question Bank"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-sm text-muted-foreground italic">{questions?.length ?? 0} questions found</p>
        <div className="flex gap-3 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="text-xs gap-1.5 h-8"
          >
            <Download className="w-3 h-3" />
            Export CSV ({allQuestions?.length ?? 0} questions)
          </Button>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-40 text-xs h-8">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {Object.entries(SUBJECT_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-32 text-xs h-8">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {questions?.map((q, i) => (
          <motion.div
            key={q._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="paper-lift"
          >
            <div
              className="border border-border p-5 relative bg-card"
              style={{ boxShadow: "1px 2px 6px rgba(74,63,53,0.06)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-muted-foreground italic" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {SUBJECT_LABELS[q.subject] ?? q.subject}
                    </span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className={`text-xs font-medium capitalize ${DIFFICULTY_COLORS[q.difficulty] ?? ""}`}>
                      {q.difficulty}
                    </span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-xs text-muted-foreground italic">
                      {TYPE_LABELS[q.questionType] ?? q.questionType}
                    </span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-xs text-muted-foreground italic">{q.gradeLevel?.replace("_", " ")}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}>
                    {q.contentEnglish}
                  </p>
                  {q.options && (
                    <div className="mt-3 space-y-1">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`text-xs px-3 py-1.5 border flex items-center gap-2 ${
                            opt === q.correctAnswer
                              ? "border-chart-3/40 bg-chart-3/5 text-chart-3"
                              : "border-border bg-muted/20 text-muted-foreground"
                          }`}
                        >
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{String.fromCharCode(65 + idx)}.</span>
                          <span>{opt}</span>
                          {opt === q.correctAnswer && <CheckCircle className="w-3 h-3 ml-auto" />}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.tags && q.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {q.tags.map((tag) => (
                        <span key={tag} className="text-xs text-muted-foreground italic">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {q.isValidated ? (
                    <span className="stamp text-[9px] text-chart-3" style={{ borderColor: "currentColor" }}>VERIFIED</span>
                  ) : (
                    <span className="stamp text-[9px] text-muted-foreground" style={{ borderColor: "currentColor" }}>PENDING</span>
                  )}
                  <span className="text-xs text-muted-foreground italic capitalize" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {q.bloomsLevel}
                  </span>
                </div>
              </div>
              <span className="absolute bottom-2 right-2 text-primary/10 text-xs">✦</span>
            </div>
          </motion.div>
        ))}
        {questions?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="italic text-sm">No questions found in the archives for the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}