import { expect, test, type Page } from '@playwright/test'

import { login, pickCombobox, stubPrint, wasPrinted } from './helpers'

const CUSTOMER_QUERY = 'TANZANIA NATIONAL PARKS'
const ITEM_QUERY = '17mm'

async function selectCustomer(page: Page) {
  await pickCombobox(page, 'Search customers…', CUSTOMER_QUERY)
}

async function addItem(page: Page) {
  await page.getByRole('button', { name: 'Add item' }).click()
  await pickCombobox(page, 'Item…', ITEM_QUERY)
}

test.describe('Documents (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('creates a proforma and prints it', async ({ page }) => {
    await page.goto('/documents/proformas/new')

    await selectCustomer(page)
    await page.getByLabel('Date', { exact: true }).fill('2026-02-01')
    await page.getByLabel('Purpose', { exact: true }).fill('E2E TEST PROFORMA')
    await addItem(page)

    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/documents\/proformas$/, { timeout: 40_000 })

    // Rows open the view page; the document number is shown there.
    await page.locator('tbody tr').first().click()
    await expect(page).toHaveURL(/\/documents\/proformas\/\d+$/, { timeout: 40_000 })
    await expect(page.getByRole('heading', { name: 'Proforma invoice' })).toBeVisible()
    await expect(page.getByText(/WE\/PF/).first()).toBeVisible()

    await page.getByRole('link', { name: 'Print' }).click()

    await expect(page).toHaveURL(/\/documents\/proformas\/\d+\/print$/, { timeout: 40_000 })
    await expect(page.getByText(CUSTOMER_QUERY).first()).toBeVisible()

    // The document header and the large footer (bank + terms + services) render.
    await expect(page.getByText('VRN:', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('TERMS AND CONDITIONS')).toBeVisible()
    await expect(page.getByText('BANK NAME')).toBeVisible()
    await expect(page.getByText('Our services')).toBeVisible()

    await stubPrint(page)
    await page.getByRole('button', { name: 'Print / Save as PDF' }).click()
    await expect.poll(() => wasPrinted(page)).toBe(true)
  })

  test('creates an invoice', async ({ page }) => {
    await page.goto('/documents/invoices/new')

    await selectCustomer(page)
    await page.getByLabel('Date', { exact: true }).fill('2026-02-02')
    await page.getByLabel('Purpose', { exact: true }).fill('E2E TEST INVOICE')
    await addItem(page)

    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/documents\/invoices$/, { timeout: 40_000 })
  })

  test('creates a delivery note', async ({ page }) => {
    await page.goto('/documents/delivery-notes/new')

    await page.getByLabel('Date', { exact: true }).fill('2026-02-03')
    await selectCustomer(page)
    await addItem(page)

    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/documents\/delivery-notes$/, { timeout: 40_000 })
  })
})
