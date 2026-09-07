'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const items = [
  { id: 'tom-yum', name: 'Tom Yum Boong', price: 160, color: 'yellow' },
  { id: 'pad-thai', name: 'Pad Thai', price: 165, color: 'blue' },
  { id: 'curry', name: 'Green Curry Chicken', price: 165, color: 'blue' },
  { id: 'rice', name: 'Mango Sticky Rice', price: 85, color: 'green' },
  { id: 'tea', name: 'Thai Iced Tea', price: 129, color: 'yellow' },
  { id: 'service', name: 'Service Charge', price: 45, color: 'gray' },
]

type Step = 'join' | 'items' | 'payment'

function Baht({ amount }: { amount: number }) {
  return <>฿{amount.toLocaleString()}</>
}

export default function HomePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('join')
  const [method, setMethod] = useState<'code' | 'qr'>('code')
  const [code, setCode] = useState('')
  const [splitStyle, setSplitStyle] = useState<'playful' | 'minimal'>('playful')
  const [selected, setSelected] = useState<Set<string>>(new Set(['tom-yum', 'tea', 'service']))
  const [paid, setPaid] = useState(false)

  const total = useMemo(() => items.filter((item) => selected.has(item.id)).reduce((sum, item) => sum + item.price, 0), [selected])
  const joinGroup = (event?: FormEvent) => {
    if (event) event.preventDefault()
    const normalizedCode = code.trim().toUpperCase()
    if (normalizedCode.length >= 4) {
      router.push(`/join/${encodeURIComponent(normalizedCode)}`)
    } else if (method === 'qr') {
      // The visual demo continues after a QR scan; a production scanner can
      // populate `code` and use the same route above.
      setStep('items')
    }
  }
  const toggleItem = (id: string) => setSelected((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  return (
    <main className={`split-app ${splitStyle === 'minimal' ? 'minimal-mode' : ''}`}>
      <section className="split-shell">
        <header className="split-header">
          <button className="wordmark" onClick={() => setStep('join')} aria-label="Go to join group">splitly</button>
          <div className="style-toggle" aria-label="Visual style">
            <button className={splitStyle === 'playful' ? 'active' : ''} onClick={() => setSplitStyle('playful')}>A · Playful</button>
            <button className={splitStyle === 'minimal' ? 'active' : ''} onClick={() => setSplitStyle('minimal')}>B · Minimal</button>
          </div>
        </header>

        {step === 'join' && <section className="flow-panel join-panel">
          <p className="eyebrow">JOIN THE TABLE</p><h1>Join a group</h1><p className="intro">Pick up where your friends left off.</p>
          <div className="join-tabs" role="tablist">
            <button role="tab" aria-selected={method === 'code'} className={method === 'code' ? 'selected' : ''} onClick={() => setMethod('code')}><span>⌘</span> Enter code</button>
            <button role="tab" aria-selected={method === 'qr'} className={method === 'qr' ? 'selected' : ''} onClick={() => setMethod('qr')}><span>⌁</span> Scan QR</button>
          </div>
          {method === 'code' ? <form onSubmit={joinGroup} className="join-form">
            <label htmlFor="group-code">Ask the host for their 6-digit group code</label>
            <input id="group-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="e.g. BM65TT" maxLength={6} autoComplete="off" />
            <button className="primary-button" type="submit" disabled={code.trim().length < 4}>Join group <span>→</span></button>
          </form> : <div className="scan-card">
            <div className="scan-frame"><div className="qr-art" aria-hidden="true" /></div><div><h2>Ready to scan</h2><p>Point your camera at the host&apos;s group QR.</p></div>
            <button className="primary-button" onClick={() => joinGroup()}>Open camera <span>↗</span></button><button className="text-button" onClick={() => setMethod('code')}>I have a code instead</button>
          </div>}
          <p className="helper-note">Your group code only lets you see this shared bill.</p>
        </section>}

        {step === 'items' && <section className="flow-panel items-panel">
          <div className="bill-heading"><div><p className="eyebrow">BAAN SUAN · SATHORN</p><h1>Split items</h1><p className="intro">Tap everything that belongs to you.</p></div><div className="group-avatar">Y</div></div>
          <div className="people-row"><span className="person-pill you"><b>Y</b> You <strong><Baht amount={total} /></strong></span><span className="person-pill"><b>P</b> Palm <strong>฿830</strong></span><span className="person-pill"><b>G</b> Get <strong>฿160</strong></span></div>
          <div className="item-list">{items.map((item) => {
            const isSelected = selected.has(item.id)
            return <button key={item.id} className={`item-row ${isSelected ? 'claimed' : ''}`} onClick={() => toggleItem(item.id)} aria-pressed={isSelected}><span className={`item-dot ${item.color}`} /><span className="item-name">{item.name}</span><span className="item-price"><Baht amount={item.price} /></span><span className="checkmark">{isSelected ? '✓' : '+'}</span></button>
          })}</div>
          <div className="total-row"><span>Your total</span><strong><Baht amount={total} /></strong></div><button className="primary-button" onClick={() => setStep('payment')} disabled={total === 0}>Continue to payment <span>→</span></button>
        </section>}

        {step === 'payment' && <section className="flow-panel payment-panel">
          <p className="eyebrow">ONE LAST THING</p><h1>Payment</h1><div className="payment-card"><p className="promptpay">PROMPTPAY</p><div className="qr-payment"><div className="qr-art" aria-hidden="true" /></div><strong><Baht amount={total} /></strong><p>Scan with your banking app to pay</p><button className="share-button" onClick={() => { if (navigator.share) void navigator.share({ title: 'PromptPay payment', text: `Pay ฿${total} for Baan Suan` }) }}>Share this PromptPay QR <span>↗</span></button></div>
          <div className={`payment-status ${paid ? 'paid' : ''}`}><span>Status</span><strong>{paid ? 'Paid' : 'Unpaid'}</strong></div><div className="payment-actions"><button className="secondary-button" onClick={() => setStep('items')}>Back to items</button><button className="primary-button" onClick={() => setPaid(true)}>{paid ? 'Payment received ✓' : 'I’ve paid'}</button></div>{paid && <p className="success-message">Nice — your share is marked as paid.</p>}
        </section>}
      </section>
    </main>
  )
}
