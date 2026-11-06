import { expect, test } from '@playwright/test'

import { login } from './helpers'

test.describe('Password visibility', () => {
  test('the sign-in password can be shown and hidden', async ({ page }) => {
    await page.goto('/signin')

    const password = page.getByLabel('Password', { exact: true })
    await password.fill('secret-value')

    await expect(password).toHaveAttribute('type', 'password')

    await page.getByRole('button', { name: 'Show password' }).click()
    await expect(password).toHaveAttribute('type', 'text')
    await expect(password).toHaveValue('secret-value')

    await page.getByRole('button', { name: 'Hide password' }).click()
    await expect(password).toHaveAttribute('type', 'password')
  })

  test('the change-password fields can be shown', async ({ page }) => {
    await login(page)
    await page.goto('/settings/profile')

    const newPassword = page.getByLabel('New password', { exact: true })
    await newPassword.fill('SomePass123')

    const field = newPassword.locator('xpath=..')
    await field.getByRole('button', { name: 'Show password' }).click()

    await expect(newPassword).toHaveAttribute('type', 'text')
    await expect(newPassword).toHaveValue('SomePass123')
  })

  test('the user password fields can be shown', async ({ page }) => {
    await login(page)
    await page.goto('/settings/users')
    await page.locator('tbody tr').first().click()
    await expect(page).toHaveURL(/\/settings\/users\/\d+\/edit$/, { timeout: 40_000 })

    const newPassword = page.getByLabel('New password', { exact: true })
    await newPassword.fill('SomePass123')

    const field = newPassword.locator('xpath=..')
    await field.getByRole('button', { name: 'Show password' }).click()

    await expect(newPassword).toHaveAttribute('type', 'text')
    await expect(newPassword).toHaveValue('SomePass123')
  })
})
