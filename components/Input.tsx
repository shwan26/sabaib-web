import React from 'react'
import { useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  containerClassName?: string
}

export function Input({
  label,
  error,
  containerClassName = '',
  className = '',
  id,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 border-2 border-sabai-light-gray rounded-lg
          focus:outline-none focus:border-sabai-navy focus:ring-1 focus:ring-sabai-navy-light
          disabled:bg-sabai-off-white disabled:cursor-not-allowed
          ${error ? 'border-sabai-error focus:border-sabai-error' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
