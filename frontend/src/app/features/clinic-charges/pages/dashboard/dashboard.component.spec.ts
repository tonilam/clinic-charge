import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { ClinicChargeService } from '../../../../core/services/clinic-charge.service';
import { createMockClinicChargeService } from '../../../../shared/testing/clinic-charge.testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  const mockChargeService = createMockClinicChargeService();

  beforeEach(async () => {
    vi.clearAllMocks();

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

  it('onFilterApplied should call applyFilters', () => {
    const filters = { chargeType: 'Consultation', medicalCentreName: 'City' };
    component.onFilterApplied(filters);
    expect(mockChargeService.applyFilters).toHaveBeenCalledWith(filters);
  });

  it('onFilterCleared should call clearFilters', () => {
    component.onFilterCleared();
    expect(mockChargeService.clearFilters).toHaveBeenCalled();
  });

  it('onChargeCreated should close form and trigger refresh', () => {
    component.openCreateForm();
    component.onChargeCreated();
    expect(component.showCreateForm()).toBe(false);
    expect(mockChargeService.triggerRefresh).toHaveBeenCalled();
  });
});
