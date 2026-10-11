import { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx('min-h-11 w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted', className)}
      {...rest}
    />
  )
}
