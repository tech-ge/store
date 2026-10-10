import { NextResponse } from 'next/server'
import { connectMongo, Category } from '@dd/db-mongo'

export async function GET() {
  await connectMongo()
  const rows = await Category.find({ isActive: true }).sort({ order: 1 }).lean()
  return NextResponse.json({
    categories: rows.map((r: any) => ({ slug: r.slug, name: r.name }))
  })
}

export const dynamic = 'force-dynamic'
