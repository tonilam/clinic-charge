# GP Clinic Charges Dashboard – Database Design & Architecture

## Executive Summary

**Recommendation: PostgreSQL** for long-term Australian healthcare data management, multi-clinic isolation, and Privacy Act 1988 (Cth) compliance with Australian Privacy Principles (APPs).

---

## Database Selection Analysis

### Context
- **Application Type**: Australian Healthcare/GP Clinic Management System
- **Data Scope**: Multiple medical centers, patient visit charges, potentially sensitive personal health information
- **Scale**: 500+ records, potential growth to thousands across clinic network
- **Compliance**: Privacy Act 1988 (Cth) - Australian Privacy Principles (APPs), My Health Records Act 2012 (Cth)
- **Regulatory Standards**: RACGP (Royal Australian College of General Practitioners) requirements, ASD Essential Eight, Telehealth Privacy Standards
- **Concurrency**: Multiple clinics modifying/querying simultaneously

---

## PostgreSQL vs MySQL: Detailed Comparison

### PostgreSQL: 7 Pros ✅

1. **ACID Compliance & Transactions**
   - Full ACID guarantees (critical for financial data)
   - Robust foreign key constraints prevent data inconsistencies
   - Essential for clinic charge accuracy and auditability

2. **Advanced Data Types**
   - JSON/JSONB for semi-structured healthcare data (patient metadata, insurance info)
   - Arrays, Ranges, UUID types for flexible clinic structures
   - Excellent for audit logs and compliance records

3. **Full-Text Search**
   - Built-in FTS for searching medical center names and charge descriptions
   - No need for external tools like Elasticsearch
   - Lower operational complexity

4. **Row-Level Security (RLS)**
   - Native multi-tenant data isolation per clinic
   - **Critical for Australian Privacy Act**: Each clinic sees only its charges
   - Prevents data leakage between medical centers (APP 1.2 - Governance, APP 13 - Security)

5. **Australian Privacy Act Compliant** 🇦🇺
   - Mature security extensions (pgcrypto, pgTDE for encryption at rest)
   - Trusted by Australian healthcare institutions (RACGP standards)
   - Better regulatory acceptance under APPs (Australian Privacy Principles)

6. **Complex Queries & Analytics**
   - Window functions, CTEs, JSON operators
   - Sophisticated billing reports and charge analytics
   - Efficient for large result sets

7. **Extensibility**
   - Custom data types, extensions (PostGIS for clinic locations)
   - PL/pgSQL for stored procedures
   - Future-proof for evolving clinic requirements

---

### PostgreSQL: 7 Cons ❌

1. **Heavier Resource Usage**
   - Higher memory footprint and CPU usage
   - May require more robust infrastructure
   - Higher hosting costs for managed services

2. **Slower on Simple Reads**
   - Basic SELECT queries slightly slower than MySQL
   - Less optimal for extremely read-heavy simple pagination (minor concern for this MVP)

3. **Steeper Learning Curve**
   - More complex optimization and tuning
   - Requires more DBA expertise for production
   - Longer onboarding for development team

4. **Slower Replication Setup**
   - Logical/streaming replication more complex than MySQL binlog
   - Takes longer to set up read replicas

5. **Larger Disk Footprint**
   - MVCC (Multi-Version Concurrency Control) requires more storage
   - Higher database size than MySQL for identical data

6. **Connection Pooling Overhead**
   - Requires external pooling (pgBouncer) for high concurrency
   - Not built-in like some MySQL configurations
   - Additional DevOps overhead

7. **Smaller Hosting Ecosystem**
   - Fewer PaaS providers than MySQL
   - Less vendor choice (though still many: AWS RDS, Azure, DigitalOcean)

---

### MySQL: 7 Pros ✅

1. **High Performance on Reads**
   - Optimized for read-heavy workloads
   - Fast simple queries (paginated clinic charge listings)
   - Better for extreme read scenarios

2. **Lower Resource Overhead**
   - Smaller memory footprint
   - Ideal for resource-constrained environments
   - Lower hosting costs

3. **Ease of Setup**
   - Simpler installation and configuration
   - Faster initial optimization
   - Lower barrier to entry for new developers

4. **Wide Hosting Support**
   - Massive ecosystem of managed hosting
   - Most affordable managed database options
   - Available everywhere (AWS, Google Cloud, Azure, etc.)

5. **Fast Replication**
   - Simple binlog-based replication
   - Quick setup for read replicas across clinic branches
   - Better horizontal scaling for reads

6. **InnoDB Improvements**
   - Strong ACID compliance comparable to PostgreSQL
   - Reliable foreign key support
   - Stable for financial data

7. **Community & Tooling**
   - Largest community ecosystem
   - Abundant tutorials and resources
   - Many frameworks optimized for MySQL

---

### MySQL: 7 Cons ❌

1. **Limited Data Type Support**
   - No native JSON operators or JSONB
   - Limited array support
   - No built-in UUID type
   - Harder to store flexible clinic metadata

2. **Weak Row-Level Security**
   - No native RLS
   - Requires application-level data isolation logic
   - **Security risk**: Data leakage between clinics possible

3. **Poor Full-Text Search**
   - Basic FTS capabilities
   - Requires external tools (Elasticsearch) for robust search
   - Higher operational complexity

4. **Limited Australian Privacy Act Compliance Features**
   - Fewer built-in security features for APP 13 requirements
   - Requires third-party encryption/audit solutions
   - Less trust from Australian healthcare institutions and RACGP

5. **Weaker Transaction Support**
   - Deadlock issues under high concurrency
   - Multiple clinics updating simultaneously may cause conflicts
   - Risk of charge record loss or corruption

6. **Limited Extensibility**
   - Few custom types or functions
   - Not designed for flexibility
   - Harder to evolve with clinic requirements

7. **Scaling Complexity**
   - Sharding requires application-level logic
   - No built-in partitioning like PostgreSQL
   - Horizontal scaling is complicated

---

## 3 Critical Reasons: PostgreSQL > MySQL

### **1. Multi-Tenant Data Isolation & Security** 🔐

**PostgreSQL Row-Level Security (RLS)** is purpose-built for this:

```sql
-- Enable RLS on clinic_charges table
ALTER TABLE clinic_charges ENABLE ROW LEVEL SECURITY;

-- Create policy: Each clinic sees only its charges
CREATE POLICY clinic_isolation ON clinic_charges
  FOR ALL USING (medical_centre_id = CURRENT_USER_CLINIC_ID);
```

**Why it matters:**
- Each clinic automatically sees only its charges (enforced at database level)
- **Zero chance** of data leakage between medical centers
- Compliance with Australian Privacy Principles (APP 1 & 13) - governance and security
- Mandatory breach notification requirements under Privacy Act 1988 (Cth)
- MySQL requires application-level logic → security gaps, developer errors, regulatory non-compliance

**Risk Example (MySQL):**
```
Clinic A staff accidentally queries: SELECT * FROM clinic_charges
Result: Gets Clinic B's patient health information (Privacy Act breach)
        → Mandatory breach notification to affected patients within 30 days
        → Potential OAIC investigation
        → Reputational damage, fines up to $2.5M+ for organizations
```

---

### **2. Healthcare-Grade ACID Compliance & Financial Integrity** 💰

Clinic charge data is **financial and legal**:
- Billing records for insurance claims
- Compliance audit trails
- Revenue reconciliation across clinics

**PostgreSQL Guarantees:**
- ✅ No orphaned charges without clinic reference (FK constraints)
- ✅ No partial transactions corrupting billing (full ACID)
- ✅ Full audit trail with JSON/JSONB for compliance
- ✅ Bulletproof consistency across concurrent clinic updates

**MySQL Risks:**
- ❌ Deadlock issues under multi-clinic load → charge records lost
- ❌ Partial transactions → incomplete charge entries
- ❌ Less reliable audit trails for regulatory audits
- ❌ One financial discrepancy = legal penalties & reputation damage

---

### **3. JSON/JSONB for Healthcare Flexibility** 📋

Healthcare data is complex and varies per clinic:

```sql
-- PostgreSQL: Flexible charge metadata
ALTER TABLE clinic_charges ADD COLUMN metadata JSONB;

-- Store complex nested data
{
  "insurance_provider": "Bupa",
  "patient_age_group": "65+",
  "treatment_notes": "Follow-up consultation",
  "clinic_specific_code": "CONS-065",
  "created_at": "2026-05-27T10:30:00Z"
}

-- Query with native operators
SELECT * FROM clinic_charges 
WHERE metadata->>'insurance_provider' = 'Bupa'
AND metadata->'patient_age_group' = '"65+"';
```

**Benefits:**
- ✅ **Future-proof**: Add clinic-specific fields without schema migrations
- ✅ **Performance**: JSONB is indexed and queryable (not just text)
- ✅ **Scalability**: Onboard new clinics with different billing structures
- ✅ **Compliance**: Audit trail in JSON format

**MySQL Alternative (Poor):**
- Create separate tables for each variation (schema bloat)
- Serialize to TEXT/BLOB (no queries, full app load)
- Complex application logic to handle variations

---

## Recommended PostgreSQL Schema Design

### Core Tables

```sql
-- Medical Centers (clinics)
CREATE TABLE medical_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  location VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinic Charges (main dataset)
CREATE TABLE clinic_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_centre_id UUID NOT NULL REFERENCES medical_centers(id),
  patient_visit_type VARCHAR(100) NOT NULL,
  charge_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log (Australian Privacy Act Compliance - APP 13)
CREATE TABLE charge_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charge_id UUID REFERENCES clinic_charges(id),
  action VARCHAR(50), -- 'CREATE', 'UPDATE', 'DELETE'
  changed_fields JSONB,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance

```sql
-- For pagination queries
CREATE INDEX idx_clinic_charges_centre_id ON clinic_charges(medical_centre_id);

-- For filtering
CREATE INDEX idx_clinic_charges_type ON clinic_charges(charge_type);
CREATE INDEX idx_clinic_charges_visit_type ON clinic_charges(patient_visit_type);

-- For JSONB queries
CREATE INDEX idx_clinic_charges_metadata ON clinic_charges USING GIN(metadata);

-- For full-text search on clinic names
CREATE INDEX idx_medical_centers_name_tsvector 
  ON medical_centers USING GIN(to_tsvector('english', name));
```

### Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE clinic_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_centers ENABLE ROW LEVEL SECURITY;

-- Create roles for clinics
CREATE ROLE clinic_user;

-- Policy: Each clinic sees only its charges
CREATE POLICY clinic_isolation ON clinic_charges
  FOR ALL USING (
    medical_centre_id = (
      SELECT id FROM medical_centers 
      WHERE name = current_user
    )
  );
```

---

## Docker Configuration

### Docker Compose Setup

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: clinic_admin
      POSTGRES_PASSWORD: secure_password_change_me
      POSTGRES_DB: clinic_charges_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U clinic_admin"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Environment Variables

```env
# Backend connection
DATABASE_URL=postgresql://clinic_admin:secure_password_change_me@localhost:5432/clinic_charges_db
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# Australia-specific compliance settings
ENCRYPTION_ENABLED=true
DATA_LOCATION_REGION=AU  # Ensure data stored in Australia (Privacy Act requirement)
AUDIT_LOGGING_ENABLED=true
BREACH_NOTIFICATION_ENABLED=true
```

### Data Residency Requirement 🇦🇺

**Important**: Patient health information must be stored in Australia to comply with Privacy Act 1988 (Cth) APP 1 (Governance).

```yaml
# Docker Compose - Australia-based hosting
services:
  postgres:
    image: postgres:18-alpine
    # MUST be deployed in Australian region:
    # - AWS: ap-southeast-2 (Sydney)
    # - Azure: australiaeast or australiasoutheast
    # - Google Cloud: australia-southeast1 (Sydney) or australia-southeast2 (Melbourne)
    # - DigitalOcean: syd1 (Sydney)
```

---

## Australian Privacy Act & RACGP Compliance Checklist

### Privacy Act 1988 (Cth) - Australian Privacy Principles (APPs)

**APP 1 - Open and Transparent Management of Personal Information**
- [ ] Clear privacy policy explaining data collection, use, and disclosure
- [ ] Privacy notice at time of collection
- [ ] Document retention and de-identification procedures

**APP 3 - Collection of Solicited Personal Information**
- [ ] Patient consent for health information collection
- [ ] Document collection purposes (e.g., treatment, billing)
- [ ] Only collect reasonably necessary information

**APP 5 - Notification of Privacy Breaches**
- [ ] Breach response plan documented
- [ ] Mandatory notification to affected individuals within 30 days
- [ ] Notification to OAIC (Office of the Australian Information Commissioner) if serious harm likely

**APP 6 - Use or Disclosure of Personal Information**
- [ ] Only use/disclose for primary purpose (treatment/billing) or related secondary purposes
- [ ] Clinic isolation to prevent cross-clinic data access
- [ ] Patient consent for secondary use (e.g., research)

**APP 13 - Security of Personal Information**
- [ ] Encryption at rest (pgcrypto or pgTDE) - ASD Essential Eight requirement
- [ ] Row-Level Security enabled for multi-tenant isolation
- [ ] Audit logging for all patient data access and changes
- [ ] Access control (role-based) - principle of least privilege
- [ ] Connection encryption (SSL/TLS for all network traffic)
- [ ] Regular backups with encryption
- [ ] Data retention policies documented and enforced
- [ ] User authentication and session management
- [ ] Regular security assessments and penetration testing

### My Health Records Act 2012 (Cth)
- [ ] Compliance with Australian Government's My Health Records system if participating
- [ ] Healthcare Identifier (HI) support in patient records
- [ ] Consent management for individual access controls
- [ ] Secure messaging and audit trails

### RACGP (Royal Australian College of General Practitioners) Standards
- [ ] GP practice accreditation compliance
- [ ] Patient data safety standards met
- [ ] Regular system and security audits
- [ ] Staff training on privacy and security

### ASD Essential Eight (Australian Signals Directorate)
- [ ] Application whitelisting
- [ ] Patch management
- [ ] Configuration management
- [ ] Multifactor authentication (MFA) for sensitive access
- [ ] Regular backups tested for restoration
- [ ] User access management
- [ ] Restrict administrative privileges
- [ ] System monitoring and logging

---

## Migration Path: If Requirements Change

If future requirements force MySQL:

```sql
-- Export PostgreSQL schema
pg_dump --schema-only clinic_charges_db > schema.sql

-- Convert to MySQL-compatible SQL
-- Manual changes needed:
-- - UUID → VARCHAR(36)
-- - JSONB → JSON
-- - Remove RLS policies
-- - Add application-level isolation logic
```

**Recommendation**: Stick with PostgreSQL to avoid this costly migration.

---

## Summary Table

| Criterion | PostgreSQL | MySQL |
|-----------|-----------|-------|
| **Australian Privacy Act Ready** | ✅ Yes | ⚠️ Partial |
| **Data Isolation (APP 6, 13)** | ✅ Built-in RLS | ❌ App-level |
| **Financial Data (Billing)** | ✅ Bulletproof ACID | ⚠️ Deadlock risks |
| **Flexibility** | ✅ JSONB | ❌ Limited |
| **Scaling** | ✅ Partitioning | ⚠️ Sharding |
| **Setup Complexity** | ⚠️ Moderate | ✅ Simple |
| **Performance (reads)** | ⚠️ Good | ✅ Excellent |
| **Long-term Cost** | ✅ Lower TCO | ⚠️ Higher (compliance) |

---

## Next Steps

1. **Schema Design**: Implement clinic isolation keys
2. **RLS Policies**: Set up data segregation
3. **Audit Logging**: Implement for compliance
4. **Encryption**: Add pgcrypto extension
5. **Backup Strategy**: Daily encrypted backups
6. **Seed Script**: 500 clinic charge records

---

**Decision**: ✅ **PostgreSQL Selected**

**Rationale**: Long-term Australian healthcare data management, multi-clinic isolation, Privacy Act 1988 (Cth) compliance with Australian Privacy Principles (APPs), RACGP standards, and financial integrity outweigh resource overhead.

---

## Australian Legal Context 🇦🇺

### Key Legislation
1. **Privacy Act 1988 (Cth)** - Governs collection, use, and disclosure of personal information (including health data)
2. **My Health Records Act 2012 (Cth)** - Governs the national electronic health records system
3. **Notifiable Data Breaches (NDB) Scheme** - Mandatory notification of eligible data breaches to individuals and OAIC within 30 days
4. **State Health Records Legislation** - Varies by state (e.g., NSW Health Records and Information Privacy Act 2002)

### Regulatory Authority
- **OAIC** (Office of the Australian Information Commissioner) - Enforces Privacy Act, issues guidance
- **RACGP** (Royal Australian College of General Practitioners) - Sets standards for GP practices
- **Australian Signals Directorate (ASD)** - Provides Essential Eight cybersecurity framework

### Penalties for Non-Compliance
- **Civil Penalties**: Up to $2.5 million for organizations, up to $500,000 for individuals
- **Reputation Damage**: Public reporting of breaches, loss of patient trust
- **Mandatory Breach Notification**: Costly notification to affected individuals (>$1M for large breaches)
- **Regulatory Investigation**: OAIC investigations can be lengthy and expensive
