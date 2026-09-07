import type { Metadata } from 'next'
import '../globals.css'
import { AuthBrand } from './AuthBrand'

export const metadata: Metadata = {
  title: 'SabaiB - Auth',
  description: 'Sign up or log in to SabaiB',
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-body">
      <main className="auth-shell">
        <AuthBrand />
        <section className="auth-content">{children}</section>
      </main>
    </div>
  )
}
