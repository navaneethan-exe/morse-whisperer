export const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
  '"': ".-..-.", "$": "...-..-", "@": ".--.-.",
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k]),
);

export type Direction = "text-to-morse" | "morse-to-text";

export function detectDirection(input: string): Direction {
  const trimmed = input.trim();
  if (!trimmed) return "text-to-morse";
  // If it consists only of dots, dashes, spaces and slashes, treat as morse.
  if (/^[.\-\s/|]+$/.test(trimmed)) return "morse-to-text";
  return "text-to-morse";
}

export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("\n")
    .map((line) =>
      line
        .split(" ")
        .map((word) =>
          word
            .split("")
            .map((ch) => MORSE_MAP[ch] ?? "")
            .filter(Boolean)
            .join(" "),
        )
        .filter(Boolean)
        .join(" / "),
    )
    .join("\n");
}

export function morseToText(morse: string): string {
  return morse
    .split("\n")
    .map((line) =>
      line
        .trim()
        .split(/\s*[/|]\s*/)
        .map((word) =>
          word
            .trim()
            .split(/\s+/)
            .map((sym) => REVERSE_MAP[sym] ?? "")
            .join(""),
        )
        .join(" "),
    )
    .join("\n");
}

export function translate(input: string, direction: Direction): string {
  return direction === "text-to-morse" ? textToMorse(input) : morseToText(input);
}