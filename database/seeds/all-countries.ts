import 'dotenv/config'
import { connectMongo, CountryCurrency, Store } from '../../packages/db-mongo/src'
import { COUNTRIES } from '../../packages/config/src/data/countries'

function toStoreName(countryName: string): string {
  const map: Record<string, string> = {
    Kenya: 'Kenyan Store',
    Nigeria: 'Nigerian Store',
    'South Africa': 'South African Store',
    Egypt: 'Egyptian Store',
    Ghana: 'Ghanaian Store',
    Uganda: 'Ugandan Store',
    Tanzania: 'Tanzanian Store',
    'United States': 'American Store',
    'United Kingdom': 'British Store',
    India: 'Indian Store',
    Brazil: 'Brazilian Store',
    France: 'French Store',
    Germany: 'German Store',
    Italy: 'Italian Store',
    Spain: 'Spanish Store',
    Portugal: 'Portuguese Store',
    Greece: 'Greek Store',
    China: 'Chinese Store',
    Japan: 'Japanese Store',
    'South Korea': 'South Korean Store',
    Mexico: 'Mexican Store',
    Canada: 'Canadian Store',
    Australia: 'Australian Store',
    Turkey: 'Turkish Store',
    Russia: 'Russian Store',
    Netherlands: 'Dutch Store',
    Sweden: 'Swedish Store',
    Norway: 'Norwegian Store',
    Denmark: 'Danish Store',
    Finland: 'Finnish Store',
    Poland: 'Polish Store',
    Ireland: 'Irish Store',
    Switzerland: 'Swiss Store',
    Austria: 'Austrian Store',
    Belgium: 'Belgian Store',
    Israel: 'Israeli Store',
    'Saudi Arabia': 'Saudi Store',
    'United Arab Emirates': 'Emirati Store',
    Pakistan: 'Pakistani Store',
    Bangladesh: 'Bangladeshi Store',
    Indonesia: 'Indonesian Store',
    Philippines: 'Filipino Store',
    Vietnam: 'Vietnamese Store',
    Thailand: 'Thai Store',
    Malaysia: 'Malaysian Store',
    Singapore: 'Singaporean Store',
    Ethiopia: 'Ethiopian Store',
    Rwanda: 'Rwandan Store',
    Senegal: 'Senegalese Store',
    Morocco: 'Moroccan Store',
    Algeria: 'Algerian Store',
    Tunisia: 'Tunisian Store',
    Argentina: 'Argentine Store',
    Chile: 'Chilean Store',
    Colombia: 'Colombian Store',
    Peru: 'Peruvian Store'
  }
  return map[countryName] || `${countryName} Store`
}

const SYMBOLS: Record<string, string> = {
  USD: '$', KES: 'KSh', NGN: 'NGN', ZAR: 'R', EGP: 'E', GHS: 'GHS',
  UGX: 'USh', TZS: 'TSh', GBP: 'GBP', EUR: 'EUR', INR: 'INR', BRL: 'R$'
}

export async function seedAllCountries() {
  await connectMongo()

  let added = 0
  for (const c of COUNTRIES) {
    const currency = c.currency || 'USD'
    const storeName = toStoreName(c.name)

    await CountryCurrency.updateOne(
      { countryCode: c.code },
      {
        $set: {
          countryName: c.name,
          dialCode: `+${c.dial}`,
          currency,
          currencySymbol: SYMBOLS[currency] || currency
        },
        $setOnInsert: { isActive: true }
      },
      { upsert: true }
    )

    const r = await Store.updateOne(
      { countryCode: c.code },
      {
        $set: {
          countryName: c.name,
          storeName,
          currency,
          currencySymbol: SYMBOLS[currency] || currency
        },
        $setOnInsert: {
          countryCode: c.code,
          cities: [],
          shippingBaseRateUsd: 5,
          importMarkupPercent: 15,
          isActive: true
        }
      },
      { upsert: true }
    )
    if (r.upsertedCount) added++
  }

  const total = await Store.countDocuments({})
  console.log(`all countries seeded. newly added: ${added}. total stores: ${total}`)
}

if (require.main === module) {
  seedAllCountries().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
}
