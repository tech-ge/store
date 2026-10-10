import { NextResponse } from 'next/server'
import { connectMongo, User, KycRecord, Wallet, DuplicateAttempt, Store } from '@dd/db-mongo'
import { hashPassword, hashIdNumber, normalizeIdNumber, validatePhoneForCountry } from '@dd/security'
import { RegisterSchema } from '@dd/validation/src/auth'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { fullName, email, phone, countryCode, password, idNumber, idPhotoUrl } = parsed.data
  const emailNorm = email.trim().toLowerCase()
  const ua = req.headers.get('user-agent') || 'unknown'

  const phoneCheck = validatePhoneForCountry(phone, countryCode)
  if (!phoneCheck) return NextResponse.json({ error: 'Invalid phone for country' }, { status: 400 })

  await connectMongo()

  const [emailExists, phoneExists, idExists] = await Promise.all([
    User.exists({ emailNormalized: emailNorm }),
    User.exists({ phone: phoneCheck.e164 }),
    KycRecord.exists({
      idNumberHash: hashIdNumber(normalizeIdNumber(idNumber), countryCode),
      countryCode
    })
  ])

  if (emailExists) {
    await DuplicateAttempt.create({ type: 'email', valueHash: emailNorm, ip: '0.0.0.0', deviceFingerprint: 'unknown', userAgent: ua, countryCode })
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }
  if (phoneExists) {
    await DuplicateAttempt.create({ type: 'phone', valueHash: phoneCheck.e164, ip: '0.0.0.0', deviceFingerprint: 'unknown', userAgent: ua, countryCode })
    return NextResponse.json({ error: 'Phone already registered' }, { status: 409 })
  }
  if (idExists) {
    await DuplicateAttempt.create({ type: 'id_number', valueHash: hashIdNumber(normalizeIdNumber(idNumber), countryCode), ip: '0.0.0.0', deviceFingerprint: 'unknown', userAgent: ua, countryCode })
    return NextResponse.json({ error: 'ID already registered' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const idHash = hashIdNumber(normalizeIdNumber(idNumber), countryCode)
  const store: any = await Store.findOne({ countryCode }).lean()

  const user: any = await User.create({
    fullName, email: emailNorm, emailNormalized: emailNorm,
    passwordHash,
    idNumberEncrypted: normalizeIdNumber(idNumber),
    idNumberHash: idHash,
    phone: phoneCheck.e164, countryCode, dialCode: phoneCheck.dialCode,
    role: 'user', status: 'pending_kyc',
    defaultStoreId: store?._id
  })

  const kyc = await KycRecord.create({
    userId: user._id,
    idNumberEncrypted: normalizeIdNumber(idNumber),
    idNumberNormalized: normalizeIdNumber(idNumber),
    idNumberHash: idHash,
    idPhotoUrl, countryCode, status: 'pending'
  })

  const wallet = await Wallet.create({ userId: user._id, balances: { USD: 0 }, locked: { USD: 0 } })
  user.kycId = kyc._id
  user.walletId = wallet._id
  await user.save()

  return NextResponse.json({ userId: user._id, status: 'pending_kyc' }, { status: 201 })
}
