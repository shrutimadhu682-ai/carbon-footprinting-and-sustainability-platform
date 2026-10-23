import csv
import io
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from ..database.models import CalculationRecord
from ..schemas.schemas import CalculationInput, CalculationResponse, CalculationBreakdown
from ..utils.emission_factors import EMISSION_REGISTRY, get_factor_details

class CalculatorService:
    @staticmethod
    def calculate_and_save(db: Session, input_data: CalculationInput) -> CalculationResponse:
        cat_key = input_data.category.lower()
        subcat_key = input_data.subcategory.lower()

        cat_info = EMISSION_REGISTRY.get(cat_key)
        if not cat_info:
            raise ValueError(f"Category '{input_data.category}' is not recognized in the registry.")

        subcat_info = cat_info["subcategories"].get(subcat_key)
        if not subcat_info and input_data.custom_factor is None:
            raise ValueError(f"Subcategory '{input_data.subcategory}' is not recognized and no custom factor was provided.")

        factor_name = subcat_info["name"] if subcat_info else "Custom Activity Factor"
        factor_unit = subcat_info["unit"] if subcat_info else "kg CO2e / unit"
        activity_unit = cat_info["unit"]
        factor_val = input_data.custom_factor if input_data.custom_factor is not None else subcat_info["factor"]
        source = subcat_info.get("source", "User Defined Custom Factor") if subcat_info else "User Defined"
        ref_year = subcat_info.get("reference_year", "N/A") if subcat_info else "N/A"
        region = input_data.region or (subcat_info.get("region", "Global") if subcat_info else "Global")
        notes = subcat_info.get("notes", "") if subcat_info else input_data.notes

        # Standard GHG Protocol formula:
        # Emissions (kg CO2e) = Activity Amount * Emission Factor
        emissions_kg = round(input_data.activity_amount * factor_val, 4)
        emissions_tonnes = round(emissions_kg / 1000.0, 6)

        record = CalculationRecord(
            category=cat_info["name"],
            activity_type=factor_name,
            activity_amount=input_data.activity_amount,
            activity_unit=activity_unit,
            emission_factor=factor_val,
            emission_factor_unit=factor_unit,
            emissions_kg_co2e=emissions_kg,
            emissions_tonnes_co2e=emissions_tonnes,
            region=region,
            source_notes=f"Source: {source} ({ref_year}). Notes: {notes}"
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        breakdown = CalculationBreakdown(
            formula=f"Emissions ({emissions_kg} kg CO2e) = Activity Amount ({input_data.activity_amount} {activity_unit}) × Emission Factor ({factor_val} {factor_unit})",
            activity_amount=input_data.activity_amount,
            activity_unit=activity_unit,
            emission_factor=factor_val,
            emission_factor_unit=factor_unit,
            emissions_kg_co2e=emissions_kg,
            emissions_tonnes_co2e=emissions_tonnes,
            factor_source=source,
            reference_year=ref_year,
            region=region,
            notes="Calculated per GHG Protocol Corporate Standard."
        )

        return CalculationResponse(
            id=record.id,
            category=record.category,
            activity_type=record.activity_type,
            activity_amount=record.activity_amount,
            activity_unit=record.activity_unit,
            emission_factor=record.emission_factor,
            emission_factor_unit=record.emission_factor_unit,
            emissions_kg_co2e=record.emissions_kg_co2e,
            emissions_tonnes_co2e=record.emissions_tonnes_co2e,
            region=record.region,
            source_notes=record.source_notes,
            created_at=record.created_at,
            breakdown=breakdown
        )

    @staticmethod
    def get_history(db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> Tuple[List[CalculationRecord], int]:
        query = db.query(CalculationRecord)
        if category and category != "All":
            query = query.filter(CalculationRecord.category.ilike(f"%{category}%"))
        total = query.count()
        records = query.order_by(CalculationRecord.created_at.desc()).offset(skip).limit(limit).all()
        return records, total

    @staticmethod
    def delete_record(db: Session, record_id: str) -> bool:
        record = db.query(CalculationRecord).filter(CalculationRecord.id == record_id).first()
        if not record:
            return False
        db.delete(record)
        db.commit()
        return True

    @staticmethod
    def export_csv(db: Session) -> str:
        records = db.query(CalculationRecord).order_by(CalculationRecord.created_at.desc()).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "ID", "Category", "Activity Type", "Activity Amount", "Activity Unit",
            "Emission Factor", "Emission Factor Unit", "Emissions (kg CO2e)",
            "Emissions (Tonnes CO2e)", "Region", "Source Notes", "Created At"
        ])
        for r in records:
            writer.writerow([
                r.id, r.category, r.activity_type, r.activity_amount, r.activity_unit,
                r.emission_factor, r.emission_factor_unit, r.emissions_kg_co2e,
                r.emissions_tonnes_co2e, r.region, r.source_notes, r.created_at.isoformat()
            ])
        return output.getvalue()
