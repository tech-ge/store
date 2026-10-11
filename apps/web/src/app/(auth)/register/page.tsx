'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { COUNTRIES, findCountry } from '@/lib/data/countries'
import { Logo } from '@/components/brand/Logo'
import { Icon } from '@/components/ui/Icon'

async function readJson(res: Response) {
  const text = await res.text()
  try { return JSON.parse(text) } catch { return { error: text.slice(0, 200) || res.statusText } }
}

export default function RegisterPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [phoneLocal, setPhoneLocal] = useState('')
  const [password, setPassword] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const country = useMemo(() => findCountry(countryCode), [countryCode])
  const dial = country ? `+${country.dial}` : '+'

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    setIdFile(f)
    if (f) setPreview(URL.createObjectURL(f))
    else setPreview('')
  }

  async function uploadIdPhoto(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/kyc/upload-public', { method: 'POST', body: fd })
    const data = await readJson(res)
    if (!res.ok) throw new Error(data.error || 'Photo upload failed')
    return data.url as string
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!country) return setError('Select your country')
    if (!idFile) return setError('Upload a photo of your ID')
    if (phoneLocal.replace(/\D/g, '').length < 6) return setError('Enter a valid phone number')

    setLoading(true)
    try {
      const idPhotoUrl = await uploadIdPhoto(idFile)
      const phone = `+${country.dial}${phoneLocal.replace(/\D/g, '')}`

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          countryCode: country.code,
          password,
          idNumber,
          idPhotoUrl
        })
      })
      const data = await readJson(res)
      setLoading(false)

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }
      router.push('/login?registered=1')
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Something went wrong')
    }
  }

  return (
    <main className="account-scene min-h-screen px-4 py-8 sm:py-12">
      <section className="mx-auto w-full max-w-xl rounded-3xl border border-white/80 bg-white/90 p-5 shadow-[0_24px_80px_rgba(11,31,58,0.10)] backdrop-blur-xl sm:p-9">
        <Logo size={38} />
        <div className="mb-7 mt-8">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand"><Icon name="sparkles" size={22} /></div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">Your next great find awaits</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">Join a global community of shoppers and independent sellers.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            placeholder="Full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-3 gap-2">
            <select
              value={countryCode}
              onChange={e => setCountryCode(e.target.value)}
              required
              className="col-span-1 min-w-0 rounded-xl border border-surface-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"
            >
              <option value="">Country</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name} (+{c.dial})
                </option>
              ))}
            </select>

            <div className="col-span-2 flex min-w-0 items-center gap-2">
              <span className="min-w-[64px] rounded-xl bg-surface-muted px-3 py-2.5 text-center text-sm font-medium text-navy">
                {dial}
              </span>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="Phone number"
                value={phoneLocal}
                onChange={e => setPhoneLocal(e.target.value.replace(/[^\d\s]/g, ''))}
                required
              />
            </div>
          </div>

          <PasswordInput
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <Input
            placeholder="ID number (as printed on your ID)"
            value={idNumber}
            onChange={e => setIdNumber(e.target.value)}
            required
          />

          <div className="rounded-2xl border border-dashed border-surface-border bg-surface-muted/50 p-4">
            <label className="text-sm text-navy font-medium block mb-2">
              Upload photo of your ID (front)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onFile}
              required
              className="block w-full text-sm text-text-muted"
            />
            {preview && (
              <img
                src={preview}
                alt="ID preview"
                className="mt-3 w-full max-h-64 object-contain rounded-lg border border-surface-border"
              />
            )}
            <p className="text-xs text-text-muted mt-2">
              Make sure the ID number is clearly readable. Admin will review and activate your account.
            </p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button type="submit" disabled={loading} className="min-h-12 w-full !rounded-xl !font-semibold">
            {loading ? 'Submitting…' : 'Create account'}
          </Button>

          <p className="text-xs text-text-muted text-center">
            By creating an account you agree to our terms and privacy policy.
          </p>
        </form>

        <p className="mt-5 text-center text-sm text-text-muted">
          Already have an account? <a href="/login" className="font-semibold text-brand">Sign in</a>
        </p>
      </section>
    </main>
  )
}
