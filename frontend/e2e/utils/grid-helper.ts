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

  /** Returns cell value from the first visible row, regardless of absolute row index. */
  async getFirstVisibleCellValue(field: string): Promise<string> {
    const firstRow = this.page.locator('.ag-row').first();
    await firstRow.waitFor({ state: 'visible', timeout: 5000 });
    const cell = firstRow.locator(`.ag-cell[col-id="${field}"]`);
    return (await cell.textContent()) ?? '';
  }

  async editCell(rowIndex: number, field: string, value: string): Promise<void> {
    // Use Angular debug API (dev build only) to programmatically start AG Grid cell editing
    await this.page.evaluate(({ rowIndex, colKey }) => {
      const el = document.querySelector('app-grid');
      if (!el) return;
      const ng = (window as any).ng;
      const comp = ng?.getComponent(el);
      comp?.gridApi?.startEditingCell({ rowIndex, colKey });
    }, { rowIndex, colKey: field });

    // Editor input lives inside .ag-cell-inline-editing
    const input = this.page.locator('.ag-cell-inline-editing input');
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.selectAll();
    await input.fill(value);
    await input.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }
}
