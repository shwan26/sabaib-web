import { Suspense } from 'react'
import ConfirmClient from './ConfirmClient'

function ConfirmFallback() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600 mb-4"></div>
      <p className="text-gray-600">Confirming your email...</p>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<ConfirmFallback />}>
      <ConfirmClient />
    </Suspense>
  )
}
