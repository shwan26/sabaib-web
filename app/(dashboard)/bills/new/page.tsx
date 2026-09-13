'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Alert } from '@/components/Alert'
import type { Database } from '@/lib/database.types'

type BillInsert = Database['public']['Tables']['bills']['Insert']
type ReceiptItemInsert = Database['public']['Tables']['receipt_items']['Insert']

// Excludes visually ambiguous characters (0/O, 1/I) so codes are easy to read aloud/type.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateBillCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

interface ReceiptItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
}

export default function CreateBillPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  const [restaurantName, setRestaurantName] = useState('')
  const [currency, setCurrency] = useState('THB')
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [vatPercent, setVatPercent] = useState('7')
  const [serviceChargePercent, setServiceChargePercent] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const vat = (subtotal * parseFloat(vatPercent)) / 100
  const serviceCharge = (subtotal * parseFloat(serviceChargePercent)) / 100
  const total = subtotal + vat + serviceCharge

  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice) {
      setError('Please fill in item name and price')
      return
    }

    const newItem: ReceiptItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      quantity: parseFloat(newItemQuantity) || 1,
      unitPrice: parseFloat(newItemPrice),
    }

    setItems([...items, newItem])
    setNewItemName('')
    setNewItemQuantity('1')
    setNewItemPrice('')
    setError('')
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!restaurantName.trim()) {
      setError('Restaurant/bill name is required')
      return
    }

    if (items.length === 0) {
      setError('Please add at least one item')
      return
    }

    setLoading(true)

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      // Create bill with calculated totals. Retry on the rare invite-code
      // collision (unique constraint violation, Postgres error code 23505).
      let insertResult: any
      for (let attempt = 0; attempt < 5; attempt++) {
        const billInsertData = {
          owner_id: user.id,
          code: generateBillCode(),
          restaurant_name: restaurantName,
          currency,
          subtotal,
          vat_percent: parseFloat(vatPercent),
          vat_amount: vat,
          service_charge_percent: parseFloat(serviceChargePercent),
          service_charge_amount: serviceCharge,
          total_amount: total,
          status: 'waiting' as const,
          stage: 'waiting' as const,
        }

        insertResult = await (supabase as any)
          .from('bills')
          .insert(billInsertData as any)
          .select()
          .single()

        if (!insertResult.error || insertResult.error.code !== '23505') break
      }

      if (insertResult.error) {
        setError('Failed to create bill: ' + insertResult.error.message)
        console.error(insertResult.error)
        setLoading(false)
        return
      }

      const newBill = insertResult.data as Database['public']['Tables']['bills']['Row']

      // Add the host as a participant so they show up in the split/payment list too.
      const hostParticipantResult = await (supabase as any).from('participants').insert([
        {
          bill_id: newBill.id,
          user_id: user.id,
          name: user.email?.split('@')[0] || 'Host',
          role: 'host',
        },
      ])

      if (hostParticipantResult.error) {
        console.error(hostParticipantResult.error)
      }

      // Add receipt items
      const itemsInsertData = items.map((item) => ({
        bill_id: newBill.id,
        original_name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.quantity * item.unitPrice,
      }))

      const itemsResult = await (supabase as any)
        .from('receipt_items')
        .insert(itemsInsertData as any)

      if (itemsResult.error) {
        setError('Bill created but failed to add items: ' + itemsResult.error.message)
        console.error(itemsResult.error)
      }

      // Navigate to the bill details page
      router.push(`/bills/${newBill.id}`)
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Bill</h1>
          <p className="text-gray-600 mt-1">Add items and confirm details</p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill Info Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Restaurant/Bill Name"
                placeholder="e.g., Thai Restaurant"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                >
                  <option value="THB">Thai Baht (฿)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="JPY">Japanese Yen (¥)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add Items Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Items</h2>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  label="Item Name"
                  placeholder="e.g., Tom Yum Goong"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />

                <Input
                  label="Quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                />

                <Input
                  label="Unit Price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={addItem}
                className="w-full px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
              >
                + Add Item
              </button>
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700">Items</h3>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {currency} {item.unitPrice.toFixed(2)} = {currency}{' '}
                        {(item.quantity * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="ml-4 p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charges Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Charges</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                label="VAT (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={vatPercent}
                onChange={(e) => setVatPercent(e.target.value)}
              />

              <Input
                label="Service Charge (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={serviceChargePercent}
                onChange={(e) => setServiceChargePercent(e.target.value)}
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium">{currency} {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">VAT ({vatPercent}%):</span>
                <span className="font-medium">{currency} {vat.toFixed(2)}</span>
              </div>
              {parseFloat(serviceChargePercent) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Service Charge ({serviceChargePercent}%):</span>
                  <span className="font-medium">{currency} {serviceCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-semibold text-blue-600">
                  {currency} {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" isLoading={loading} className="w-full">
              Create Bill
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
