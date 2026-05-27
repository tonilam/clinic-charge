import { test, expect } from '@playwright/test';
import { GridHelper } from '../utils/grid-helper';

test.describe('Clinic Charges Dashboard', () => {
  test('should load dashboard and display grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Clinic Charges Dashboard');
    const grid = new GridHelper(page);
    await grid.waitForGridReady();
    expect(await grid.getRowCount()).toBeGreaterThan(0);
  });

  test('should display 10 rows by default', async ({ page }) => {
    await page.goto('/');
    const grid = new GridHelper(page);
    await grid.waitForGridReady();
    expect(await grid.getRowCount()).toBe(10);
  });

  test('should paginate through results', async ({ page }) => {
    await page.goto('/');
    const grid = new GridHelper(page);
    await grid.waitForGridReady();

    const firstPageId = await grid.getCellValue(0, 'id');

    const nextBtn = page.locator('button[aria-label="Next Page"]');
    await nextBtn.click();
    await page.waitForLoadState('networkidle');

    const secondPageId = await grid.getCellValue(0, 'id');
    expect(firstPageId).not.toBe(secondPageId);
  });

  test('should filter by charge type', async ({ page }) => {
    await page.goto('/');
    const grid = new GridHelper(page);
    await grid.waitForGridReady();

    const select = page.locator('select');
    await select.selectOption('Consultation');
    await page.locator('button:has-text("Apply")').click();
    await page.waitForLoadState('networkidle');
    await grid.waitForGridReady();

    const rowCount = await grid.getRowCount();
    if (rowCount > 0) {
      const cellVal = await grid.getCellValue(0, 'charge_type');
      expect(cellVal).toContain('Consultation');
    }
  });

  test('should clear filters and show all results', async ({ page }) => {
    await page.goto('/');
    const grid = new GridHelper(page);
    await grid.waitForGridReady();

    await page.locator('select').selectOption('Emergency');
    await page.locator('button:has-text("Apply")').click();
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("Clear")').click();
    await page.waitForLoadState('networkidle');
    await grid.waitForGridReady();

    expect(await grid.getRowCount()).toBe(10);
  });

  test('should show Add New Charge button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button:has-text("Add New Charge")')).toBeVisible();
  });
});
