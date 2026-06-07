export type Lang = "en" | "bn";

export const LANG_STORAGE_KEY = "sarah-travels-lang";

export type Bilingual<T = string> = Record<Lang, T>;

export function pick<T>(lang: Lang, pair: Bilingual<T>): T {
  return pair[lang];
}
