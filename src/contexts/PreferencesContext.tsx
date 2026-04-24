import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { MorseSpeed } from "@/lib/morse-audio";

type Theme = "dark" | "light";
type Lang = "en" | "es" | "fr";

interface PrefsCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  speed: MorseSpeed;
  setSpeed: (s: MorseSpeed) => void;
  freq: number;
  setFreq: (f: number) => void;
  totalCount: number;
  bumpCount: () => void;
}

const SSR_DEFAULTS: PrefsCtx = {
  theme: "light",
  setTheme: () => {},
  lang: "en",
  setLang: () => {},
  speed: "medium",
  setSpeed: () => {},
  freq: 600,
  setFreq: () => {},
  totalCount: 0,
  bumpCount: () => {},
};

const PrefsContext = createContext<PrefsCtx>(SSR_DEFAULTS);

function load<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => load("pref:theme", "light"));
  const [lang, setLangState] = useState<Lang>(() => load("pref:lang", "en"));
  const [speed, setSpeedState] = useState<MorseSpeed>(() => load("pref:speed", "medium"));
  const [freq, setFreqState] = useState<number>(() => load("pref:freq", 600));
  const [totalCount, setTotal] = useState<number>(() => load("pref:count", 0));

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("pref:theme", JSON.stringify(theme));
  }, [theme]);
  useEffect(() => { localStorage.setItem("pref:lang", JSON.stringify(lang)); }, [lang]);
  useEffect(() => { localStorage.setItem("pref:speed", JSON.stringify(speed)); }, [speed]);
  useEffect(() => { localStorage.setItem("pref:freq", JSON.stringify(freq)); }, [freq]);
  useEffect(() => { localStorage.setItem("pref:count", JSON.stringify(totalCount)); }, [totalCount]);

  return (
    <PrefsContext.Provider value={{
      theme, setTheme: setThemeState,
      lang, setLang: setLangState,
      speed, setSpeed: setSpeedState,
      freq, setFreq: setFreqState,
      totalCount, bumpCount: () => setTotal((c) => c + 1),
    }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  return useContext(PrefsContext);
}