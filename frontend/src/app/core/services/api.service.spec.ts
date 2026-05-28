import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { GridResponse, ClinicCharge, ChargeCreate } from '../../shared/models/clinic-charge.model';
import { CHARGE_TYPES } from '../../shared/constants/charge-types';

const mockCharge: ClinicCharge = {
  id: 1,
  medical_centre_name: 'City Medical',
  patient_visit_type: 'Standard',
  charge_type: CHARGE_TYPES[0],
  amount: 85.00,
  created_at: '2026-01-01T00:00:00',
  updated_at: '2026-01-01T00:00:00',
};

const mockResponse: GridResponse = { rows: [mockCharge], totalRecords: 1 };

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch charges with pagination params', () => {
    service.getCharges(0, 10).subscribe((res) => {
      expect(res.rows.length).toBe(1);
      expect(res.totalRecords).toBe(1);
    });

    const req = httpMock.expectOne((r) =>
      r.url === '/api/charges' && r.params.get('startRow') === '0'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should include charge_type filter when provided', () => {
    service.getCharges(0, 10, { chargeType: CHARGE_TYPES[0] }).subscribe();

    const req = httpMock.expectOne((r) =>
      r.params.get('charge_type') === CHARGE_TYPES[0]
    );
    req.flush(mockResponse);
  });

  it('should include medical_centre_name filter when provided', () => {
    service.getCharges(0, 10, { medicalCentreName: 'City' }).subscribe();

    const req = httpMock.expectOne((r) =>
      r.params.get('medical_centre_name') === 'City'
    );
    req.flush(mockResponse);
  });

  it('should omit undefined filters', () => {
    service.getCharges(0, 10).subscribe();

    const req = httpMock.expectOne('/api/charges?startRow=0&endRow=10');
    expect(req.request.params.has('charge_type')).toBeFalsy();
    req.flush(mockResponse);
  });

  it('should create a charge via POST', () => {
    const payload: ChargeCreate = {
      medical_centre_name: 'Metro',
      patient_visit_type: 'Private',
      charge_type: CHARGE_TYPES[1],
      amount: 500,
    };
    service.createCharge(payload).subscribe((res) => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne('/api/charges');
    expect(req.request.method).toBe('POST');
    req.flush(mockCharge);
  });

  it('should update a charge via PATCH', () => {
    service.updateCharge(1, { amount: 200 }).subscribe((res) => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne('/api/charges/1');
    expect(req.request.method).toBe('PATCH');
    req.flush(mockCharge);
  });
});
