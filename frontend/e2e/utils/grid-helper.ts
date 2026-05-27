import { Page, Locator } from '@playwright/test';

export class GridHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForGridReady(): Promise<void> {
    await this.page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
    await this.page.waitForLoadState('networkidle');
  }

  getRows(): Locator {
    return this.page.locator('.ag-row');
  }

  async getRowCount(): Promise<number> {
    await this.waitForGridReady();
    return this.getRows().count();
  }

  async getCellValue(rowIndex: number, field: string): Promise<string> {
    const cell = this.page.locator(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${field}"]`);
    return (await cell.textContent()) ?? '';
  }

  async editCell(rowIndex: number, field: string, value: string): Promise<void> {
    const cell = this.page.locator(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${field}"]`);
    await cell.dblclick();
    const input = cell.locator('input');
    await input.clear();
    await input.fill(value);
    await input.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }
}
