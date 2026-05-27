from sqlalchemy import Column, Integer, String, Numeric, DateTime, func
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class ClinicCharge(Base):
    __tablename__ = "clinic_charges"

    id = Column(Integer, primary_key=True, index=True)
    medical_centre_name = Column(String(255), nullable=False)
    patient_visit_type = Column(String(100), nullable=False)
    charge_type = Column(String(100), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ClinicCharge id={self.id} charge_type={self.charge_type!r} amount={self.amount}>"
