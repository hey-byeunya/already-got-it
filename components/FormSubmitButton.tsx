'use client'

import { useFormStatus } from 'react-dom'
import type { ReactNode } from 'react'

interface FormSubmitButtonProps {
  children: ReactNode
  className?: string
  ariaLabel?: string
  title?: string
}

export default function FormSubmitButton({ children, className, ariaLabel, title }: FormSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={ariaLabel}
      title={title}
      className={`${className ?? ''} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  )
}
