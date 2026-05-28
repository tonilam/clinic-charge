import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterState } from '../../../../shared/models/clinic-charge.model';
import { CHARGE_TYPES } from '../../../../shared/constants/charge-types';
import {
  FORM_INPUT_NARROW_CLASS,
  FORM_SELECT_CLASS,
} from '../../../../shared/constants/form-classes';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.component.html',
})
export class FilterComponent {
  @Output() filterApplied = new EventEmitter<FilterState>();
  @Output() filterCleared = new EventEmitter<void>();

  readonly formSelectClass = FORM_SELECT_CLASS;
  readonly formInputNarrowClass = FORM_INPUT_NARROW_CLASS;

  chargeType = '';
  medicalCentreName = '';
  chargeTypes = CHARGE_TYPES;

  onApply(): void {
    this.filterApplied.emit({
      chargeType: this.chargeType,
      medicalCentreName: this.medicalCentreName,
    });
  }

  onClear(): void {
    this.chargeType = '';
    this.medicalCentreName = '';
    this.filterCleared.emit();
  }
}
