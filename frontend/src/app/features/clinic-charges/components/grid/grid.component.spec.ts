import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { themeQuartz } from 'ag-grid-community';
import { GridComponent } from './grid.component';
import { CHARGE_TYPES } from '../../../../shared/constants/charge-types';
import { ClinicChargeService } from '../../../../core/services/clinic-charge.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ClinicCharge, GridResponse } from '../../../../shared/models/clinic-charge.model';
import {
  createMockClinicChargeService,
  mockClinicCharge,
  mockGridResponse,
  mockRefreshTrigger,
} from '../../../../shared/testing/clinic-charge.testing';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
  const mockChargeService = createMockClinicChargeService();
  const mockToastService = { show: vi.fn(), dismiss: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockChargeService.getCharges.mockReturnValue(of(mockGridResponse));
    mockChargeService.updateCharge.mockReturnValue(of(mockClinicCharge));
    mockChargeService.getRefreshTrigger.mockReturnValue(mockRefreshTrigger.asReadonly());

    await TestBed.configureTestingModule({
      imports: [GridComponent],
      providers: [
        { provide: ClinicChargeService, useValue: mockChargeService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise loading signal to false', () => {
    expect(component.loading()).toBe(false);
  });

  it('should show a header tooltip hinting that columns can be reordered', () => {
    expect(component.defaultColDef.headerTooltip).toMatch(/drag/i);
  });

  it('should use the AG Grid v33 quartz theme via the Theming API', () => {
    expect(component.theme).toBe(themeQuartz);
  });

  it('should define column definitions including editable fields', () => {
    const editableFields = component.columnDefs
      .filter((c) => c.editable)
      .map((c) => c.field);
    expect(editableFields).toContain('medical_centre_name');
    expect(editableFields).toContain('amount');
  });

  it('charge_type column should use agSelectCellEditor with CHARGE_TYPES values', () => {
    const chargeTypeCol = component.columnDefs.find((c) => c.field === 'charge_type');
    expect(chargeTypeCol?.cellEditor).toBe('agSelectCellEditor');
    expect((chargeTypeCol?.cellEditorParams as { values: readonly string[] })?.values).toEqual(CHARGE_TYPES);
  });

  describe('amount column valueSetter', () => {
    let valueSetter: (params: { newValue: unknown; data: Partial<ClinicCharge> }) => boolean;

    beforeEach(() => {
      const amountCol = component.columnDefs.find((c) => c.field === 'amount');
      valueSetter = amountCol!.valueSetter as typeof valueSetter;
    });

    it('should return false and show toast when decimal places > 2', () => {
      const data: Partial<ClinicCharge> = { amount: 85 };
      const result = valueSetter({ newValue: '23.0123', data });
      expect(result).toBe(false);
      expect(mockToastService.show).toHaveBeenCalledWith('Amount must have at most 2 decimal places.');
      expect(data.amount).toBe(85);
    });

    it('should return false and not fire updateCharge when decimal places > 2', () => {
      const data: Partial<ClinicCharge> = { amount: 85 };
      valueSetter({ newValue: '23.0123', data });
      expect(mockChargeService.updateCharge).not.toHaveBeenCalled();
    });

    it('should return true and update data when decimal places <= 2', () => {
      const data: Partial<ClinicCharge> = { amount: 85 };
      const result = valueSetter({ newValue: '23.12', data });
      expect(result).toBe(true);
      expect(data.amount).toBe(23.12);
    });

    it('should return true and update data for whole numbers', () => {
      const data: Partial<ClinicCharge> = { amount: 85 };
      const result = valueSetter({ newValue: '100', data });
      expect(result).toBe(true);
      expect(data.amount).toBe(100);
    });
  });

  it('datasource getRows should call getCharges and invoke successCallback', () => {
    const successCb = vi.fn();
    const failCb = vi.fn();
    component.datasource.getRows({ startRow: 0, endRow: 10, successCallback: successCb, failCallback: failCb } as any);
    expect(mockChargeService.getCharges).toHaveBeenCalledWith(0, 10);
    expect(successCb).toHaveBeenCalledWith([mockClinicCharge], 1);
    expect(failCb).not.toHaveBeenCalled();
  });

  it('datasource getRows should invoke failCallback and show toast on API error', () => {
    mockChargeService.getCharges.mockReturnValue(throwError(() => new Error('Network error')));
    const successCb = vi.fn();
    const failCb = vi.fn();
    component.datasource.getRows({ startRow: 0, endRow: 10, successCallback: successCb, failCallback: failCb } as any);
    expect(failCb).toHaveBeenCalled();
    expect(mockToastService.show).toHaveBeenCalledWith('Failed to load clinic charges. Please try again.');
  });

  it('should set lastRow to -1 when more data exists beyond endRow', () => {
    const bigResponse: GridResponse = { rows: [mockClinicCharge], totalRecords: 500 };
    mockChargeService.getCharges.mockReturnValue(of(bigResponse));
    const successCb = vi.fn();
    component.datasource.getRows({ startRow: 0, endRow: 10, successCallback: successCb, failCallback: vi.fn() } as any);
    expect(successCb).toHaveBeenCalledWith([mockClinicCharge], -1);
  });

  it('onCellValueChanged should call updateCharge with patched field', () => {
    const event = {
      data: { id: 1 },
      colDef: { field: 'amount' },
      newValue: 99.99,
      oldValue: 85,
      node: { setDataValue: vi.fn() },
    } as any;
    component.onCellValueChanged(event);
    expect(mockChargeService.updateCharge).toHaveBeenCalledWith(1, { amount: 99.99 });
  });

  it('onCellValueChanged should revert cell value and show toast on update error', () => {
    mockChargeService.updateCharge.mockReturnValue(throwError(() => new Error('fail')));
    const setDataValue = vi.fn();
    const event = {
      data: { id: 1 },
      colDef: { field: 'amount' },
      newValue: 0,
      oldValue: 85,
      node: { setDataValue },
    } as any;
    component.onCellValueChanged(event);
    expect(setDataValue).toHaveBeenCalledWith('amount', 85);
    expect(mockToastService.show).toHaveBeenCalledWith('Failed to update charge. Changes reverted.');
  });

  it('onCellValueChanged should do nothing when event has no id', () => {
    const event = {
      data: null,
      colDef: { field: 'amount' },
      newValue: 50,
      oldValue: 85,
      node: { setDataValue: vi.fn() },
    } as any;
    component.onCellValueChanged(event);
    expect(mockChargeService.updateCharge).not.toHaveBeenCalled();
  });

  it('ngOnDestroy should not throw', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
