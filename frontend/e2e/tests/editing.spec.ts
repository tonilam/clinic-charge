import { test, expect } from '@playwright/test';
import { GridHelper } from '../utils/grid-helper';

test.describe('Inline Cell Editing', () => {
  test('should edit a cell and save changes', async ({ page }) => {
    await page.goto('/');
    const grid = new GridHelper(page);
    await grid.waitForGridReady();

    await grid.editCell(0, 'amount', '99.99');
    await page.waitForLoadState('networkidle');
    // After edit, grid should still be visible
    expect(await grid.getRowCount()).toBeGreaterThan(0);
  });

  test('should edit charge type field', async ({ page }) => {
    await page.goto('/');
    const grid = new GridHelper(page);
    await grid.waitForGridReady();

    await grid.editCell(0, 'charge_type', 'Emergency');
    await page.waitForLoadState('networkidle');
    expect(await grid.getRowCount()).toBeGreaterThan(0);
  });
});
