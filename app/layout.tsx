import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AutoLLM - The Smartest AI Assistant",
  description:
    "AutoLLM automatically chooses the best language model (GPT-4, Claude, Gemini) for your specific task, delivering the most intelligent response every time.",
  keywords: "AI, artificial intelligence, LLM, GPT-4, Claude, Gemini, smart routing, AI assistant, machine learning",
  authors: [{ name: "AutoLLM Team" }],
  openGraph: {
    title: "AutoLLM - The Smartest AI Assistant",
    description: "Intelligent AI model routing that automatically selects the best language model for your task.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoLLM - The Smartest AI Assistant",
    description: "Intelligent AI model routing that automatically selects the best language model for your task.",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
