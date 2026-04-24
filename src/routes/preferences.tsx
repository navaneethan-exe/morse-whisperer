import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/contexts/PreferencesContext";
import { Moon, Sun, Globe, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/preferences")({
  head: () => ({ meta: [{ title: "Preferences — MorseLab" }] }),
  component: PrefsPage,
});

const LANGS = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
] as const;

function PrefsPage() {
  const { theme, setTheme, lang, setLang, totalCount } = usePrefs();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold lg:text-4xl"><span className="gradient-text">Preferences</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Personalize your MorseLab.</p>
      </div>

      <Card className="glass-strong border-border/50 p-6 shadow-elegant">
        <h2 className="text-lg font-semibold">Theme</h2>
        <p className="text-sm text-muted-foreground">Light or dark interface.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(["dark", "light"] as const).map((t) => (
            <button key={t} onClick={() => setTheme(t)}
              className={`flex items-center justify-center gap-2 rounded-2xl border p-4 transition-all ${
                theme === t ? "border-accent bg-gradient-primary text-primary-foreground shadow-glow" : "border-border/50 glass hover:translate-y-[-2px]"
              }`}>
              {t === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span className="capitalize font-semibold">{t}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="glass-strong border-border/50 p-6 shadow-elegant">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Language</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {LANGS.map((l) => (
            <Button key={l.id} variant={lang === l.id ? "default" : "secondary"}
              onClick={() => setLang(l.id)}
              className={lang === l.id ? "bg-gradient-primary text-primary-foreground shadow-glow" : "glass border border-border/50"}>
              {l.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="glass-strong border-border/50 p-6 shadow-elegant">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Usage stats</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl glass border border-border/50 p-5">
            <div className="text-xs uppercase text-muted-foreground">Saved translations</div>
            <div className="mt-1 text-3xl font-bold gradient-text">{totalCount}</div>
          </div>
          <div className="rounded-2xl glass border border-border/50 p-5">
            <div className="text-xs uppercase text-muted-foreground">Theme</div>
            <div className="mt-1 text-3xl font-bold gradient-text capitalize">{theme}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}