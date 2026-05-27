-- Clinic Charges Dashboard – PostgreSQL Schema & Seed Data

CREATE TABLE IF NOT EXISTS clinic_charges (
    id SERIAL PRIMARY KEY,
    medical_centre_name VARCHAR(255) NOT NULL,
    patient_visit_type VARCHAR(100) NOT NULL,
    charge_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clinic_charges_charge_type ON clinic_charges(charge_type);
CREATE INDEX IF NOT EXISTS idx_clinic_charges_medical_centre ON clinic_charges(medical_centre_name);
CREATE INDEX IF NOT EXISTS idx_clinic_charges_created_at ON clinic_charges(created_at);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_clinic_charges_updated_at ON clinic_charges;
CREATE TRIGGER update_clinic_charges_updated_at
    BEFORE UPDATE ON clinic_charges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed 500 rows
DO $$
DECLARE
    medical_centres TEXT[] := ARRAY[
        'City Medical Centre', 'Northside Family Practice', 'Southgate GP Clinic',
        'Eastside Health Centre', 'Westfield Medical', 'Central Health Hub',
        'Riverside Medical Practice', 'Bayside Family Health', 'Greenfields Medical',
        'Hillcrest General Practice'
    ];
    visit_types TEXT[] := ARRAY[
        'Standard Consultation', 'Urgent Care', 'Bulk Billed Visit',
        'Private Patient', 'Telehealth', 'After Hours'
    ];
    charge_types TEXT[] := ARRAY[
        'Consultation', 'Procedure', 'Follow-up', 'Emergency', 'Specialist Referral',
        'Pathology', 'Radiology', 'Vaccination', 'Health Assessment', 'Mental Health'
    ];
    amounts DECIMAL[] := ARRAY[
        39.10, 78.20, 85.00, 90.00, 92.50, 105.00, 115.00, 125.00,
        150.00, 175.00, 195.00, 210.00, 250.00, 280.00, 320.00
    ];
    i INTEGER;
    rand_centre TEXT;
    rand_visit TEXT;
    rand_charge TEXT;
    rand_amount DECIMAL;
BEGIN
    IF (SELECT COUNT(*) FROM clinic_charges) = 0 THEN
        FOR i IN 1..500 LOOP
            rand_centre := medical_centres[1 + floor(random() * array_length(medical_centres, 1))::int];
            rand_visit  := visit_types[1 + floor(random() * array_length(visit_types, 1))::int];
            rand_charge := charge_types[1 + floor(random() * array_length(charge_types, 1))::int];
            rand_amount := amounts[1 + floor(random() * array_length(amounts, 1))::int];
            INSERT INTO clinic_charges (medical_centre_name, patient_visit_type, charge_type, amount)
            VALUES (rand_centre, rand_visit, rand_charge, rand_amount);
        END LOOP;
    END IF;
END;
$$;
