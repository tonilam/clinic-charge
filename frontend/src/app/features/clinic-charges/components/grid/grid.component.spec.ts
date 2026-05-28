import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { GridComponent } from './grid.component';
import { ClinicChargeService } from '../../../../core/services/clinic-charge.service';
import { GridResponse } from '../../../../shared/models/clinic-charge.model';
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

  beforeEach(async () => {
    vi.clearAllMocks();
    mockChargeService.getCharges.mockReturnValue(of(mockGridResponse));
    mockChargeService.updateCharge.mockReturnValue(of(mockClinicCharge));
    mockChargeService.getRefreshTrigger.mockReturnValue(mockRefreshTrigger.asReadonly());

    await TestBed.configureTestingModule({
      imports: [GridComponent],
      providers: [{ provide: ClinicChargeService, useValue: mockChargeService }],
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

  it('should initialise errorMessage signal to empty string', () => {
    expect(component.errorMessage()).toBe('');
  });

  it('should define column definitions including editable fields', () => {
    const editableFields = component.columnDefs
      .filter((c) => c.editable)
      .map((c) => c.field);
    expect(editableFields).toContain('medical_centre_name');
    expect(editableFields).toContain('amount');
  });

  it('datasource getRows should call getCharges and invoke successCallback', () => {
    const successCb = vi.fn();
    const failCb = vi.fn();
    component.datasource.getRows({ startRow: 0, endRow: 10, successCallback: successCb, failCallback: failCb } as any);
    expect(mockChargeService.getCharges).toHaveBeenCalledWith(0, 10);
    expect(successCb).toHaveBeenCalledWith([mockClinicCharge], 1);
    expect(failCb).not.toHaveBeenCalled();
  });

  it('datasource getRows should invoke failCallback on API error', () => {
    mockChargeService.getCharges.mockReturnValue(throwError(() => new Error('Network error')));
    const successCb = vi.fn();
    const failCb = vi.fn();
    component.datasource.getRows({ startRow: 0, endRow: 10, successCallback: successCb, failCallback: failCb } as any);
    expect(failCb).toHaveBeenCalled();
    expect(component.errorMessage()).not.toBe('');
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

  it('onCellValueChanged should revert cell value on update error', () => {
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
