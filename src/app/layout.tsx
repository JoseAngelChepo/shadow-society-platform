import type { Metadata } from "next"
import { Providers } from "@/app/providers"
import { appFont } from "@/config/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Shadow Society",
    template: "%s · Shadow Society",
  },
  description:
    "Exposing latent opinions in Qwen models through multi-agent debates under reward pressure.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={appFont.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
