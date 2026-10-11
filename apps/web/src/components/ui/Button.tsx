import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'ghost' | 'danger'

export function Button({
  variant = 'primary', className, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles = {
    primary: 'bg-brand text-white shadow-sm shadow-brand/15 hover:bg-brand-600 hover:shadow-md',
    ghost: 'bg-transparent text-navy hover:bg-surface-muted',
    danger: 'bg-red-600 text-white hover:bg-red-500'
  }
  return (
    <button
      className={clsx('inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-px', styles[variant], className)}
      {...rest}
    />
  )
}
