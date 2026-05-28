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

  test('should display 20 rows by default', async ({ page }) => {
    await page.goto('/');
    const grid = new GridHelper(page);
    await grid.waitForGridReady();
    expect(await grid.getRowCount()).toBe(20);
  });

  test('should paginate through results', async ({ page }) => {
    await page.goto('/');
    const grid = new GridHelper(page);
    await grid.waitForGridReady();

    const firstPageId = await grid.getFirstVisibleCellValue('id');

    // AG Grid paging buttons: first, prev, next, last — next is index 2
    const nextBtn = page.locator('.ag-paging-button').nth(2);
    await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
    await nextBtn.click();
    await page.waitForLoadState('networkidle');
    await grid.waitForGridReady();

    const secondPageId = await grid.getFirstVisibleCellValue('id');
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
      // Use expect with built-in retry to handle AG Grid async DOM updates
      await expect(
        page.locator('.ag-row[row-index="0"] .ag-cell[col-id="charge_type"]')
      ).toContainText('Consultation', { timeout: 8000 });
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

    expect(await grid.getRowCount()).toBe(20);
  });

  test('should show Add New Charge button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button:has-text("Add New Charge")')).toBeVisible();
  });
});
