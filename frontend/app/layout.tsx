import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: 'Hệ thống matching - PTNK',
  description: 'Hệ thống đề xuất giảng viên phù hợp cho bài báo cáo lớp 11 liên chuyên ngành - Trường Phổ thông Năng khiếu ĐHQG-HCM',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

