import { APIRequestContext } from '@playwright/test';

export class ApiHelper {
  private api: APIRequestContext;
  private baseUrl: string;

  constructor(api: APIRequestContext, baseUrl = 'http://localhost:8000') {
    this.api = api;
    this.baseUrl = baseUrl;
  }

  async createCharge(payload: {
    medical_centre_name: string;
    patient_visit_type: string;
    charge_type: string;
    amount: number;
  }) {
    const res = await this.api.post(`${this.baseUrl}/api/charges`, { data: payload });
    return res.json();
  }

  async getCharges(startRow = 0, endRow = 10) {
    const res = await this.api.get(`${this.baseUrl}/api/charges?startRow=${startRow}&endRow=${endRow}`);
    return res.json();
  }
}
