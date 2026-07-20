import { Space_Grotesk } from "next/font/google"

/** Primary UI font — match literal name in globals.css --app-font (docs/FONTS.md). */
export const appFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})
