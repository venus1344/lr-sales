import { expect, test } from '@playwright/test'

import { login } from './helpers'

test.describe('Dashboard (UI)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('shows the income chart, recent projects and recent proformas', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Invoiced per month')).toBeVisible()
    await expect(page.getByRole('img', { name: 'Invoiced per month' })).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Recent projects' })).toBeVisible()
    await expect(page.getByText('SUPPLY AND INSTALLATION OF CCTV CAMERAS')).toBeVisible()

    // Recent proformas open the read-only document view, not the edit form.
    const card = page.locator('a', { hasText: 'WE/PF' }).first()
    await card.click()
    await expect(page).toHaveURL(/\/documents\/proformas\/\d+$/, { timeout: 40_000 })
  })
})
