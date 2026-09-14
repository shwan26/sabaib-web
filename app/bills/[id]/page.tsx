'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Alert } from '@/components/Alert'
import type { Database } from '@/lib/database.types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { getGuestParticipantId } from '@/lib/tokenUtils'

type Bill = Database['public']['Tables']['bills']['Row']
type Participant = Database['public']['Tables']['participants']['Row']
type ReceiptItem = Database['public']['Tables']['receipt_items']['Row']

type View = 'split' | 'payment'

function money(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

function itemColor(index: number): string {
  return ['yellow', 'blue', 'green', 'gray'][index % 4]
}

export default function BillDetailPage() {
  const router = useRouter()
  const params = useParams()
  const billId = params.id as string
  const supabase = createBrowserSupabaseClient()

  const [bill, setBill] = useState<Bill | null>(null)
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [view, setView] = useState<View>('split')
  const [isHost, setIsHost] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [copyNotification, setCopyNotification] = useState(false)
  const [qrUploading, setQrUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBillData = async () => {
      try {
        const [{ data: { user } }, billResult, participantsResult, itemsResult] = await Promise.all([
          supabase.auth.getUser(),
          (supabase as any).from('bills').select('*').eq('id', billId).single(),
          (supabase as any).from('participants').select('*').eq('bill_id', billId).order('joined_at', { ascending: true }),
          (supabase as any).from('receipt_items').select('*').eq('bill_id', billId).order('created_at', { ascending: true }),
        ])

        if (billResult.error || !billResult.data) {
          setError('Bill not found')
          return
        }

        if (participantsResult.error) {
          setError('Could not load bill participants: ' + participantsResult.error.message)
          return
        }

        if (itemsResult.error) {
          setError('Could not load receipt items: ' + itemsResult.error.message)
          return
        }

        const billData = billResult.data as Bill
        const loadedParticipants = (participantsResult.data || []) as Participant[]
        const loadedItems = (itemsResult.data || []) as ReceiptItem[]
        const mine = user
          ? loadedParticipants.find((participant) => participant.user_id === user.id)
          : loadedParticipants.find((participant) => participant.id === getGuestParticipantId(billId))

        setBill(billData)
        setParticipants(loadedParticipants)
        setItems(loadedItems)
        setIsHost(Boolean(user && billData.owner_id === user.id))
        setMyParticipantId(mine?.id ?? null)
        setSelectedItemIds(mine?.selected_item_ids ?? [])
      } catch (loadError) {
        console.error(loadError)
        setError('An error occurred while loading this bill.')
      } finally {
        setLoading(false)
      }
    }

    loadBillData()

    let channel: RealtimeChannel | undefined
    const subscribe = async () => {
      channel = supabase
        .channel(`bill-${billId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `bill_id=eq.${billId}` }, (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setParticipants((current) => {
              const next = payload.new as Participant
              const existing = current.some((participant) => participant.id === next.id)
              return existing
                ? current.map((participant) => participant.id === next.id ? next : participant)
                : [...current, next]
            })
          }
        })
        .subscribe()
    }
    subscribe()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [billId, supabase])

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemIds.includes(item.id)),
    [items, selectedItemIds]
  )
  const selectedTotal = selectedItems.reduce((total, item) => total + item.total_price, 0)
  const paid = participants.find((participant) => participant.id === myParticipantId)?.has_paid ?? false

  const toggleItem = async (itemId: string) => {
    if (!myParticipantId || saving) return
    const nextIds = selectedItemIds.includes(itemId)
      ? selectedItemIds.filter((id) => id !== itemId)
      : [...selectedItemIds, itemId]

    setSelectedItemIds(nextIds)
    setSaving(true)
    const result = await (supabase as any)
      .from('participants')
      .update({ selected_item_ids: nextIds })
      .eq('id', myParticipantId)

    if (result.error) {
      setSelectedItemIds(selectedItemIds)
      setError('Could not save your item selection: ' + result.error.message)
    }
    setSaving(false)
  }

  const markAsPaid = async () => {
    if (!myParticipantId) return
    setMarkingPaid(true)
    const result = await (supabase as any)
      .from('participants')
      .update({ has_paid: true, paid_at: new Date().toISOString() })
      .eq('id', myParticipantId)

    if (result.error) setError('Could not update payment status: ' + result.error.message)
    else setParticipants((current) => current.map((participant) => participant.id === myParticipantId ? { ...participant, has_paid: true } : participant))
    setMarkingPaid(false)
  }

  const copyInvite = async () => {
    if (!bill) return
    await navigator.clipboard.writeText(`${window.location.origin}/join/${bill.code || bill.id}`)
    setCopyNotification(true)
    window.setTimeout(() => setCopyNotification(false), 2200)
  }

  const uploadQr = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !bill) return
    setQrUploading(true)
    const path = `${bill.id}/${Date.now()}-${file.name}`
    const upload = await supabase.storage.from('payment-qr').upload(path, file, { upsert: true })
    if (upload.error) {
      setError('Could not upload QR code: ' + upload.error.message)
    } else {
      const url = supabase.storage.from('payment-qr').getPublicUrl(path).data.publicUrl
      const update = await (supabase as any).from('bills').update({ promptpay_qr_path: url }).eq('id', bill.id)
      if (update.error) setError('Could not save QR code: ' + update.error.message)
      else setBill({ ...bill, promptpay_qr_path: url })
    }
    setQrUploading(false)
  }

  if (loading) return <div className="dashboard-loading"><div className="dashboard-spinner" /><p>Loading your bill...</p></div>

  if (error || !bill) {
    return <main className="split-app"><div className="split-shell"><Alert type="error" message={error || 'Bill not found'} /><Link className="secondary-button" href="/dashboard">Back to dashboard</Link></div></main>
  }

  if (bill.settled_at) {
    return <main className="split-app"><div className="split-shell"><Alert type="info" title="Bill settled" message="This bill is closed and no longer accepts payments." /><Link className="secondary-button" href="/dashboard">Back to dashboard</Link></div></main>
  }

  return (
    <main className="split-app">
      <div className="split-shell">
        <header className="split-header">
          <Link className="wordmark" href="/dashboard">SabaiB</Link>
          <div className="style-toggle" aria-label="Bill flow view">
            <button className={view === 'split' ? 'active' : ''} onClick={() => setView('split')}>Split items</button>
            <button className={view === 'payment' ? 'active' : ''} onClick={() => setView('payment')}>Payment</button>
          </div>
        </header>

        <section className="flow-panel">
          <div className="bill-heading">
            <div>
              <p className="eyebrow">{view === 'split' ? 'YOUR SHARE' : 'PAYMENT'}</p>
              <h1>{view === 'split' ? 'Split items' : 'Your payment'}</h1>
              <p className="intro">{bill.restaurant_name || 'Shared bill'} · {bill.code || bill.id.slice(0, 6)}</p>
            </div>
            <div className="group-avatar">{(bill.restaurant_name || 'S').charAt(0).toUpperCase()}</div>
          </div>

          {view === 'split' ? (
            <>
              <div className="people-row">
                {participants.map((participant) => {
                  const amount = items.filter((item) => participant.selected_item_ids?.includes(item.id)).reduce((sum, item) => sum + item.total_price, 0)
                  return <div className={`person-pill ${participant.id === myParticipantId ? 'you' : ''}`} key={participant.id}><b>{participant.name.charAt(0).toUpperCase()}</b><span>{participant.id === myParticipantId ? 'You' : participant.name}</span><strong>{money(amount, bill.currency)}</strong></div>
                })}
              </div>
              <p className="split-helper">Tap the dishes you had. Your choices are saved as you go.</p>
              <h2 className="receipt-items-heading">Receipt items</h2>
              <div className="item-list">
                {items.length === 0 ? <p className="empty-split">No receipt items have been added yet.</p> : items.map((item, index) => {
                  const claimedBy = participants.filter((participant) => participant.selected_item_ids?.includes(item.id))
                  const selected = selectedItemIds.includes(item.id)
                  return <button type="button" className={`item-row ${selected ? 'claimed' : ''}`} key={item.id} onClick={() => toggleItem(item.id)}><span className={`item-dot ${itemColor(index)}`} /><span><span className="item-name">{item.translated_name || item.original_name}</span><small>{item.translated_name && item.original_name !== item.translated_name ? `${item.original_name} · ` : ''}{item.quantity > 1 ? `${item.quantity} × ` : ''}{money(item.unit_price, bill.currency)} each</small></span><span className="item-price">{money(item.total_price, bill.currency)}</span><span className="checkmark">{selected ? '✓' : claimedBy.length ? claimedBy.length : ''}</span></button>
                })}
              </div>
              <div className="total-row"><span>Your total</span><strong>{money(selectedTotal, bill.currency)}</strong></div>
              <button className="primary-button" disabled={!myParticipantId || selectedItems.length === 0 || saving} onClick={() => setView('payment')}>Continue to payment <span>→</span></button>
              {!myParticipantId && <p className="helper-note">Join this bill first to select your items.</p>}
            </>
          ) : (
            <div className="payment-panel">
              <p className="payment-intro">Scan this QR code to pay your share.</p>
              <div className="payment-card">
                <p className="promptpay">PROMPTPAY</p>
                {bill.promptpay_qr_path ? <img className="qr-image" src={bill.promptpay_qr_path} alt="PromptPay QR code" /> : <div className="qr-payment"><div className="qr-art" aria-label="QR code placeholder" /></div>}
                <strong>{money(selectedTotal, bill.currency)}</strong>
                <p>{selectedItems.length} selected {selectedItems.length === 1 ? 'item' : 'items'}</p>
                <button className="share-button" type="button" onClick={copyInvite}>Share this bill <span>↗</span></button>
              </div>
              <div className={`payment-status ${paid ? 'paid' : ''}`}><span>Status</span><strong>{paid ? 'Paid' : 'Unpaid'}</strong></div>
              <p className="payment-note">Once you have paid the host, tap Done.</p>
              {isHost && <label className="upload-qr">{qrUploading ? 'Uploading...' : 'Upload PromptPay QR'}<input type="file" accept="image/*" onChange={uploadQr} disabled={qrUploading} /></label>}
              {copyNotification && <p className="success-message">Bill link copied.</p>}
              <div className="payment-actions"><button className="secondary-button" onClick={() => setView('split')}>Back to items</button><button className="primary-button" disabled={paid || markingPaid || !myParticipantId} onClick={markAsPaid}>{paid ? 'Paid' : markingPaid ? 'Saving...' : 'Done'}</button></div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
