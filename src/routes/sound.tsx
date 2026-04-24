import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePrefs } from "@/contexts/PreferencesContext";
import { MorseAudioPlayer, type MorseSpeed } from "@/lib/morse-audio";
import { Play, Volume2 } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/sound")({
  head: () => ({ meta: [{ title: "Sound Settings — MorseLab" }] }),
  component: SoundPage,
});

function SoundPage() {
  const { speed, setSpeed, freq, setFreq } = usePrefs();
  const [playing, setPlaying] = useState(false);
  const ref = useRef<MorseAudioPlayer | null>(null);

  const preview = () => {
    ref.current?.stop();
    ref.current = new MorseAudioPlayer(freq);
    setPlaying(true);
    ref.current.play(".... . .-.. .-.. --- / ...- .. -... .", speed, () => setPlaying(false));
  };

  const speeds: { id: MorseSpeed; label: string; wpm: string }[] = [
    { id: "slow", label: "Slow", wpm: "8 WPM" },
    { id: "medium", label: "Medium", wpm: "18 WPM" },
    { id: "fast", label: "Fast", wpm: "30 WPM" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold lg:text-4xl"><span className="gradient-text">Sound Settings</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Tune your Morse beeps.</p>
      </div>

      <Card className="glass-strong border-border/50 p-6 shadow-elegant">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Volume2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Speed</h2>
            <p className="text-sm text-muted-foreground">Words per minute (PARIS standard)</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {speeds.map((s) => (
            <button key={s.id} onClick={() => setSpeed(s.id)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                speed === s.id ? "border-accent bg-gradient-primary text-primary-foreground shadow-glow" : "border-border/50 glass hover:translate-y-[-2px]"
              }`}>
              <div className="font-semibold">{s.label}</div>
              <div className="text-xs opacity-80">{s.wpm}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="glass-strong border-border/50 p-6 shadow-elegant">
        <h2 className="text-lg font-semibold">Tone frequency</h2>
        <p className="text-sm text-muted-foreground">Currently {freq} Hz</p>
        <div className="mt-4">
          <Slider min={300} max={1000} step={10} value={[freq]} onValueChange={(v) => setFreq(v[0])} />
        </div>
        <Button onClick={preview} disabled={playing}
          className="mt-5 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
          <Play className="mr-2 h-4 w-4" /> {playing ? "Playing…" : "Preview"}
        </Button>
      </Card>
    </div>
  );
}