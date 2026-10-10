import { connectMongo, CountryCurrency, Store } from '../../packages/db-mongo/src'

const DATA = [
  { countryCode: 'KE', countryName: 'Kenya',          dialCode: '+254', currency: 'KES', currencySymbol: 'KSh' },
  { countryCode: 'NG', countryName: 'Nigeria',        dialCode: '+234', currency: 'NGN', currencySymbol: 'NGN' },
  { countryCode: 'ZA', countryName: 'South Africa',   dialCode: '+27',  currency: 'ZAR', currencySymbol: 'R' },
  { countryCode: 'EG', countryName: 'Egypt',          dialCode: '+20',  currency: 'EGP', currencySymbol: 'E' },
  { countryCode: 'GH', countryName: 'Ghana',          dialCode: '+233', currency: 'GHS', currencySymbol: 'GHS' },
  { countryCode: 'UG', countryName: 'Uganda',         dialCode: '+256', currency: 'UGX', currencySymbol: 'USh' },
  { countryCode: 'TZ', countryName: 'Tanzania',       dialCode: '+255', currency: 'TZS', currencySymbol: 'TSh' },
  { countryCode: 'US', countryName: 'United States',  dialCode: '+1',   currency: 'USD', currencySymbol: '$' },
  { countryCode: 'GB', countryName: 'United Kingdom', dialCode: '+44',  currency: 'GBP', currencySymbol: 'GBP' },
  { countryCode: 'IN', countryName: 'India',          dialCode: '+91',  currency: 'INR', currencySymbol: 'INR' },
  { countryCode: 'BR', countryName: 'Brazil',         dialCode: '+55',  currency: 'BRL', currencySymbol: 'R$' }
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
        $setOnInsert: {
          countryCode: c.countryCode,
          countryName: c.countryName,
          currency: c.currency,
          currencySymbol: c.currencySymbol,
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
