import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'

// load .env manually
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const uri = process.env.MONGODB_URI
if (!uri) { console.error('MONGODB_URI missing'); process.exit(1) }

const mongoosePath = require.resolve('mongoose', { paths: [path.join(process.cwd(), 'apps/web')] })
const mongooseModule = await import(mongoosePath)

const StoreSchema = new mongooseModule.default.Schema({
  countryCode: { type: String, required: true, unique: true, index: true },
  countryName: String,
  storeName: String,
  currency: String,
  currencySymbol: String,
  cities: [{ name: String, lat: Number, lng: Number, _id: false }],
  shippingBaseRateUsd: { type: Number, default: 5 },
  importMarkupPercent: { type: Number, default: 15 },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true })

const Store = mongooseModule.default.models.Store || mongooseModule.default.model('Store', StoreSchema)

const COUNTRIES = [
  ['AF','Afghanistan','93','AFN','AFN'],['AL','Albania','355','ALL','ALL'],['DZ','Algeria','213','DZD','DZD'],
  ['AD','Andorra','376','EUR','EUR'],['AO','Angola','244','AOA','AOA'],['AR','Argentina','54','ARS','ARS'],
  ['AM','Armenia','374','AMD','AMD'],['AU','Australia','61','AUD','AUD'],['AT','Austria','43','EUR','EUR'],
  ['AZ','Azerbaijan','994','AZN','AZN'],['BH','Bahrain','973','BHD','BHD'],['BD','Bangladesh','880','BDT','BDT'],
  ['BB','Barbados','1246','BBD','BBD'],['BY','Belarus','375','BYN','BYN'],['BE','Belgium','32','EUR','EUR'],
  ['BZ','Belize','501','BZD','BZD'],['BJ','Benin','229','XOF','XOF'],['BT','Bhutan','975','BTN','BTN'],
  ['BO','Bolivia','591','BOB','BOB'],['BA','Bosnia and Herzegovina','387','BAM','BAM'],['BW','Botswana','267','BWP','BWP'],
  ['BR','Brazil','55','BRL','R$'],['BN','Brunei','673','BND','BND'],['BG','Bulgaria','359','BGN','BGN'],
  ['BF','Burkina Faso','226','XOF','XOF'],['BI','Burundi','257','BIF','BIF'],['KH','Cambodia','855','KHR','KHR'],
  ['CM','Cameroon','237','XAF','XAF'],['CA','Canada','1','CAD','CAD'],['CV','Cape Verde','238','CVE','CVE'],
  ['CF','Central African Republic','236','XAF','XAF'],['TD','Chad','235','XAF','XAF'],['CL','Chile','56','CLP','CLP'],
  ['CN','China','86','CNY','CNY'],['CO','Colombia','57','COP','COP'],['KM','Comoros','269','KMF','KMF'],
  ['CG','Congo','242','XAF','XAF'],['CD','Congo (DRC)','243','CDF','CDF'],['CR','Costa Rica','506','CRC','CRC'],
  ['CI',"Côte d'Ivoire",'225','XOF','XOF'],['HR','Croatia','385','EUR','EUR'],['CU','Cuba','53','CUP','CUP'],
  ['CY','Cyprus','357','EUR','EUR'],['CZ','Czechia','420','CZK','CZK'],['DK','Denmark','45','DKK','DKK'],
  ['DJ','Djibouti','253','DJF','DJF'],['DM','Dominica','1767','XCD','XCD'],['DO','Dominican Republic','1809','DOP','DOP'],
  ['EC','Ecuador','593','USD','$'],['EG','Egypt','20','EGP','E'],['SV','El Salvador','503','USD','$'],
  ['GQ','Equatorial Guinea','240','XAF','XAF'],['ER','Eritrea','291','ERN','ERN'],['EE','Estonia','372','EUR','EUR'],
  ['SZ','Eswatini','268','SZL','SZL'],['ET','Ethiopia','251','ETB','ETB'],['FJ','Fiji','679','FJD','FJD'],
  ['FI','Finland','358','EUR','EUR'],['FR','France','33','EUR','EUR'],['GA','Gabon','241','XAF','XAF'],
  ['GM','Gambia','220','GMD','GMD'],['GE','Georgia','995','GEL','GEL'],['DE','Germany','49','EUR','EUR'],
  ['GH','Ghana','233','GHS','GHS'],['GR','Greece','30','EUR','EUR'],['GD','Grenada','1473','XCD','XCD'],
  ['GT','Guatemala','502','GTQ','GTQ'],['GN','Guinea','224','GNF','GNF'],['GW','Guinea-Bissau','245','XOF','XOF'],
  ['GY','Guyana','592','GYD','GYD'],['HT','Haiti','509','HTG','HTG'],['HN','Honduras','504','HNL','HNL'],
  ['HK','Hong Kong','852','HKD','HKD'],['HU','Hungary','36','HUF','HUF'],['IS','Iceland','354','ISK','ISK'],
  ['IN','India','91','INR','INR'],['ID','Indonesia','62','IDR','IDR'],['IR','Iran','98','IRR','IRR'],
  ['IQ','Iraq','964','IQD','IQD'],['IE','Ireland','353','EUR','EUR'],['IL','Israel','972','ILS','ILS'],
  ['IT','Italy','39','EUR','EUR'],['JM','Jamaica','1876','JMD','JMD'],['JP','Japan','81','JPY','JPY'],
  ['JO','Jordan','962','JOD','JOD'],['KZ','Kazakhstan','7','KZT','KZT'],['KE','Kenya','254','KES','KSh'],
  ['KI','Kiribati','686','AUD','AUD'],['KW','Kuwait','965','KWD','KWD'],['KG','Kyrgyzstan','996','KGS','KGS'],
  ['LA','Laos','856','LAK','LAK'],['LV','Latvia','371','EUR','EUR'],['LB','Lebanon','961','LBP','LBP'],
  ['LS','Lesotho','266','LSL','LSL'],['LR','Liberia','231','LRD','LRD'],['LY','Libya','218','LYD','LYD'],
  ['LI','Liechtenstein','423','CHF','CHF'],['LT','Lithuania','370','EUR','EUR'],['LU','Luxembourg','352','EUR','EUR'],
  ['MO','Macau','853','MOP','MOP'],['MG','Madagascar','261','MGA','MGA'],['MW','Malawi','265','MWK','MWK'],
  ['MY','Malaysia','60','MYR','MYR'],['MV','Maldives','960','MVR','MVR'],['ML','Mali','223','XOF','XOF'],
  ['MT','Malta','356','EUR','EUR'],['MH','Marshall Islands','692','USD','$'],['MR','Mauritania','222','MRU','MRU'],
  ['MU','Mauritius','230','MUR','MUR'],['MX','Mexico','52','MXN','MXN'],['FM','Micronesia','691','USD','$'],
  ['MD','Moldova','373','MDL','MDL'],['MC','Monaco','377','EUR','EUR'],['MN','Mongolia','976','MNT','MNT'],
  ['ME','Montenegro','382','EUR','EUR'],['MA','Morocco','212','MAD','MAD'],['MZ','Mozambique','258','MZN','MZN'],
  ['MM','Myanmar','95','MMK','MMK'],['NA','Namibia','264','NAD','NAD'],['NR','Nauru','674','AUD','AUD'],
  ['NP','Nepal','977','NPR','NPR'],['NL','Netherlands','31','EUR','EUR'],['NZ','New Zealand','64','NZD','NZD'],
  ['NI','Nicaragua','505','NIO','NIO'],['NE','Niger','227','XOF','XOF'],['NG','Nigeria','234','NGN','NGN'],
  ['KP','North Korea','850','KPW','KPW'],['MK','North Macedonia','389','MKD','MKD'],['NO','Norway','47','NOK','NOK'],
  ['OM','Oman','968','OMR','OMR'],['PK','Pakistan','92','PKR','PKR'],['PW','Palau','680','USD','$'],
  ['PS','Palestine','970','ILS','ILS'],['PA','Panama','507','PAB','PAB'],['PG','Papua New Guinea','675','PGK','PGK'],
  ['PY','Paraguay','595','PYG','PYG'],['PE','Peru','51','PEN','PEN'],['PH','Philippines','63','PHP','PHP'],
  ['PL','Poland','48','PLN','PLN'],['PT','Portugal','351','EUR','EUR'],['QA','Qatar','974','QAR','QAR'],
  ['RO','Romania','40','RON','RON'],['RU','Russia','7','RUB','RUB'],['RW','Rwanda','250','RWF','RWF'],
  ['KN','Saint Kitts and Nevis','1869','XCD','XCD'],['LC','Saint Lucia','1758','XCD','XCD'],
  ['VC','Saint Vincent and the Grenadines','1784','XCD','XCD'],['WS','Samoa','685','WST','WST'],
  ['SM','San Marino','378','EUR','EUR'],['ST','São Tomé and Príncipe','239','STN','STN'],
  ['SA','Saudi Arabia','966','SAR','SAR'],['SN','Senegal','221','XOF','XOF'],['RS','Serbia','381','RSD','RSD'],
  ['SC','Seychelles','248','SCR','SCR'],['SL','Sierra Leone','232','SLE','SLE'],['SG','Singapore','65','SGD','SGD'],
  ['SK','Slovakia','421','EUR','EUR'],['SI','Slovenia','386','EUR','EUR'],['SB','Solomon Islands','677','SBD','SBD'],
  ['SO','Somalia','252','SOS','SOS'],['ZA','South Africa','27','ZAR','R'],['KR','South Korea','82','KRW','KRW'],
  ['SS','South Sudan','211','SSP','SSP'],['ES','Spain','34','EUR','EUR'],['LK','Sri Lanka','94','LKR','LKR'],
  ['SD','Sudan','249','SDG','SDG'],['SR','Suriname','597','SRD','SRD'],['SE','Sweden','46','SEK','SEK'],
  ['CH','Switzerland','41','CHF','CHF'],['SY','Syria','963','SYP','SYP'],['TW','Taiwan','886','TWD','TWD'],
  ['TJ','Tajikistan','992','TJS','TJS'],['TZ','Tanzania','255','TZS','TSh'],['TH','Thailand','66','THB','THB'],
  ['TL','Timor-Leste','670','USD','$'],['TG','Togo','228','XOF','XOF'],['TO','Tonga','676','TOP','TOP'],
  ['TT','Trinidad and Tobago','1868','TTD','TTD'],['TN','Tunisia','216','TND','TND'],['TR','Turkey','90','TRY','TRY'],
  ['TM','Turkmenistan','993','TMT','TMT'],['TV','Tuvalu','688','AUD','AUD'],['UG','Uganda','256','UGX','USh'],
  ['UA','Ukraine','380','UAH','UAH'],['AE','United Arab Emirates','971','AED','AED'],
  ['GB','United Kingdom','44','GBP','GBP'],['US','United States','1','USD','$'],
  ['UY','Uruguay','598','UYU','UYU'],['UZ','Uzbekistan','998','UZS','UZS'],['VU','Vanuatu','678','VUV','VUV'],
  ['VE','Venezuela','58','VES','VES'],['VN','Vietnam','84','VND','VND'],['YE','Yemen','967','YER','YER'],
  ['ZM','Zambia','260','ZMW','ZMW'],['ZW','Zimbabwe','263','ZWL','ZWL']
]

function toStoreName(name) {
  const map = {
    Kenya:'Kenyan Store', Nigeria:'Nigerian Store', 'South Africa':'South African Store',
    Egypt:'Egyptian Store', Ghana:'Ghanaian Store', Uganda:'Ugandan Store', Tanzania:'Tanzanian Store',
    'United States':'American Store', 'United Kingdom':'British Store', India:'Indian Store', Brazil:'Brazilian Store',
    France:'French Store', Germany:'German Store', Italy:'Italian Store', Spain:'Spanish Store',
    Portugal:'Portuguese Store', Greece:'Greek Store', China:'Chinese Store', Japan:'Japanese Store',
    'South Korea':'South Korean Store', Mexico:'Mexican Store', Canada:'Canadian Store',
    Australia:'Australian Store', Turkey:'Turkish Store', Russia:'Russian Store', Netherlands:'Dutch Store',
    Sweden:'Swedish Store', Norway:'Norwegian Store', Denmark:'Danish Store', Finland:'Finnish Store',
    Poland:'Polish Store', Ireland:'Irish Store', Switzerland:'Swiss Store', Austria:'Austrian Store',
    Belgium:'Belgian Store', Israel:'Israeli Store', 'Saudi Arabia':'Saudi Store',
    'United Arab Emirates':'Emirati Store', Pakistan:'Pakistani Store', Bangladesh:'Bangladeshi Store',
    Indonesia:'Indonesian Store', Philippines:'Filipino Store', Vietnam:'Vietnamese Store',
    Thailand:'Thai Store', Malaysia:'Malaysian Store', Singapore:'Singaporean Store',
    Ethiopia:'Ethiopian Store', Rwanda:'Rwandan Store', Senegal:'Senegalese Store',
    Morocco:'Moroccan Store', Algeria:'Algerian Store', Tunisia:'Tunisian Store',
    Argentina:'Argentine Store', Chile:'Chilean Store', Colombia:'Colombian Store', Peru:'Peruvian Store'
  }
  return map[name] || `${name} Store`
}

async function main() {
  await mongooseModule.default.connect(uri)
  let added = 0
  for (const [code, name, dial, currency, symbol] of COUNTRIES) {
    const r = await Store.updateOne(
      { countryCode: code },
      {
        $set: { countryName: name, storeName: toStoreName(name), currency, currencySymbol: symbol },
        $setOnInsert: {
          countryCode: code,
          cities: [],
          shippingBaseRateUsd: 5,
          importMarkupPercent: code === 'US' || code === 'GB' ? 0 : 15,
          isActive: true
        }
      },
      { upsert: true }
    )
    if (r.upsertedCount) added++
  }
  const total = await Store.countDocuments({})
  console.log(`stores added: ${added}. total in DB: ${total}`)
  await mongooseModule.default.disconnect()
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
