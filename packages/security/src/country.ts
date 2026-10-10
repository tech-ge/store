import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function validatePhoneForCountry(phone: string, countryCode: string) {
  const parsed = parsePhoneNumberFromString(phone, countryCode as any)
  if (!parsed || !parsed.isValid()) return null
  if (parsed.country !== countryCode) return null
  return { e164: parsed.number, dialCode: `+${parsed.countryCallingCode}` }
}
