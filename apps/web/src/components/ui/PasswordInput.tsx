'use client'
import { useState, InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export function PasswordInput({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className={clsx(
          'w-full px-3 py-2.5 pr-14 rounded-xl border border-surface-border bg-white outline-none focus:border-brand',
          className
        )}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted hover:text-navy"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? 'HIDE' : 'SHOW'}
      </button>
    </div>
  )
}
