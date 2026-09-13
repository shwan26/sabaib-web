'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [code, setCode] = useState('')

  const joinGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedCode = code.trim().toUpperCase()
    if (normalizedCode.length >= 4) router.push(`/join/${encodeURIComponent(normalizedCode)}`)
  }

  return (
    <main className="home-page">
      <header className="home-header">
        <button className="home-brand" onClick={() => router.push('/')} aria-label="SabaiB home">
          <img src="/penguin_wave.png" alt="" /><span>Sabai<span>B</span></span>
        </button>
        <nav className="home-nav" aria-label="Main navigation">
          <a href="/signup">Download App</a>
          <a href="/login">Create/Login Account</a>
        </nav>
      </header>

      <section className="home-content">
        <div className="home-copy">
          <p className="home-kicker">Split the Bill, Not the Mood!</p>
          <h1>Sabai<span>B</span></h1>
          <p className="home-description">will help you for fair bills.</p>

          <div className="home-actions">
            <div className="home-card demo-card">
              <h2>Just curious?</h2>
              <p>Try a live demo bill with sample friends and dishes—no code needed.</p>
              <button className="home-button" onClick={() => router.push('/join/B7X2KP')}>Try the demo bill <span>→</span></button>
            </div>
            <div className="home-card code-card">
              <h2>Have a bill code?</h2>
              <p>Your host shared a link or a 6-character code. Enter it to join.</p>
              <form onSubmit={joinGroup} className="code-form">
                <label className="sr-only" htmlFor="group-code">Bill code</label>
                <input id="group-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="e.g. B7X2KP" maxLength={6} autoComplete="off" />
                <button className="home-button" type="submit">Join <span>→</span></button>
              </form>
            </div>
          </div>
        </div>

        <aside className="invite-preview" aria-label="Example bill invitation">
          <div className="invite-card">
            <img src="/penguin_wave.png" alt="SabaiB penguin" />
            <p className="invite-kicker">YOU&apos;RE INVITED TO</p>
            <h2>Baan Suan<br />Sathorn</h2>
            <div className="invite-code"><small>BILL CODE</small><strong>B7X2KP</strong></div>
            <div className="invite-people"><span>♧</span><div><b>3 friends joined</b><small>Waiting for you</small></div></div>
          </div>
        </aside>
      </section>

      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} SabaiB. All rights reserved.</p>
        <nav className="home-footer-nav" aria-label="Legal">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </nav>
      </footer>
    </main>
  )
}
