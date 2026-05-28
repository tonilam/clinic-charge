import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ClinicChargeService } from './clinic-charge.service';
import { ApiService } from './api.service';
import {
  EMPTY_FILTER_STATE,
  GridResponse,
  ClinicCharge,
} from '../../shared/models/clinic-charge.model';
import { CHARGE_TYPES } from '../../shared/constants/charge-types';

const mockCharge: ClinicCharge = {
  id: 1,
  medical_centre_name: 'City Medical',
  patient_visit_type: 'Standard',
  charge_type: CHARGE_TYPES[0],
  amount: 85,
  created_at: '2026-01-01T00:00:00',
  updated_at: '2026-01-01T00:00:00',
};

const mockResponse: GridResponse = { rows: [mockCharge], totalRecords: 1 };

describe('ClinicChargeService', () => {
  let service: ClinicChargeService;
  let apiSpy: { getCharges: ReturnType<typeof vi.fn>; createCharge: ReturnType<typeof vi.fn>; updateCharge: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiSpy = {
      getCharges: vi.fn().mockReturnValue(of(mockResponse)),
      createCharge: vi.fn().mockReturnValue(of(mockCharge)),
      updateCharge: vi.fn().mockReturnValue(of(mockCharge)),
    };

    TestBed.configureTestingModule({
      providers: [
        ClinicChargeService,
        { provide: ApiService, useValue: apiSpy },
      ],
    });
    service = TestBed.inject(ClinicChargeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get charges with no filters by default', async () => {
    await new Promise<void>((resolve) => {
      service.getCharges(0, 10).subscribe((res) => {
        expect(res.totalRecords).toBe(1);
        resolve();
      });
    });
    expect(apiSpy.getCharges).toHaveBeenCalledWith(0, 10, {
      chargeType: undefined,
      medicalCentreName: undefined,
    });
  });

  it('should pass filters when set', async () => {
    service.setFilters({ chargeType: 'Consultation', medicalCentreName: 'City' });
    await new Promise<void>((resolve) => {
      service.getCharges(0, 10).subscribe(() => resolve());
    });
    expect(apiSpy.getCharges).toHaveBeenCalledWith(0, 10, {
      chargeType: 'Consultation',
      medicalCentreName: 'City',
    });
  });

  it('should not pass empty filter strings', async () => {
    service.setFilters(EMPTY_FILTER_STATE);
    await new Promise<void>((resolve) => {
      service.getCharges(0, 10).subscribe(() => resolve());
    });
    expect(apiSpy.getCharges).toHaveBeenCalledWith(0, 10, {
      chargeType: undefined,
      medicalCentreName: undefined,
    });
  });

  it('should create charge', async () => {
    const result = await new Promise<ClinicCharge>((resolve) => {
      service.createCharge({
        medical_centre_name: 'Metro',
        patient_visit_type: 'Private',
        charge_type: CHARGE_TYPES[1],
        amount: 500,
      }).subscribe((res) => resolve(res));
    });
    expect(result.id).toBe(1);
  });

  it('should update charge', async () => {
    const result = await new Promise<ClinicCharge>((resolve) => {
      service.updateCharge(1, { amount: 200 }).subscribe((res) => resolve(res));
    });
    expect(result.id).toBe(1);
  });

  it('should increment refresh trigger on triggerRefresh', () => {
    const before = service.getRefreshTrigger()();
    service.triggerRefresh();
    const after = service.getRefreshTrigger()();
    expect(after).toBe(before + 1);
  });

  it('should update and read filter state', () => {
    service.setFilters({ chargeType: 'Emergency', medicalCentreName: 'North' });
    const filters = service.getFilters();
    expect(filters.chargeType).toBe('Emergency');
    expect(filters.medicalCentreName).toBe('North');
  });

  it('applyFilters should set filters and increment refresh trigger', () => {
    const before = service.getRefreshTrigger()();
    service.applyFilters({ chargeType: 'Consultation', medicalCentreName: 'City' });
    expect(service.getFilters()).toEqual({
      chargeType: 'Consultation',
      medicalCentreName: 'City',
    });
    expect(service.getRefreshTrigger()()).toBe(before + 1);
  });

  it('clearFilters should reset filters and increment refresh trigger', () => {
    service.setFilters({ chargeType: 'Emergency', medicalCentreName: 'North' });
    const before = service.getRefreshTrigger()();
    service.clearFilters();
    expect(service.getFilters()).toEqual(EMPTY_FILTER_STATE);
    expect(service.getRefreshTrigger()()).toBe(before + 1);
  });
});
