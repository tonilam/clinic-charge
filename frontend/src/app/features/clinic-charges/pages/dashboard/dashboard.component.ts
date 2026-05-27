import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridComponent } from '../../components/grid/grid.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { ClinicChargeService } from '../../../../core/services/clinic-charge.service';
import {
  FilterState,
  ChargeCreate,
} from '../../../../shared/models/clinic-charge.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, GridComponent, FilterComponent],
  template: `
    <div class="min-h-screen bg-gray-100 p-6">
      <div class="max-w-screen-xl mx-auto">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Clinic Charges Dashboard</h1>
            <p class="text-sm text-gray-500 mt-1">Manage and view GP clinic charges</p>
          </div>
          <button
            (click)="openCreateForm()"
            class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            + Add New Charge
          </button>
        </div>

        <div class="mb-4">
          <app-filter
            (filterApplied)="onFilterApplied($event)"
            (filterCleared)="onFilterCleared()"
          />
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <app-grid />
        </div>

        <!-- Create Charge Modal -->
        <div
          *ngIf="showCreateForm()"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Add New Charge</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Medical Centre *</label>
                <input
                  type="text"
                  [(ngModel)]="newCharge.medical_centre_name"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. City Medical Centre"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Visit Type *</label>
                <input
                  type="text"
                  [(ngModel)]="newCharge.patient_visit_type"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Standard Consultation"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Charge Type *</label>
                <input
                  type="text"
                  [(ngModel)]="newCharge.charge_type"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Consultation"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                <input
                  type="number"
                  [(ngModel)]="newCharge.amount"
                  min="0.01"
                  step="0.01"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 85.00"
                />
              </div>

              <p *ngIf="createError()" class="text-sm text-red-600">{{ createError() }}</p>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                (click)="closeCreateForm()"
                class="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                (click)="submitCreate()"
                [disabled]="creating()"
                class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {{ creating() ? 'Creating...' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  private chargeService = inject(ClinicChargeService);

  showCreateForm = signal(false);
  creating = signal(false);
  createError = signal('');

  newCharge: ChargeCreate = this.emptyCharge();

  onFilterApplied(filters: FilterState): void {
    this.chargeService.setFilters(filters);
    this.chargeService.triggerRefresh();
  }

  onFilterCleared(): void {
    this.chargeService.setFilters({ chargeType: '', medicalCentreName: '' });
    this.chargeService.triggerRefresh();
  }

  openCreateForm(): void {
    this.newCharge = this.emptyCharge();
    this.createError.set('');
    this.showCreateForm.set(true);
  }

  closeCreateForm(): void {
    this.showCreateForm.set(false);
  }

  submitCreate(): void {
    if (!this.newCharge.medical_centre_name || !this.newCharge.patient_visit_type ||
        !this.newCharge.charge_type || !this.newCharge.amount) {
      this.createError.set('All fields are required.');
      return;
    }
    if (this.newCharge.amount <= 0) {
      this.createError.set('Amount must be greater than 0.');
      return;
    }

    this.creating.set(true);
    this.createError.set('');

    this.chargeService.createCharge(this.newCharge).subscribe({
      next: () => {
        this.creating.set(false);
        this.closeCreateForm();
        this.chargeService.triggerRefresh();
      },
      error: () => {
        this.creating.set(false);
        this.createError.set('Failed to create charge. Please try again.');
      },
    });
  }

  private emptyCharge(): ChargeCreate {
    return {
      medical_centre_name: '',
      patient_visit_type: '',
      charge_type: '',
      amount: 0,
    };
  }
}
