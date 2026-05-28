import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from '../../components/grid/grid.component';
import { FilterComponent } from '../../components/filter/filter.component';
import { CreateChargeModalComponent } from '../../components/create-charge-modal/create-charge-modal.component';
import { ClinicChargeService } from '../../../../core/services/clinic-charge.service';
import { FilterState } from '../../../../shared/models/clinic-charge.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GridComponent, FilterComponent, CreateChargeModalComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private chargeService = inject(ClinicChargeService);

  showCreateForm = signal(false);

  onFilterApplied(filters: FilterState): void {
    this.chargeService.applyFilters(filters);
  }

  onFilterCleared(): void {
    this.chargeService.clearFilters();
  }

  openCreateForm(): void {
    this.showCreateForm.set(true);
  }

  closeCreateForm(): void {
    this.showCreateForm.set(false);
  }

  onChargeCreated(): void {
    this.closeCreateForm();
    this.chargeService.triggerRefresh();
  }
}
