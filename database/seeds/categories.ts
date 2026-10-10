import { loadEnv } from '../load-env'
loadEnv()

import { connectMongo, Category } from '../../packages/db-mongo/src'

const DATA = [
  { slug: 'phones-tablets',     name: 'Phones and Tablets',    order: 1 },
  { slug: 'computers',          name: 'Computers and Accessories', order: 2 },
  { slug: 'electronics',        name: 'Electronics',           order: 3 },
  { slug: 'audio-headphones',   name: 'Audio and Headphones',  order: 4 },
  { slug: 'home-kitchen',       name: 'Home and Kitchen',      order: 5 },
  { slug: 'fashion-men',        name: 'Men Fashion',           order: 6 },
  { slug: 'fashion-women',      name: 'Women Fashion',         order: 7 },
  { slug: 'shoes',              name: 'Shoes',                 order: 8 },
  { slug: 'beauty-health',      name: 'Beauty and Health',     order: 9 },
  { slug: 'baby-kids',          name: 'Baby and Kids',         order: 10 },
  { slug: 'sports-outdoors',    name: 'Sports and Outdoors',   order: 11 },
  { slug: 'gaming',             name: 'Gaming',                order: 12 },
  { slug: 'books-stationery',   name: 'Books and Stationery',  order: 13 },
  { slug: 'grocery',            name: 'Grocery',               order: 14 },
  { slug: 'automotive',         name: 'Automotive',            order: 15 },
  { slug: 'pet-supplies',       name: 'Pet Supplies',          order: 16 }
]

export async function seedCategories() {
  await connectMongo()
  for (const c of DATA) {
    await Category.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true })
  }
  console.log('categories seeded:', DATA.length)
}

if (require.main === module) {
  seedCategories().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
}
