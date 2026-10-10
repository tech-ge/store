import { loadEnv } from '../load-env'
loadEnv()

import { seedCategories } from './categories'
import { seedCountries } from './countries'

async function main() {
  await seedCategories()
  await seedCountries()
  console.log('all seeds complete')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
