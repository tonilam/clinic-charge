from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.schemas import ChargeCreate, ChargeUpdate, ChargeResponse, ChargesListResponse
from app.services.charge_service import ChargeService

router = APIRouter(prefix="/api/charges", tags=["charges"])
service = ChargeService()


@router.get("", response_model=ChargesListResponse)
async def list_charges(
    startRow: int = 0,
    endRow: int = 100,
    charge_type: Optional[str] = None,
    medical_centre_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    rows, total = await service.get_charges(
        db,
        start_row=startRow,
        end_row=endRow,
        charge_type=charge_type,
        medical_centre_name=medical_centre_name,
    )
    return ChargesListResponse(rows=rows, totalRecords=total)


@router.post("", response_model=ChargeResponse, status_code=status.HTTP_201_CREATED)
async def create_charge(payload: ChargeCreate, db: AsyncSession = Depends(get_db)):
    return await service.create_charge(db, payload)


@router.patch("/{charge_id}", response_model=ChargeResponse)
async def update_charge(
    charge_id: int, payload: ChargeUpdate, db: AsyncSession = Depends(get_db)
):
    updated = await service.update_charge(db, charge_id, payload)
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Charge {charge_id} not found",
        )
    return updated
