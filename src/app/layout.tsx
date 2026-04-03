import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'AI Talent Academy — Free AI Training for Filipino VAs',
  description:
    'Master AI tools, build a portfolio, and get hired. Free training platform for Filipino virtual assistants.',
  openGraph: {
    title: 'AI Talent Academy — Free AI Training for Filipino VAs',
    description: 'Master AI tools, build a portfolio, and get hired.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <main>{children}</main>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
