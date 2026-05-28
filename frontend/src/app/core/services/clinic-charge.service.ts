import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ClinicCharge,
  ChargeCreate,
  ChargeUpdate,
  EMPTY_FILTER_STATE,
  FilterState,
  GridResponse,
} from '../../shared/models/clinic-charge.model';

@Injectable({ providedIn: 'root' })
export class ClinicChargeService {
  private filters = signal<FilterState>({ ...EMPTY_FILTER_STATE });
  private refreshTrigger = signal<number>(0);

  constructor(private api: ApiService) {}

  getCharges(startRow: number, endRow: number): Observable<GridResponse> {
    const { chargeType, medicalCentreName } = this.filters();
    return this.api.getCharges(startRow, endRow, {
      chargeType: chargeType || undefined,
      medicalCentreName: medicalCentreName || undefined,
    });
  }

  createCharge(payload: ChargeCreate): Observable<ClinicCharge> {
    return this.api.createCharge(payload);
  }

  updateCharge(id: number, payload: ChargeUpdate): Observable<ClinicCharge> {
    return this.api.updateCharge(id, payload);
  }

  setFilters(filters: FilterState): void {
    this.filters.set(filters);
  }

  applyFilters(filters: FilterState): void {
    this.setFilters(filters);
    this.triggerRefresh();
  }

  clearFilters(): void {
    this.applyFilters(EMPTY_FILTER_STATE);
  }

  getFilters(): FilterState {
    return this.filters();
  }

  triggerRefresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }

  getRefreshTrigger() {
    return this.refreshTrigger.asReadonly();
  }
}
