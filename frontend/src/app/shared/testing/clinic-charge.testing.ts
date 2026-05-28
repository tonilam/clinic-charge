import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import {
  ClinicCharge,
  EMPTY_FILTER_STATE,
  GridResponse,
} from '../models/clinic-charge.model';

export const mockClinicCharge: ClinicCharge = {
  id: 1,
  medical_centre_name: 'City Medical',
  patient_visit_type: 'Standard',
  charge_type: 'Consultation',
  amount: 85,
  created_at: '2026-01-01T00:00:00',
  updated_at: '2026-01-01T00:00:00',
};

export const mockGridResponse: GridResponse = {
  rows: [mockClinicCharge],
  totalRecords: 1,
};

export const mockRefreshTrigger = signal(0);

export function createMockClinicChargeService() {
  return {
    setFilters: vi.fn(),
    triggerRefresh: vi.fn(),
    createCharge: vi.fn().mockReturnValue(of(mockClinicCharge)),
    getCharges: vi.fn().mockReturnValue(of({ rows: [], totalRecords: 0 })),
    updateCharge: vi.fn().mockReturnValue(of(mockClinicCharge)),
    applyFilters: vi.fn(),
    clearFilters: vi.fn(),
    getFilters: vi.fn().mockReturnValue(EMPTY_FILTER_STATE),
    getRefreshTrigger: vi.fn().mockReturnValue(mockRefreshTrigger.asReadonly()),
  };
}
