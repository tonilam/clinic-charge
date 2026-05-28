import { ChargeCreate } from '../models/clinic-charge.model';

export function hasAtMostTwoDecimalPlaces(amount: number): boolean {
  const scaled = amount * 100;
  return Math.abs(scaled - Math.round(scaled)) < 1e-6;
}

export function createEmptyCharge(): ChargeCreate {
  return {
    medical_centre_name: '',
    patient_visit_type: '',
    charge_type: '',
    amount: 0,
  };
}
