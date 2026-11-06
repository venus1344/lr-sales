export const company = {
  name: 'WeLink Contracting Limited',
  address: 'P.0.Box 10085, Arusha-Tanzania.',
  contact: 'info@welink.co.tz',
  mail: 'info@welink.co.tz',
  website: 'www.welink.co.tz',
  mobile: '+255 684 904 000 / +255 769 588 103',
  vrn: '40-038288-K',
  tin: '140-998-575',
  bank: {
    accountName: 'WELINK CONTRACTING LIMITED',
    bankName: 'NBC',
    accountTzs: '014101008403',
    accountUsd: '014105012206',
    swift: 'NLCBTZTX',
    branchCode: '014',
    branchName: 'ARUSHA',
  },
  terms: [
    'This quotation is valid for 30 days from the date of issue',
    'Payment overdue accounts will be charged at 3% per month',
    'Prices are net FOB source. We can arrange for the delivery of the goods at an additional cost for all towns outside our delivery footage.',
    'E & OE - WeLink reserves the right to correct any errors',
    'Installation not included unless otherwise stated.',
    'Delivery of stocked items: Immediately on cash payment or on clearing of Cheque',
    'All hardware carries a minimum of one year warranty on factory defects',
    '75% payment upon order confirmation',
    'Specification: Our quotation covers the items of equipment specified only and does not cover any alterations or addition that may be necessary to either new or existing building or installations',
    'Relation of title: Title and right of property of the product shall pass to the buyer only after the product has been paid in full to the seller',
  ],
  services:
    'Intercom (PBX & VOIP) | LAN | WAN | Fiber Network solution | Computer Hardware & Software maintenance | CCTV & security systems | Electric Fence | Website design and hosting VSAT Satellite | Internet Services | Solar power systems | Fleet and animal tracking using LoRaWAN technology/4G LTE-M with 2G fall back, Global band | Installation of Motorola Radios VHF systems.',
} as const

/** Format a date like the original PDFs: "November-06-2026". */
export function formatPrintDate(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return `${months[date.getMonth()]}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`
}
