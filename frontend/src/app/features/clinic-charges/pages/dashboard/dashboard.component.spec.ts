import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { ClinicChargeService } from '../../../../core/services/clinic-charge.service';
import { ClinicCharge } from '../../../../shared/models/clinic-charge.model';
import { signal } from '@angular/core';

const mockCharge: ClinicCharge = {
  id: 1,
  medical_centre_name: 'City Medical',
  patient_visit_type: 'Standard',
  charge_type: 'Consultation',
  amount: 85,
  created_at: '2026-01-01T00:00:00',
  updated_at: '2026-01-01T00:00:00',
};

const refreshTrigger = signal(0);

const mockChargeService = {
  setFilters: vi.fn(),
  triggerRefresh: vi.fn(),
  createCharge: vi.fn().mockReturnValue(of(mockCharge)),
  getCharges: vi.fn().mockReturnValue(of({ rows: [], totalRecords: 0 })),
  updateCharge: vi.fn().mockReturnValue(of(mockCharge)),
  getFilters: vi.fn().mockReturnValue({ chargeType: '', medicalCentreName: '' }),
  getRefreshTrigger: vi.fn().mockReturnValue(refreshTrigger.asReadonly()),
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockChargeService.createCharge.mockReturnValue(of(mockCharge));
    mockChargeService.getRefreshTrigger.mockReturnValue(refreshTrigger.asReadonly());

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: ClinicChargeService, useValue: mockChargeService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise showCreateForm to false', () => {
    expect(component.showCreateForm()).toBe(false);
  });

  it('openCreateForm should set showCreateForm to true', () => {
    component.openCreateForm();
    expect(component.showCreateForm()).toBe(true);
  });

  it('closeCreateForm should set showCreateForm to false', () => {
    component.openCreateForm();
    component.closeCreateForm();
    expect(component.showCreateForm()).toBe(false);
  });

  it('onFilterApplied should call setFilters and triggerRefresh', () => {
    const filters = { chargeType: 'Consultation', medicalCentreName: 'City' };
    component.onFilterApplied(filters);
    expect(mockChargeService.setFilters).toHaveBeenCalledWith(filters);
    expect(mockChargeService.triggerRefresh).toHaveBeenCalled();
  });

  it('onFilterCleared should reset filters and trigger refresh', () => {
    component.onFilterCleared();
    expect(mockChargeService.setFilters).toHaveBeenCalledWith({ chargeType: '', medicalCentreName: '' });
    expect(mockChargeService.triggerRefresh).toHaveBeenCalled();
  });

  it('submitCreate should show error when fields are empty', () => {
    component.openCreateForm();
    component.newCharge = { medical_centre_name: '', patient_visit_type: '', charge_type: '', amount: 0 };
    component.submitCreate();
    expect(component.createError()).not.toBe('');
    expect(mockChargeService.createCharge).not.toHaveBeenCalled();
  });

  it('submitCreate should show error when amount is zero', () => {
    component.openCreateForm();
    component.newCharge = { medical_centre_name: 'Clinic', patient_visit_type: 'Visit', charge_type: 'Consult', amount: 0 };
    component.submitCreate();
    expect(component.createError()).not.toBe('');
  });

  it('submitCreate should call createCharge with valid payload and close form on success', async () => {
    component.openCreateForm();
    component.newCharge = {
      medical_centre_name: 'Clinic',
      patient_visit_type: 'Standard',
      charge_type: 'Consultation',
      amount: 85,
    };
    component.submitCreate();
    await fixture.whenStable();
    expect(mockChargeService.createCharge).toHaveBeenCalled();
    expect(component.showCreateForm()).toBe(false);
    expect(mockChargeService.triggerRefresh).toHaveBeenCalled();
  });

  it('submitCreate should show error message on API failure', async () => {
    mockChargeService.createCharge.mockReturnValue(throwError(() => new Error('fail')));
    component.openCreateForm();
    component.newCharge = {
      medical_centre_name: 'Clinic',
      patient_visit_type: 'Standard',
      charge_type: 'Consultation',
      amount: 85,
    };
    component.submitCreate();
    await fixture.whenStable();
    expect(component.createError()).not.toBe('');
    expect(component.showCreateForm()).toBe(true);
  });
});
