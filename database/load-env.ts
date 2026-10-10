import fs from 'fs'
import path from 'path'

export function loadEnv() {
  const root = path.resolve(__dirname, '..')
  const files = ['.env', '.env.local', 'apps/web/.env.local']
  for (const f of files) {
    const p = path.join(root, f)
    if (!fs.existsSync(p)) continue
    const content = fs.readFileSync(p, 'utf8')
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
      if (!m) continue
      const key = m[1]
      let val = m[2].trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  }
}
