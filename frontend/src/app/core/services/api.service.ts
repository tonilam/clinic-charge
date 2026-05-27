import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ClinicCharge,
  ChargeCreate,
  ChargeUpdate,
  GridResponse,
} from '../../shared/models/clinic-charge.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = '/api/charges';

  constructor(private http: HttpClient) {}

  getCharges(
    startRow: number,
    endRow: number,
    filters: { chargeType?: string; medicalCentreName?: string } = {}
  ): Observable<GridResponse> {
    let params = new HttpParams()
      .set('startRow', startRow)
      .set('endRow', endRow);

    if (filters.chargeType) {
      params = params.set('charge_type', filters.chargeType);
    }
    if (filters.medicalCentreName) {
      params = params.set('medical_centre_name', filters.medicalCentreName);
    }

    return this.http.get<GridResponse>(this.baseUrl, { params });
  }

  createCharge(payload: ChargeCreate): Observable<ClinicCharge> {
    return this.http.post<ClinicCharge>(this.baseUrl, payload);
  }

  updateCharge(id: number, payload: ChargeUpdate): Observable<ClinicCharge> {
    return this.http.patch<ClinicCharge>(`${this.baseUrl}/${id}`, payload);
  }
}
