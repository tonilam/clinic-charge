import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterState } from '../../../../shared/models/clinic-charge.model';

const CHARGE_TYPES = [
  'Consultation', 'Procedure', 'Follow-up', 'Emergency', 'Specialist Referral',
  'Pathology', 'Radiology', 'Vaccination', 'Health Assessment', 'Mental Health',
];

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-wrap gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Charge Type</label>
        <select
          [(ngModel)]="chargeType"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Types</option>
          <option *ngFor="let t of chargeTypes" [value]="t">{{ t }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Medical Centre</label>
        <input
          type="text"
          [(ngModel)]="medicalCentreName"
          placeholder="Search by name..."
          class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
        />
      </div>

      <div class="flex gap-2">
        <button
          type="button"
          (click)="onApply()"
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Apply
        </button>
        <button
          type="button"
          (click)="onClear()"
          class="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  `,
})
export class FilterComponent {
  @Output() filterApplied = new EventEmitter<FilterState>();
  @Output() filterCleared = new EventEmitter<void>();

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
