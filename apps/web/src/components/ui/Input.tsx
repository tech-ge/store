import { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx('w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white outline-none focus:border-brand', className)}
      {...rest}
    />
  )
}
