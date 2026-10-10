import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl as awsSign } from '@aws-sdk/s3-request-presigner'

let s3: S3Client | null = null

function client() {
  if (!s3) {
    s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
      }
    })
  }
  return s3
}

export async function uploadToR2(params: {
  key: string
  body: Buffer | Uint8Array
  contentType: string
}) {
  await client().send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: params.key,
    Body: params.body,
    ContentType: params.contentType
  }))
  return `${process.env.R2_PUBLIC_URL}/${params.key}`
}

export async function signedDownloadUrl(key: string, expiresIn = 900) {
  return awsSign(
    client(),
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }),
    { expiresIn }
  )
}
