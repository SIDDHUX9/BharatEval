import { motion } from "framer-motion";
import { Download, FileArchive, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center space-y-8"
      >
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <FileArchive className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-serif text-foreground">BharatEval Source Code</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Complete project archive including all source files, Convex backend, React frontend,
            schema, AI actions, and configuration. Node modules and build artifacts are excluded.
          </p>
        </div>

        <div className="bg-muted/40 border border-border rounded-xl p-5 text-left space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Included in archive</p>
          {[
            "src/ — React frontend, pages, components",
            "src/convex/ — Convex backend, schema, AI actions",
            "src/lib/ — VLY integrations, utilities",
            "public/ — Static assets",
            "package.json, tsconfig, vite config",
            "README.md, AGENTS.md, VLY.md",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-foreground/80">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="font-mono text-xs">{item}</span>
            </div>
          ))}
        </div>

        <a href="/bharateval-project.tar.gz" download="bharateval-project.tar.gz">
          <Button size="lg" className="w-full gap-2 text-base">
            <Download className="w-5 h-5" />
            Download bharateval-project.tar.gz
          </Button>
        </a>

        <p className="text-xs text-muted-foreground">
          Extract with: <code className="font-mono bg-muted px-1.5 py-0.5 rounded">tar -xzf bharateval-project.tar.gz</code>
        </p>
      </motion.div>
    </div>
  );
}
