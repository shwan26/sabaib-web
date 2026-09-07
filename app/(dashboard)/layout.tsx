import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Dashboard - SabaiB',
  description: 'Manage your bills',
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f6f6f4]">{children}</div>
  )
}
