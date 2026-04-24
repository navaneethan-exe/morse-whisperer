import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Copy, Download, Pause, Play, RotateCcw, Save, Sparkles, Star } from "lucide-react";
import { detectDirection, translate, type Direction } from "@/lib/morse";
import { MorseAudioPlayer } from "@/lib/morse-audio";
import { usePrefs } from "@/contexts/PreferencesContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthModal } from "@/components/AuthModal";

export function TranslatorPanel() {
  const { speed, freq, bumpCount } = usePrefs();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("text-to-morse");
  const [autoDetect, setAutoDetect] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const playerRef = useRef<MorseAudioPlayer | null>(null);
  const lastSavedRef = useRef<string>("");

  const effectiveDir: Direction = autoDetect ? detectDirection(input) : direction;
  const output = useMemo(() => translate(input, effectiveDir), [input, effectiveDir]);

  useEffect(() => () => { playerRef.current?.stop(); }, []);

  const handleSwap = () => {
    setAutoDetect(false);
    setDirection(effectiveDir === "text-to-morse" ? "morse-to-text" : "text-to-morse");
    setInput(output);
  };

  const handlePlay = () => {
    if (playing) { playerRef.current?.stop(); setPlaying(false); return; }
    const morse = effectiveDir === "text-to-morse" ? output : input;
    if (!morse.trim()) { toast.error("Nothing to play yet."); return; }
    playerRef.current = new MorseAudioPlayer(freq);
    setPlaying(true);
    playerRef.current.play(morse, speed, () => setPlaying(false));
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `morse-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => { setInput(""); playerRef.current?.stop(); setPlaying(false); };

  const handleSave = async (favorite = false) => {
    if (!input.trim() || !output.trim()) { toast.error("Type something first."); return; }
    if (!user) { setAuthOpen(true); return; }
    const key = `${effectiveDir}|${input}|${output}`;
    if (lastSavedRef.current === key && !favorite) return;
    const { error } = await supabase.from("translations").insert({
      user_id: user.id, input_text: input, output_text: output,
      direction: effectiveDir, is_favorite: favorite,
    });
    if (error) { toast.error(error.message); return; }
    lastSavedRef.current = key;
    bumpCount();
    toast.success(favorite ? "Saved to favorites ⭐" : "Saved to history");
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              <span className="gradient-text">Morse Code</span> Translator
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Real-time, beep-perfect, beautifully simple.</p>
          </div>
          <Badge variant="secondary" className="glass border-border/50 px-3 py-1.5 text-xs">
            <Sparkles className="mr-1.5 h-3 w-3 text-accent" />
            {effectiveDir === "text-to-morse" ? "Text → Morse" : "Morse → Text"}
            {autoDetect && <span className="ml-1.5 opacity-60">· auto</span>}
          </Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <Card className="glass-strong border-border/50 p-4 shadow-elegant">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {effectiveDir === "text-to-morse" ? "Text" : "Morse"}
              </span>
              <button onClick={() => setAutoDetect((v) => !v)}
                className={`text-[11px] uppercase tracking-wider transition-colors ${autoDetect ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>
                Auto-detect {autoDetect ? "on" : "off"}
              </button>
            </div>
            <Textarea value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={effectiveDir === "text-to-morse" ? "Type any text…" : "Type morse: .... . .-.. .-.. ---"}
              className="min-h-[200px] resize-none border-0 bg-transparent text-base leading-relaxed focus-visible:ring-0" />
          </Card>

          <div className="flex items-center justify-center">
            <Button variant="ghost" size="icon" onClick={handleSwap}
              className="h-12 w-12 rounded-full glass border border-border/50 shadow-elegant transition-transform hover:scale-110 hover:rotate-180">
              <ArrowLeftRight className="h-5 w-5" />
            </Button>
          </div>

          <Card className="glass-strong border-border/50 p-4 shadow-elegant">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {effectiveDir === "text-to-morse" ? "Morse" : "Text"}
              </span>
              <span className="text-[11px] text-muted-foreground">{output.length} chars</span>
            </div>
            <div className="min-h-[200px] whitespace-pre-wrap break-words font-mono text-base leading-relaxed text-foreground/90">
              {output || <span className="text-muted-foreground">Translation appears here…</span>}
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handlePlay} className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            {playing ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {playing ? "Pause" : "Play sound"}
          </Button>
          <Button variant="secondary" onClick={handleCopy} className="glass border border-border/50">
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
          <Button variant="secondary" onClick={handleDownload} className="glass border border-border/50">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
          <Button variant="secondary" onClick={() => handleSave(false)} className="glass border border-border/50">
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button variant="secondary" onClick={() => handleSave(true)} className="glass border border-border/50">
            <Star className="mr-2 h-4 w-4 text-accent" /> Favorite
          </Button>
          <Button variant="ghost" onClick={handleClear} className="ml-auto">
            <RotateCcw className="mr-2 h-4 w-4" /> Clear
          </Button>
        </div>

        {/* Sticky mobile play button */}
        <div className="fixed bottom-20 right-4 z-20 lg:hidden">
          <Button onClick={handlePlay} size="lg"
            className="h-14 w-14 rounded-full bg-gradient-primary p-0 text-primary-foreground shadow-glow">
            {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} reason="Sign in to save translations to your history." />
    </>
  );
}