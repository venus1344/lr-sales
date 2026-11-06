import { expect, test } from '@playwright/test'

import { login } from './helpers'

test.describe('Master data (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('opens a customer as a record page and returns there from edit actions', async ({
    page,
  }) => {
    const name = `E2E Customer ${Date.now()}`

    await page.goto('/settings/customers/new')
    await page.getByLabel('Name').fill(name)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(/\/settings\/customers$/, { timeout: 40_000 })

    // Rows open the read-only record page.
    await page.goto(`/settings/customers?q=${encodeURIComponent(name)}`)
    await page.locator('tbody tr').first().click()
    await expect(page).toHaveURL(/\/settings\/customers\/\d+$/, { timeout: 40_000 })
    await expect(page.getByRole('heading', { name })).toBeVisible()
    const viewUrl = page.url()

    // Edit -> Cancel returns to the record.
    await page.getByRole('link', { name: 'Edit' }).click()
    await expect(page).toHaveURL(/\/settings\/customers\/\d+\/edit$/, { timeout: 40_000 })
    await page.getByRole('link', { name: 'Cancel' }).click()
    await expect(page).toHaveURL(viewUrl, { timeout: 40_000 })

    // Edit -> Save returns to the record and confirms with a toast.
    await page.getByRole('link', { name: 'Edit' }).click()
    await expect(page).toHaveURL(/\/settings\/customers\/\d+\/edit$/, { timeout: 40_000 })
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page).toHaveURL(viewUrl, { timeout: 40_000 })
    await expect(page.getByText('Customer updated')).toBeVisible()

    // Delete returns to the list.
    await page.getByRole('button', { name: 'Delete' }).click()
    await expect(page).toHaveURL(/\/settings\/customers$/, { timeout: 40_000 })
    await expect(page.getByText('Customer deleted')).toBeVisible()
  })
})
