import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CreateChargeModalComponent } from './create-charge-modal.component';
import { ClinicChargeService } from '../../../../core/services/clinic-charge.service';
import {
  createMockClinicChargeService,
  mockClinicCharge,
} from '../../../../shared/testing/clinic-charge.testing';

describe('CreateChargeModalComponent', () => {
  let component: CreateChargeModalComponent;
  let fixture: ComponentFixture<CreateChargeModalComponent>;
  const mockChargeService = createMockClinicChargeService();

  beforeEach(async () => {
    vi.clearAllMocks();
    mockChargeService.createCharge.mockReturnValue(of(mockClinicCharge));

    await TestBed.configureTestingModule({
      imports: [CreateChargeModalComponent],
      providers: [{ provide: ClinicChargeService, useValue: mockChargeService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateChargeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSubmit should show error when fields are empty', () => {
    component.newCharge = {
      medical_centre_name: '',
      patient_visit_type: '',
      charge_type: '',
      amount: 0,
    };
    component.onSubmit();
    expect(component.createError()).not.toBe('');
    expect(mockChargeService.createCharge).not.toHaveBeenCalled();
  });

  it('onSubmit should show error when amount is zero', () => {
    component.newCharge = {
      medical_centre_name: 'Clinic',
      patient_visit_type: 'Visit',
      charge_type: 'Consult',
      amount: 0,
    };
    component.onSubmit();
    expect(component.createError()).not.toBe('');
  });

  it('onSubmit should show error when amount has more than 2 decimal places', () => {
    component.newCharge = {
      medical_centre_name: 'Clinic',
      patient_visit_type: 'Visit',
      charge_type: 'Consult',
      amount: 23.0123,
    };
    component.onSubmit();
    expect(component.createError()).toBe('Amount must have at most 2 decimal places.');
    expect(mockChargeService.createCharge).not.toHaveBeenCalled();
  });

  it('onSubmit should call createCharge and emit created on success', async () => {
    const createdSpy = vi.spyOn(component.created, 'emit');
    component.newCharge = {
      medical_centre_name: 'Clinic',
      patient_visit_type: 'Standard',
      charge_type: 'Consultation',
      amount: 85,
    };
    component.onSubmit();
    await fixture.whenStable();
    expect(mockChargeService.createCharge).toHaveBeenCalled();
    expect(createdSpy).toHaveBeenCalled();
  });

  it('onSubmit should show error message on API failure', async () => {
    mockChargeService.createCharge.mockReturnValue(throwError(() => new Error('fail')));
    component.newCharge = {
      medical_centre_name: 'Clinic',
      patient_visit_type: 'Standard',
      charge_type: 'Consultation',
      amount: 85,
    };
    component.onSubmit();
    await fixture.whenStable();
    expect(component.createError()).not.toBe('');
  });

  it('onCancel should emit cancelled', () => {
    const cancelledSpy = vi.spyOn(component.cancelled, 'emit');
    component.onCancel();
    expect(cancelledSpy).toHaveBeenCalled();
  });
});
