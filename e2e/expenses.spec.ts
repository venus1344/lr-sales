import { expect, test } from '@playwright/test'

import { login } from './helpers'

test.describe('Expenses (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('keeps receipts private: signed-in users can open them, anonymous cannot', async ({
    page,
    request,
  }) => {
    await page.goto('/expenses/new')

    await page.getByLabel('Requested by').selectOption({ index: 1 })
    await page.getByLabel('Income account').selectOption({ index: 1 })
    await page.getByLabel('Expense account').selectOption({ index: 1 })
    await page.getByLabel('Receipt number').fill(`E2E-RCPT-${Date.now()}`)
    await page.getByLabel('Amount').fill('1500')
    await page.getByLabel('Narration').fill('E2E receipt privacy check')
    await page.getByLabel('Receipt file').setInputFiles({
      name: 'receipt.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n% test receipt\n'),
    })

    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/expenses$/, { timeout: 40_000 })

    const link = page.locator('a[href^="/api/receipts/"]').first()
    await expect(link).toBeVisible()
    const href = await link.getAttribute('href')
    expect(href).toMatch(/^\/api\/receipts\/[0-9a-f-]{36}\.pdf$/)

    // The link is a private route, not a public file.
    expect(href).not.toMatch(/(^|\/)uploads\//)

    const url = new URL(href!, page.url()).toString()

    const signedIn = await page.request.get(url)
    expect(signedIn.status()).toBe(200)
    expect(signedIn.headers()['content-type']).toBe('application/pdf')

    const anonymous = await request.get(url)
    expect(anonymous.status()).toBe(401)
  })
})
