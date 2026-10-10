import { NextResponse } from 'next/server'
import { connectMongo, Product } from '@dd/db-mongo'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await connectMongo()
  let product = await Product.findById(params.id).lean().catch(() => null)
  if (!product) product = await Product.findOne({ slug: params.id }).lean()
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}
