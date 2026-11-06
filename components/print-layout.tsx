import type { CSSProperties } from 'react'

import { company } from '@/lib/company'

/** Cell style for the coloured summary tables (orange fill, navy borders). */
const summaryCell: CSSProperties = {
  border: '2px solid #052365',
  padding: 4,
  fontSize: 9,
}

const summaryCellBold: CSSProperties = { ...summaryCell, fontWeight: 700 }


export function PrintHeader({
  documentType,
  number,
  date,
}: {
  documentType: string
  number: string
  date: string
}) {
  return (
    <header className="print-header mb-3 flex justify-between gap-6">
      <div className="text-[9px] leading-tight">
        <p className="text-[11px] font-bold">{company.name}</p>
        <p>Mail: {company.mail}</p>
        <p>Website: {company.website}</p>
        <p>{company.address}</p>
        <p>Mobile: {company.mobile}</p>
      </div>
      <div className="text-right">
        <p className="text-[15px] font-bold italic" style={{ color: '#c00000' }}>
          {documentType}
        </p>
        <div className="mt-1 text-[9px] font-semibold leading-tight">
          <p>VRN: {company.vrn}</p>
          <p>TIN: {company.tin}</p>
        </div>
        <div className="mt-2 text-[9px] leading-tight">
          <p className="font-semibold">{number}</p>
          <p>{date}</p>
        </div>
      </div>
    </header>
  )
}

export function PrintDetails({
  heading,
  lines,
}: {
  heading: string
  lines: Array<string | null | undefined>
}) {
  return (
    <div className="mb-2 px-2 py-1 text-[9px] leading-tight" style={{ backgroundColor: '#C5E0B3' }}>
      <p className="font-bold">{heading}</p>
      {lines.filter((line): line is string => Boolean(line)).map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  )
}

export function PrintPurpose({ purpose }: { purpose: string | null | undefined }) {
  if (!purpose) {
    return null
  }
  return <p className="mb-2 text-center text-[9px]">For: {purpose.toUpperCase()}</p>
}

export type PrintTotals = {
  subtotal: number
  laborCharge: number
  vat: number
  withholding: number
  advance: number
  discount: number
  total: number
}

export function PrintFooter({
  showBank = false,
  showTotals = false,
  totals,
  currency = 'TZS',
}: {
  showBank?: boolean
  showTotals?: boolean
  totals?: PrintTotals
  currency?: string
}) {
  const money = (value: number) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`

  return (
    <div className="print-footer mt-3 text-[9px]">
      {showBank || (showTotals && totals) ? (
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td className="w-[55%] align-top" style={{ padding: 0 }}>
                {showBank ? (
                  <table
                    className="w-full"
                    style={{ borderCollapse: 'collapse', backgroundColor: '#eab76a', textAlign: 'center' }}
                  >
                    <tbody>
                      <tr>
                        <td colSpan={2} style={summaryCellBold}>{company.bank.accountName}</td>
                      </tr>
                      <tr><td style={summaryCellBold}>BANK NAME</td><td style={summaryCell}>{company.bank.bankName}</td></tr>
                      <tr><td style={summaryCellBold}>ACC. NUMBER TZS</td><td style={summaryCell}>{company.bank.accountTzs}</td></tr>
                      <tr><td style={summaryCellBold}>ACC. NUMBER USD</td><td style={summaryCell}>{company.bank.accountUsd}</td></tr>
                      <tr><td style={summaryCellBold}>SWIFT CODE</td><td style={summaryCell}>{company.bank.swift}</td></tr>
                      <tr><td style={summaryCellBold}>BRANCH CODE</td><td style={summaryCell}>{company.bank.branchCode}</td></tr>
                      <tr><td style={summaryCellBold}>BRANCH NAME</td><td style={summaryCell}>{company.bank.branchName}</td></tr>
                    </tbody>
                  </table>
                ) : null}
              </td>
              <td className="w-[5%]" style={{ padding: 0 }} />
              <td className="w-[40%] align-top" style={{ padding: 0 }}>
                {showTotals && totals ? (
                  <table
                    className="w-full"
                    style={{ borderCollapse: 'collapse', backgroundColor: '#eab76a', textAlign: 'right' }}
                  >
                    <tbody>
                      <tr><td style={summaryCell}>Material Cost</td><td style={summaryCellBold}>{money(totals.subtotal)}</td></tr>
                      <tr><td style={summaryCell}>Labor Charge</td><td style={summaryCellBold}>{money(totals.laborCharge)}</td></tr>
                      <tr><td style={summaryCell}>VAT Cost</td><td style={summaryCellBold}>{money(totals.vat)}</td></tr>
                      <tr><td style={summaryCell}>Withholding tax</td><td style={summaryCellBold}>-{money(totals.withholding)}</td></tr>
                      <tr><td style={summaryCell}>Advance</td><td style={summaryCellBold}>-{money(totals.advance)}</td></tr>
                      <tr><td style={summaryCell}>Discount</td><td style={summaryCellBold}>-{money(totals.discount)}</td></tr>
                      <tr style={{ backgroundColor: 'lightgray' }}>
                        <td style={summaryCellBold}>TOTAL COST</td>
                        <td style={summaryCellBold}>{money(totals.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>
      ) : null}

      <div className="mt-2 text-center text-[10px] font-bold" style={{ backgroundColor: '#9BC2E6' }}>
        TERMS AND CONDITIONS
      </div>
      <div className="grid grid-cols-2 gap-4 text-[7px] leading-snug">
        <ol className="list-decimal pl-4">
          {company.terms.slice(0, 5).map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ol>
        <ol start={6} className="list-decimal pl-4">
          {company.terms.slice(5).map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ol>
      </div>

      <div className="mt-2 text-center text-[8px] leading-tight">
        <p className="font-bold">Our services</p>
        <p>{company.services}</p>
      </div>
    </div>
  )
}
