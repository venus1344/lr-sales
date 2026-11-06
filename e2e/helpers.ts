import { expect, type Page } from '@playwright/test'

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'info@welink.co.tz'
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Welink@2026'

/** Sign in through the UI and wait until we leave the sign-in page. */
export async function login(page: Page, email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
  await page.goto('/signin')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).not.toHaveURL(/\/signin$/, { timeout: 40_000 })
}

/** Escape a string so it can be embedded in a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Type into a server-backed combobox and pick the option matching the query.
 * The combobox opens on focus (showing the unfiltered list) and re-queries on a
 * debounce, so we wait for an option whose label matches the query before
 * clicking — otherwise the first (unfiltered) option gets chosen.
 */
export async function pickCombobox(page: Page, placeholder: string, query: string) {
  const input = page.getByPlaceholder(placeholder).first()
  await input.click()
  await input.fill(query)

  const listbox = page.getByRole('listbox')
  await expect(listbox).toBeVisible({ timeout: 20_000 })

  const option = listbox.getByRole('button', { name: new RegExp(escapeRegExp(query), 'i') }).first()
  await expect(option).toBeVisible({ timeout: 20_000 })
  await option.click()

  // Selection clears the menu; the input now shows the chosen label.
  await expect(input).not.toBeEmpty()
}

/** Stub `window.print()` on the current document so the print action can be verified without a dialog. */
export async function stubPrint(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { print: () => void; __printed?: boolean }
    w.print = () => {
      w.__printed = true
    }
  })
}

export async function wasPrinted(page: Page): Promise<boolean> {
  return page.evaluate(() => Boolean((window as unknown as { __printed?: boolean }).__printed))
}
