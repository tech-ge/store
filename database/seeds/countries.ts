import { loadEnv } from '../load-env'
loadEnv()

import { connectMongo, CountryCurrency, Store } from '../../packages/db-mongo/src'

interface CountrySeed {
  countryCode: string
  countryName: string
  storeName: string
  dialCode: string
  currency: string
  currencySymbol: string
}

const DATA: CountrySeed[] = [
  { countryCode: 'KE', countryName: 'Kenya',          storeName: 'Kenyan Store',          dialCode: '+254', currency: 'KES', currencySymbol: 'KSh' },
  { countryCode: 'NG', countryName: 'Nigeria',        storeName: 'Nigerian Store',        dialCode: '+234', currency: 'NGN', currencySymbol: 'NGN' },
  { countryCode: 'ZA', countryName: 'South Africa',   storeName: 'South African Store',   dialCode: '+27',  currency: 'ZAR', currencySymbol: 'R' },
  { countryCode: 'EG', countryName: 'Egypt',          storeName: 'Egyptian Store',        dialCode: '+20',  currency: 'EGP', currencySymbol: 'E' },
  { countryCode: 'GH', countryName: 'Ghana',          storeName: 'Ghanaian Store',        dialCode: '+233', currency: 'GHS', currencySymbol: 'GHS' },
  { countryCode: 'UG', countryName: 'Uganda',         storeName: 'Ugandan Store',         dialCode: '+256', currency: 'UGX', currencySymbol: 'USh' },
  { countryCode: 'TZ', countryName: 'Tanzania',       storeName: 'Tanzanian Store',       dialCode: '+255', currency: 'TZS', currencySymbol: 'TSh' },
  { countryCode: 'US', countryName: 'United States',  storeName: 'American Store',        dialCode: '+1',   currency: 'USD', currencySymbol: '$' },
  { countryCode: 'GB', countryName: 'United Kingdom', storeName: 'British Store',         dialCode: '+44',  currency: 'GBP', currencySymbol: 'GBP' },
  { countryCode: 'IN', countryName: 'India',          storeName: 'Indian Store',          dialCode: '+91',  currency: 'INR', currencySymbol: 'INR' },
  { countryCode: 'BR', countryName: 'Brazil',         storeName: 'Brazilian Store',       dialCode: '+55',  currency: 'BRL', currencySymbol: 'R$' }
]

export async function seedCountries() {
  await connectMongo()

  for (const c of DATA) {
    await CountryCurrency.updateOne(
      { countryCode: c.countryCode },
      { $setOnInsert: { ...c, isActive: true } },
      { upsert: true }
    )

    await Store.updateOne(
      { countryCode: c.countryCode },
      {
        $set: {
          countryName: c.countryName,
          storeName: c.storeName,
          currency: c.currency,
          currencySymbol: c.currencySymbol
        },
        $setOnInsert: {
          countryCode: c.countryCode,
          cities: [],
          shippingBaseRateUsd: 5,
          isActive: true
        }
      },
      { upsert: true }
    )
  }

  console.log('countries + stores seeded:', DATA.length)
}

if (require.main === module) {
  seedCountries().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
}
