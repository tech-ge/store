import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'ghost' | 'danger'

export function Button({
  variant = 'primary', className, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-500',
    ghost: 'bg-transparent text-navy hover:bg-surface-muted',
    danger: 'bg-red-600 text-white hover:bg-red-500'
  }
  return (
    <button
      className={clsx('px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50', styles[variant], className)}
      {...rest}
    />
  )
}
