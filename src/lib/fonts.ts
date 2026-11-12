import { Bricolage_Grotesque, Caveat, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

/** Headlines and the halftone wordmarks. */
export const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

/** Body copy — Plus Jakarta Sans is an Indonesian-made typeface. */
export const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

/** Labels, code and small caps. */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

/** Hand-written notes ("coba tarik kartunya!"). */
export const fontHand = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const fontVariables = [fontDisplay, fontSans, fontMono, fontHand]
  .map((font) => font.variable)
  .join(" ");
