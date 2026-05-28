export interface ClinicCharge {
  id: number;
  medical_centre_name: string;
  patient_visit_type: string;
  charge_type: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface GridRequest {
  startRow: number;
  endRow: number;
  chargeType?: string;
  medicalCentreName?: string;
}

export interface GridResponse {
  rows: ClinicCharge[];
  totalRecords: number;
}

export interface ChargeCreate {
  medical_centre_name: string;
  patient_visit_type: string;
  charge_type: string;
  amount: number;
}

export interface ChargeUpdate {
  medical_centre_name?: string;
  patient_visit_type?: string;
  charge_type?: string;
  amount?: number;
}

export interface FilterState {
  chargeType: string;
  medicalCentreName: string;
}

export const EMPTY_FILTER_STATE: FilterState = {
  chargeType: '',
  medicalCentreName: '',
};
