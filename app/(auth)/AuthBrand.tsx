'use client'

import { usePathname } from 'next/navigation'

export function AuthBrand() {
  const pathname = usePathname()
  const isSignup = pathname.endsWith('/signup')

  return (
    <section className="auth-brand" aria-label="SabaiB introduction">
      <div className="auth-brand-content">
        <h1>SabaiB</h1>
        <div
          className="auth-penguin-image"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${isSignup ? '/penguin_jump.png' : '/penguin_wave.png'})`,
          }}
        />
        <p>Scan a receipt, split it with friends,<br />and settle up in seconds.</p>
      </div>
    </section>
  )
}