import { ChargeCreate } from '../models/clinic-charge.model';

export function createEmptyCharge(): ChargeCreate {
  return {
    medical_centre_name: '',
    patient_visit_type: '',
    charge_type: '',
    amount: 0,
  };
}
