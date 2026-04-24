import { createFileRoute } from "@tanstack/react-router";
import { TranslatorPanel } from "@/components/TranslatorPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MorseLab — Modern Morse Code Translator" },
      { name: "description", content: "Translate text to Morse code and back, with realtime beep playback, favorites, and history." },
      { property: "og:title", content: "MorseLab — Modern Morse Code Translator" },
      { property: "og:description", content: "Bidirectional Morse translator with sound, favorites, and personal history." },
    ],
  }),
  component: () => <TranslatorPanel />,
});
