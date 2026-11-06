import { expect, test } from '@playwright/test'

import { login } from './helpers'

test.describe('Users administration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('creates a user and assigns the Admin role', async ({ page }) => {
    const stamp = Date.now()
    const name = `E2E Tester ${stamp}`
    const email = `e2e-${stamp}@example.com`
    const password = 'E2ePassw0rd!'

    await page.goto('/settings/users/new')

    await page.getByLabel('Name', { exact: true }).fill(name)
    await page.getByLabel('E-mail', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password', { exact: true }).fill(password)
    await page.getByRole('checkbox', { name: 'Admin' }).check()

    await page.getByRole('button', { name: 'Save' }).click()

    // Save redirects back to the users list.
    await expect(page).toHaveURL(/\/settings\/users$/, { timeout: 40_000 })

    // Find the new user by its unique email and confirm the role badge.
    await page.goto(`/settings/users?q=${encodeURIComponent(email)}`)
    const row = page.locator('tbody tr').filter({ hasText: email })
    await expect(row).toBeVisible({ timeout: 20_000 })
    await expect(row.getByText('Admin')).toBeVisible()
  })
})
