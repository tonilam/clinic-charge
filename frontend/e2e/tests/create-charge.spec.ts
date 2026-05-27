import { test, expect } from '@playwright/test';
import { GridHelper } from '../utils/grid-helper';

test.describe('Create Charge', () => {
  test('should open create form modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Add New Charge")').click();
    await expect(page.locator('h2:has-text("Add New Charge")')).toBeVisible();
  });

  test('should close form on Cancel', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Add New Charge")').click();
    await page.locator('button:has-text("Cancel")').click();
    await expect(page.locator('h2:has-text("Add New Charge")')).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("Add New Charge")').click();
    await page.locator('button:has-text("Create")').click();
    await expect(page.locator('text=All fields are required')).toBeVisible();
  });

  test('should create a charge and refresh grid', async ({ page }) => {
    await page.goto('/');
    const grid = new GridHelper(page);
    await grid.waitForGridReady();

    await page.locator('button:has-text("Add New Charge")').click();
    await page.locator('input[placeholder*="City Medical"]').fill('Test Clinic E2E');
    await page.locator('input[placeholder*="Standard Consultation"]').fill('Private Patient');
    await page.locator('input[placeholder*="Consultation"]').fill('Procedure');
    await page.locator('input[type="number"]').fill('199.99');

    await page.locator('button:has-text("Create")').click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h2:has-text("Add New Charge")')).not.toBeVisible();
    await grid.waitForGridReady();
    expect(await grid.getRowCount()).toBeGreaterThan(0);
  });
});
