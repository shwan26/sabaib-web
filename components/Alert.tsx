import React from 'react'

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  title?: string
  onDismiss?: () => void
}

export function Alert({ type, message, title, onDismiss }: AlertProps) {
  const typeStyles = {
    success: 'bg-sabai-success/10 border-sabai-success text-sabai-navy-dark',
    error: 'bg-sabai-error-light border-sabai-error text-sabai-navy-dark',
    info: 'bg-sabai-navy/10 border-sabai-navy text-sabai-navy-dark',
    warning: 'bg-sabai-yellow-light/30 border-sabai-yellow-dark text-sabai-navy-dark',
  }

  const iconStyles = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }

  return (
    <div
      className={`border-l-4 rounded-r-lg p-4 flex items-start gap-3 ${typeStyles[type]}`}
    >
      <span className="text-xl font-bold">{iconStyles[type]}</span>
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-lg font-bold opacity-70 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  )
}
