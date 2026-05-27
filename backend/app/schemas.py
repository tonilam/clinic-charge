from decimal import Decimal
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class ChargeBase(BaseModel):
    medical_centre_name: str
    patient_visit_type: str
    charge_type: str
    amount: Decimal


class ChargeCreate(ChargeBase):
    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("amount must be greater than 0")
        return v


class ChargeUpdate(BaseModel):
    medical_centre_name: Optional[str] = None
    patient_visit_type: Optional[str] = None
    charge_type: Optional[str] = None
    amount: Optional[Decimal] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("amount must be greater than 0")
        return v


class ChargeResponse(ChargeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChargesListResponse(BaseModel):
    rows: list[ChargeResponse]
    totalRecords: int
