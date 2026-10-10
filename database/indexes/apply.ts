import { loadEnv } from '../load-env'
loadEnv()

import { applyUserIndexes } from './users.indexes'
import { applyProductIndexes } from './products.indexes'
import { applyOrderIndexes } from './orders.indexes'

async function main() {
  await applyUserIndexes()
  await applyProductIndexes()
  await applyOrderIndexes()
  console.log('all indexes applied')
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
