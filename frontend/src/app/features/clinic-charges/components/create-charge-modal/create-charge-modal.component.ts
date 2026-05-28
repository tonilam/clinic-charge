import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicChargeService } from '../../../../core/services/clinic-charge.service';
import { ChargeCreate } from '../../../../shared/models/clinic-charge.model';
import { CHARGE_TYPES } from '../../../../shared/constants/charge-types';
import {
  FORM_INPUT_CLASS,
  FORM_SELECT_CLASS,
} from '../../../../shared/constants/form-classes';
import {
  createEmptyCharge,
  hasAtMostTwoDecimalPlaces,
} from '../../../../shared/helpers/clinic-charge.helpers';

@Component({
  selector: 'app-create-charge-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-charge-modal.component.html',
})
export class CreateChargeModalComponent {
  @Output() cancelled = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private chargeService = inject(ClinicChargeService);

  readonly formInputClass = FORM_INPUT_CLASS;
  readonly formSelectClass = FORM_SELECT_CLASS;
  readonly chargeTypes = CHARGE_TYPES;

  creating = signal(false);
  createError = signal('');
  newCharge: ChargeCreate = createEmptyCharge();

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit(): void {
    if (
      !this.newCharge.medical_centre_name ||
      !this.newCharge.patient_visit_type ||
      !this.newCharge.charge_type ||
      !this.newCharge.amount
    ) {
      this.createError.set('All fields are required.');
      return;
    }
    if (this.newCharge.amount <= 0) {
      this.createError.set('Amount must be greater than 0.');
      return;
    }
    if (!hasAtMostTwoDecimalPlaces(this.newCharge.amount)) {
      this.createError.set('Amount must have at most 2 decimal places.');
      return;
    }

    this.creating.set(true);
    this.createError.set('');

    this.chargeService.createCharge(this.newCharge).subscribe({
      next: () => {
        this.creating.set(false);
        this.created.emit();
      },
      error: () => {
        this.creating.set(false);
        this.createError.set('Failed to create charge. Please try again.');
      },
    });
  }
}
