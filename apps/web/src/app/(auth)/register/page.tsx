'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { COUNTRIES, findCountry } from '@/lib/data/countries'

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
    <Container className="max-w-md py-12">
      <h1 className="font-display text-2xl text-navy mb-6">Create account</h1>
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
            className="col-span-1 px-3 py-2.5 rounded-xl border border-surface-border bg-white outline-none focus:border-brand text-sm"
          >
            <option value="">Country</option>
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.name} (+{c.dial})
              </option>
            ))}
          </select>

          <div className="col-span-2 flex items-center gap-2">
            <span className="px-3 py-2.5 rounded-xl bg-surface-muted text-navy text-sm font-medium min-w-[64px] text-center">
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

        <div className="rounded-xl border border-dashed border-surface-border bg-white p-4">
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting…' : 'Create account'}
        </Button>

        <p className="text-xs text-text-muted text-center">
          By creating an account you agree to our terms and privacy policy.
        </p>
      </form>

      <p className="mt-4 text-sm text-text-muted text-center">
        Already have an account? <a href="/login" className="text-brand">Log in</a>
      </p>
    </Container>
  )
}
