import { notFound } from 'next/navigation'
import { connectMongo, KycRecord, User } from '@dd/db-mongo'
import { KycActions } from '@/components/admin/KycActions'

export const dynamic = 'force-dynamic'

interface KycLean {
  _id: unknown
  userId: unknown
  idNumberNormalized: string
  idPhotoUrl: string
  countryCode: string
  status: string
  submittedAt: Date
}

interface UserLean {
  _id: unknown
  fullName: string
  emailNormalized: string
  phone: string
  countryCode: string
  status: string
}

export default async function KycReview({ params }: { params: { userId: string } }) {
  await connectMongo()
  const kyc = await KycRecord.findOne({ userId: params.userId }).lean<KycLean | null>()
  const user = await User.findById(params.userId).lean<UserLean | null>()
  if (!kyc || !user) notFound()

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-xl text-navy mb-3">User details</h2>
        <dl className="text-sm space-y-2">
          <Row label="Name" value={user.fullName} />
          <Row label="Email" value={user.emailNormalized} />
          <Row label="Phone" value={user.phone} />
          <Row label="Country" value={user.countryCode} />
          <Row label="Status" value={user.status} />
          <Row label="ID number" value={kyc.idNumberNormalized} />
          <Row label="KYC status" value={kyc.status} />
        </dl>
      </div>
      <div className="bg-white rounded-xl border border-surface-border p-4">
        <h2 className="font-display text-xl text-navy mb-3">ID photo</h2>
        <img src={kyc.idPhotoUrl} alt="ID" className="w-full rounded-lg border border-surface-border" />
        {kyc.status === 'pending' && <KycActions userId={params.userId} />}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-navy font-medium">{value}</dd>
    </div>
  )
}
