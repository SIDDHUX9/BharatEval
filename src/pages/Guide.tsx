import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Code2,
  Database,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Play,
  Terminal,
  Trophy,
  Upload,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-border" style={{ borderStyle: "double" }}>
        <div className="w-9 h-9 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/5">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Lora', serif" }}>{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {num}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-base mb-2" style={{ fontFamily: "'Lora', serif" }}>{title}</h3>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function CodeBlock({ children, lang = "bash" }: { children: string; lang?: string }) {
  return (
    <div className="my-3 rounded-none border border-border overflow-hidden">
      <div className="bg-muted/60 px-3 py-1.5 border-b border-border flex items-center gap-2">
        <Terminal className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{lang}</span>
      </div>
      <pre className="p-4 text-xs overflow-x-auto bg-muted/20" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function InfoBox({ type, children }: { type: "info" | "warning" | "success"; children: React.ReactNode }) {
  const styles = {
    info: { bg: "bg-blue-50 dark:bg-blue-950/20", border: "border-blue-200 dark:border-blue-800", icon: Info, color: "text-blue-600 dark:text-blue-400" },
    warning: { bg: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-800", icon: AlertCircle, color: "text-amber-600 dark:text-amber-400" },
    success: { bg: "bg-green-50 dark:bg-green-950/20", border: "border-green-200 dark:border-green-800", icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
  };
  const s = styles[type];
  return (
    <div className={`flex gap-3 p-4 border ${s.bg} ${s.border} my-4`}>
      <s.icon className={`w-4 h-4 mt-0.5 shrink-0 ${s.color}`} />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "dataset", label: "Step 1: Get the Dataset" },
  { id: "kaggle-setup", label: "Step 2: Kaggle Setup" },
  { id: "notebook", label: "Step 3: Create Notebook" },
  { id: "train-model", label: "Step 4: Train the Model" },
  { id: "evaluate", label: "Step 5: Evaluate & Submit" },
  { id: "advanced", label: "Advanced: Fine-tuning LLMs" },
  { id: "tips", label: "Tips & Tricks" },
];

export default function GuidePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Libre Baskerville', serif" }}>
      {/* Paper texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")` }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 text-xs">
              <ArrowLeft className="w-3 h-3" /> भारतEval
            </Button>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm italic text-muted-foreground">Kaggle & Model Training Guide</span>
          </div>
          <Button size="sm" onClick={() => navigate("/dashboard")} className="text-xs gap-1">
            <Play className="w-3 h-3" /> Open Dashboard
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-10">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Contents</p>
            <nav className="space-y-1">
              {TOC.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-xs text-muted-foreground hover:text-foreground transition-colors py-1 border-l-2 border-transparent hover:border-primary pl-3"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 border-2 border-border p-8 text-center relative"
            style={{ background: "#fffcf5", boxShadow: "0 0 0 4px #f5f1e6, 0 0 0 6px #dbd0ba" }}
          >
            {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
              <span key={i} className={`absolute ${pos} text-primary/30 text-lg`}>✦</span>
            ))}
            <span className="stamp text-xs mb-4 inline-block">Researcher's Handbook</span>
            <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: "'Lora', serif" }}>
              Kaggle & Model Training Guide
            </h1>
            <p className="text-muted-foreground italic text-base">
              How to use BharatEval data to train and evaluate multilingual AI models for Indian education
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Badge variant="secondary">Kaggle Notebooks</Badge>
              <Badge variant="secondary">HuggingFace Transformers</Badge>
              <Badge variant="secondary">Cross-lingual NLP</Badge>
              <Badge variant="secondary">BharatBench Metric</Badge>
            </div>
          </motion.div>

          {/* Overview */}
          <Section id="overview" title="Overview: What You're Building" icon={Layers}>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              BharatEval is a multilingual benchmark for evaluating AI models on Indian curriculum content. 
              Your goal is to train or fine-tune a language model that can answer NCERT-aligned questions 
              accurately across multiple Indian languages (English, Hindi, Tamil, etc.) and measure its 
              performance using the BharatBench score.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {[
                { icon: Database, title: "Dataset", desc: "500+ NCERT-aligned questions with Hindi & Tamil translations" },
                { icon: Code2, title: "Model", desc: "Fine-tune mBERT, IndicBERT, or multilingual T5 on the dataset" },
                { icon: Trophy, title: "Metric", desc: "BharatBench Score: accuracy + cross-lingual consistency + cultural fit" },
              ].map((item, i) => (
                <div key={i} className="border border-border p-4 bg-muted/20">
                  <item.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-bold mb-1" style={{ fontFamily: "'Lora', serif" }}>{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <InfoBox type="info">
              <strong>What Kaggle competition?</strong> You can either submit to an existing multilingual NLP competition 
              (like AI4Bharat challenges) or create your own Kaggle dataset and notebook to showcase BharatEval. 
              This guide covers both paths.
            </InfoBox>
          </Section>

          {/* Step 1: Dataset */}
          <Section id="dataset" title="Step 1: Get the Dataset" icon={Database}>
            <Step num={1} title="Export questions from BharatEval dashboard">
              <p>Go to the Dashboard → The Archives tab. Click the <strong>"Export CSV"</strong> button to download all questions with translations.</p>
              <p>The CSV will contain these columns:</p>
              <CodeBlock lang="csv header">
{`question_id,subject,topic,grade_level,difficulty,blooms_level,question_type,
content_english,options,correct_answer,explanation,
content_hindi,bleu_score_hi,semantic_score_hi,
content_tamil,bleu_score_ta,semantic_score_ta,
is_validated,tags`}
              </CodeBlock>
            </Step>

            <Step num={2} title="Alternatively: Use the pre-built dataset structure">
              <p>The dataset is structured for multilingual QA tasks. Here's the format you'll use in your Kaggle notebook:</p>
              <CodeBlock lang="python">
{`import pandas as pd

# Load the exported CSV
df = pd.read_csv('bharateval_questions.csv')

# Dataset structure
print(df.columns.tolist())
# ['question_id', 'subject', 'topic', 'grade_level', 'difficulty', 
#  'blooms_level', 'question_type', 'content_english', 'options',
#  'correct_answer', 'content_hindi', 'content_tamil', 'is_validated']

print(f"Total questions: {len(df)}")
print(f"Subjects: {df['subject'].unique()}")
print(f"Languages with translations: English, Hindi, Tamil")`}
              </CodeBlock>
            </Step>

            <Step num={3} title="Upload to Kaggle as a dataset">
              <p>1. Go to <a href="https://www.kaggle.com/datasets" target="_blank" rel="noopener noreferrer" className="text-primary underline">kaggle.com/datasets</a></p>
              <p>2. Click <strong>"New Dataset"</strong></p>
              <p>3. Upload your CSV file</p>
              <p>4. Name it: <code className="bg-muted px-1 py-0.5 text-xs rounded" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>bharateval-multilingual-qa</code></p>
              <p>5. Set visibility to <strong>Public</strong> for competition submissions</p>
            </Step>
          </Section>

          {/* Step 2: Kaggle Setup */}
          <Section id="kaggle-setup" title="Step 2: Kaggle Account Setup" icon={Upload}>
            <Step num={1} title="Create a Kaggle account">
              <p>Go to <a href="https://www.kaggle.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">kaggle.com</a> and sign up with your Google account.</p>
            </Step>

            <Step num={2} title="Enable GPU in your notebook">
              <p>Kaggle gives you <strong>30 hours/week of free GPU</strong> (T4 or P100). You'll need this for training.</p>
              <p>In your notebook: Settings → Accelerator → <strong>GPU T4 x2</strong></p>
              <InfoBox type="success">
                Kaggle's free GPU is sufficient for fine-tuning smaller models like DistilBERT, IndicBERT, or mBERT on this dataset.
              </InfoBox>
            </Step>

            <Step num={3} title="Install required packages">
              <CodeBlock lang="bash">
{`# In your Kaggle notebook first cell
!pip install transformers datasets accelerate sentencepiece
!pip install indic-nlp-library  # For Indian language processing
!pip install sacrebleu  # For BLEU score computation`}
              </CodeBlock>
            </Step>
          </Section>

          {/* Step 3: Create Notebook */}
          <Section id="notebook" title="Step 3: Create Your Kaggle Notebook" icon={FileText}>
            <Step num={1} title="Create a new notebook">
              <p>Go to <strong>Code → New Notebook</strong> on Kaggle. Add your BharatEval dataset as input.</p>
            </Step>

            <Step num={2} title="Load and preprocess the data">
              <CodeBlock lang="python">
{`import pandas as pd
import numpy as np
from datasets import Dataset, DatasetDict
from transformers import AutoTokenizer

# Load BharatEval dataset
df = pd.read_csv('/kaggle/input/bharateval-multilingual-qa/bharateval_questions.csv')

# Create multilingual dataset
# For each question, create entries in all available languages
rows = []
for _, row in df.iterrows():
    # English entry
    rows.append({
        'question': row['content_english'],
        'answer': row['correct_answer'],
        'language': 'en',
        'subject': row['subject'],
        'difficulty': row['difficulty'],
        'blooms_level': row['blooms_level'],
        'question_id': row['question_id']
    })
    # Hindi entry (if available)
    if pd.notna(row.get('content_hindi')) and row.get('content_hindi'):
        rows.append({
            'question': row['content_hindi'],
            'answer': row['correct_answer'],  # Keep English answer for now
            'language': 'hi',
            'subject': row['subject'],
            'difficulty': row['difficulty'],
            'blooms_level': row['blooms_level'],
            'question_id': row['question_id']
        })
    # Tamil entry (if available)
    if pd.notna(row.get('content_tamil')) and row.get('content_tamil'):
        rows.append({
            'question': row['content_tamil'],
            'answer': row['correct_answer'],
            'language': 'ta',
            'subject': row['subject'],
            'difficulty': row['difficulty'],
            'blooms_level': row['blooms_level'],
            'question_id': row['question_id']
        })

multilingual_df = pd.DataFrame(rows)
print(f"Total multilingual entries: {len(multilingual_df)}")
print(multilingual_df['language'].value_counts())`}
              </CodeBlock>
            </Step>

            <Step num={3} title="Split into train/validation/test sets">
              <CodeBlock lang="python">
{`from sklearn.model_selection import train_test_split

# Split by question_id to avoid data leakage
question_ids = multilingual_df['question_id'].unique()
train_ids, test_ids = train_test_split(question_ids, test_size=0.2, random_state=42)
train_ids, val_ids = train_test_split(train_ids, test_size=0.1, random_state=42)

train_df = multilingual_df[multilingual_df['question_id'].isin(train_ids)]
val_df = multilingual_df[multilingual_df['question_id'].isin(val_ids)]
test_df = multilingual_df[multilingual_df['question_id'].isin(test_ids)]

print(f"Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")`}
              </CodeBlock>
            </Step>
          </Section>

          {/* Step 4: Train */}
          <Section id="train-model" title="Step 4: Train the Model" icon={Zap}>
            <InfoBox type="info">
              <strong>Recommended models for Indian languages:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li><strong>IndicBERT</strong> — Best for Indian languages, trained on 12 Indic languages</li>
                <li><strong>mBERT</strong> — Multilingual BERT, good baseline for cross-lingual tasks</li>
                <li><strong>MuRIL</strong> — Google's Multilingual Representations for Indian Languages</li>
                <li><strong>IndicBART</strong> — For generative tasks (question answering, translation)</li>
              </ul>
            </InfoBox>

            <Step num={1} title="Option A: Classification model (MCQ questions)">
              <p>For MCQ questions, frame it as a multiple-choice classification task:</p>
              <CodeBlock lang="python">
{`from transformers import AutoTokenizer, AutoModelForMultipleChoice
import torch
from torch.utils.data import DataLoader

# Use IndicBERT for best Indian language support
MODEL_NAME = "ai4bharat/indic-bert"
# Alternative: "google/muril-base-cased" or "bert-base-multilingual-cased"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForMultipleChoice.from_pretrained(MODEL_NAME)

def preprocess_mcq(examples):
    """Prepare MCQ data for multiple choice model"""
    questions = examples['question']
    options_list = examples['options']  # List of 4 options
    
    # Tokenize each question with each option
    encodings = []
    for q, opts in zip(questions, options_list):
        if opts and len(opts) == 4:
            pairs = [(q, opt) for opt in opts]
            enc = tokenizer(
                [p[0] for p in pairs],
                [p[1] for p in pairs],
                max_length=256,
                padding='max_length',
                truncation=True,
                return_tensors='pt'
            )
            encodings.append(enc)
    return encodings

# Filter MCQ questions only
mcq_df = multilingual_df[multilingual_df['question_type'] == 'mcq'].copy()
print(f"MCQ questions: {len(mcq_df)}")`}
              </CodeBlock>
            </Step>

            <Step num={2} title="Option B: Generative model (all question types)">
              <p>For all question types, use a seq2seq model like mT5 or IndicBART:</p>
              <CodeBlock lang="python">
{`from transformers import (
    AutoTokenizer, 
    AutoModelForSeq2SeqLM,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
    DataCollatorForSeq2Seq
)
from datasets import Dataset

# Use mT5 for multilingual generation
MODEL_NAME = "google/mt5-small"  # Use mt5-base for better quality
# Alternative: "ai4bharat/IndicBART"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

def preprocess_function(examples):
    """Format: 'Answer the question: {question}' -> '{answer}'"""
    inputs = [f"Answer the question: {q}" for q in examples['question']]
    targets = examples['answer']
    
    model_inputs = tokenizer(
        inputs, 
        max_length=512, 
        truncation=True, 
        padding='max_length'
    )
    labels = tokenizer(
        targets, 
        max_length=128, 
        truncation=True, 
        padding='max_length'
    )
    model_inputs['labels'] = labels['input_ids']
    return model_inputs

# Convert to HuggingFace Dataset
train_dataset = Dataset.from_pandas(train_df[['question', 'answer', 'language']])
val_dataset = Dataset.from_pandas(val_df[['question', 'answer', 'language']])

# Tokenize
tokenized_train = train_dataset.map(preprocess_function, batched=True)
tokenized_val = val_dataset.map(preprocess_function, batched=True)`}
              </CodeBlock>
            </Step>

            <Step num={3} title="Configure training arguments">
              <CodeBlock lang="python">
{`training_args = Seq2SeqTrainingArguments(
    output_dir="./bharateval-model",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    warmup_steps=100,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=50,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    predict_with_generate=True,
    fp16=True,  # Use mixed precision for faster training on GPU
    generation_max_length=128,
    report_to="none",  # Disable wandb
)

data_collator = DataCollatorForSeq2Seq(tokenizer, model=model, padding=True)

trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_train,
    eval_dataset=tokenized_val,
    tokenizer=tokenizer,
    data_collator=data_collator,
)

# Train!
trainer.train()`}
              </CodeBlock>
            </Step>
          </Section>

          {/* Step 5: Evaluate */}
          <Section id="evaluate" title="Step 5: Evaluate & Compute BharatBench Score" icon={Trophy}>
            <Step num={1} title="Run inference on test set">
              <CodeBlock lang="python">
{`# Generate predictions
def generate_answers(model, tokenizer, questions, batch_size=16):
    model.eval()
    predictions = []
    
    for i in range(0, len(questions), batch_size):
        batch = questions[i:i+batch_size]
        inputs = tokenizer(
            [f"Answer the question: {q}" for q in batch],
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        ).to(model.device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=128,
                num_beams=4,
                early_stopping=True
            )
        
        decoded = tokenizer.batch_decode(outputs, skip_special_tokens=True)
        predictions.extend(decoded)
    
    return predictions

# Get predictions for each language
test_en = test_df[test_df['language'] == 'en']
test_hi = test_df[test_df['language'] == 'hi']
test_ta = test_df[test_df['language'] == 'ta']

preds_en = generate_answers(model, tokenizer, test_en['question'].tolist())
preds_hi = generate_answers(model, tokenizer, test_hi['question'].tolist())
preds_ta = generate_answers(model, tokenizer, test_ta['question'].tolist())`}
              </CodeBlock>
            </Step>

            <Step num={2} title="Compute BharatBench Score">
              <CodeBlock lang="python">
{`from sacrebleu.metrics import BLEU
import numpy as np

def exact_match(predictions, references):
    """Simple exact match accuracy"""
    correct = sum(1 for p, r in zip(predictions, references) 
                  if p.strip().lower() == r.strip().lower())
    return correct / len(predictions) if predictions else 0

def compute_bharatbench_score(results_by_language):
    """
    BharatBench Score = 
      0.4 * Accuracy + 
      0.3 * Cross-lingual Consistency + 
      0.2 * Cultural Fit + 
      0.1 * (1 - Bias Index)
    """
    accuracies = {}
    for lang, (preds, refs) in results_by_language.items():
        accuracies[lang] = exact_match(preds, refs)
    
    # Accuracy: average across languages
    avg_accuracy = np.mean(list(accuracies.values()))
    
    # Cross-lingual consistency: how similar performance is across languages
    # Lower variance = higher consistency
    acc_values = list(accuracies.values())
    std_dev = np.std(acc_values)
    consistency = max(0, 1 - std_dev * 2)  # Normalize
    
    # Cultural fit: performance on non-English languages
    non_en_accs = [v for k, v in accuracies.items() if k != 'en']
    cultural_fit = np.mean(non_en_accs) if non_en_accs else avg_accuracy
    
    # Bias index: max performance gap between languages
    max_gap = max(acc_values) - min(acc_values) if len(acc_values) > 1 else 0
    bias_score = 1 - max_gap  # Higher = less biased
    
    # Composite BharatBench Score
    bharatbench = (
        0.4 * avg_accuracy +
        0.3 * consistency +
        0.2 * cultural_fit +
        0.1 * bias_score
    ) * 100  # Scale to 0-100
    
    return {
        'bharatbench_score': round(bharatbench, 2),
        'accuracy': {k: round(v*100, 2) for k, v in accuracies.items()},
        'consistency': round(consistency * 100, 2),
        'cultural_fit': round(cultural_fit * 100, 2),
        'bias_score': round(bias_score * 100, 2),
    }

# Compute scores
results = {
    'en': (preds_en, test_en['answer'].tolist()),
    'hi': (preds_hi, test_hi['answer'].tolist()),
    'ta': (preds_ta, test_ta['answer'].tolist()),
}

scores = compute_bharatbench_score(results)
print("=" * 50)
print("BharatBench Evaluation Results")
print("=" * 50)
print(f"BharatBench Score: {scores['bharatbench_score']}/100")
print(f"Accuracy by language: {scores['accuracy']}")
print(f"Cross-lingual Consistency: {scores['consistency']}")
print(f"Cultural Fit: {scores['cultural_fit']}")
print(f"Bias Score: {scores['bias_score']}")`}
              </CodeBlock>
            </Step>

            <Step num={3} title="Save and submit results">
              <CodeBlock lang="python">
{`import json

# Save results to submission file
submission = {
    'model': MODEL_NAME,
    'dataset': 'BharatEval v1.0',
    'bharatbench_score': scores['bharatbench_score'],
    'accuracy_en': scores['accuracy'].get('en', 0),
    'accuracy_hi': scores['accuracy'].get('hi', 0),
    'accuracy_ta': scores['accuracy'].get('ta', 0),
    'consistency': scores['consistency'],
    'cultural_fit': scores['cultural_fit'],
    'bias_score': scores['bias_score'],
}

with open('submission.json', 'w') as f:
    json.dump(submission, f, indent=2)

# Also save predictions CSV
results_df = pd.DataFrame({
    'question_id': test_df['question_id'].tolist(),
    'language': test_df['language'].tolist(),
    'predicted_answer': preds_en + preds_hi + preds_ta,
    'correct_answer': test_df['answer'].tolist(),
})
results_df.to_csv('predictions.csv', index=False)
print("Submission files saved!")`}
              </CodeBlock>
            </Step>
          </Section>

          {/* Advanced */}
          <Section id="advanced" title="Advanced: Fine-tuning LLMs for Indian Languages" icon={Code2}>
            <p className="text-sm text-muted-foreground mb-4">
              For better performance, fine-tune a larger model specifically designed for Indian languages.
            </p>

            <div className="space-y-4">
              <div className="border border-border p-5 bg-muted/10">
                <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "'Lora', serif" }}>Option 1: IndicBERT (Recommended)</h3>
                <p className="text-xs text-muted-foreground mb-3">Best for classification tasks. Trained on 12 Indian languages by AI4Bharat.</p>
                <CodeBlock lang="python">
{`# IndicBERT for question classification
from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_name = "ai4bharat/indic-bert"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name, 
    num_labels=4  # For MCQ: 4 options
)`}
                </CodeBlock>
              </div>

              <div className="border border-border p-5 bg-muted/10">
                <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "'Lora', serif" }}>Option 2: MuRIL (Google)</h3>
                <p className="text-xs text-muted-foreground mb-3">Google's model trained on 17 Indian languages + English. Strong cross-lingual transfer.</p>
                <CodeBlock lang="python">
{`# MuRIL - Multilingual Representations for Indian Languages
model_name = "google/muril-base-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)`}
                </CodeBlock>
              </div>

              <div className="border border-border p-5 bg-muted/10">
                <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "'Lora', serif" }}>Option 3: Llama 3 with LoRA (Best Quality)</h3>
                <p className="text-xs text-muted-foreground mb-3">Use parameter-efficient fine-tuning (LoRA) on Llama 3 for best quality. Requires Kaggle GPU.</p>
                <CodeBlock lang="python">
{`# Install PEFT for LoRA fine-tuning
!pip install peft bitsandbytes

from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

# Load in 4-bit quantization to fit in GPU memory
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3-8B",
    quantization_config=bnb_config,
    device_map="auto"
)

# Add LoRA adapters
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# trainable params: ~4M (0.05% of total)`}
                </CodeBlock>
              </div>
            </div>
          </Section>

          {/* Tips */}
          <Section id="tips" title="Tips & Tricks for Better Results" icon={BookOpen}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Use curriculum learning",
                  desc: "Train on easy questions first, then medium, then hard. This mirrors how students learn and improves model convergence.",
                  icon: "📚",
                },
                {
                  title: "Cross-lingual data augmentation",
                  desc: "For each English question, create Hindi and Tamil versions using the translation pipeline. More data = better model.",
                  icon: "🌐",
                },
                {
                  title: "Bloom's taxonomy stratification",
                  desc: "Ensure your train/test split has equal representation of all Bloom's levels (remember, understand, apply, analyze, evaluate, create).",
                  icon: "🧠",
                },
                {
                  title: "Subject-specific fine-tuning",
                  desc: "Train separate models for Math, Science, and Humanities. Subject-specific models often outperform general models.",
                  icon: "🔬",
                },
                {
                  title: "Ensemble models",
                  desc: "Combine predictions from IndicBERT + MuRIL + mT5 using majority voting for better accuracy.",
                  icon: "🎯",
                },
                {
                  title: "Use the BharatBench metric",
                  desc: "Don't just optimize for English accuracy. The BharatBench score rewards cross-lingual consistency — a model that performs equally in Hindi and English scores higher.",
                  icon: "⚖️",
                },
              ].map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-border p-4 bg-muted/10"
                >
                  <div className="text-2xl mb-2">{tip.icon}</div>
                  <h3 className="font-bold text-sm mb-1" style={{ fontFamily: "'Lora', serif" }}>{tip.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 border-2 border-border p-6 text-center" style={{ background: "#fffcf5" }}>
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Lora', serif" }}>Ready to start?</h3>
              <p className="text-sm text-muted-foreground italic mb-4">Export your dataset from the dashboard and start your Kaggle notebook.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/dashboard")} className="gap-2">
                  <Database className="w-4 h-4" /> Open Dashboard & Export
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://www.kaggle.com/code" target="_blank" rel="noopener noreferrer" className="gap-2 flex items-center">
                    <ExternalLink className="w-4 h-4" /> Open Kaggle Notebooks
                  </a>
                </Button>
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
