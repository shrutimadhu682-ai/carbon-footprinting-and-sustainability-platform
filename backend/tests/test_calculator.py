import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database.models import Base, CalculationRecord
from backend.app.schemas.schemas import CalculationInput
from backend.app.services.calculator_service import CalculatorService
from backend.app.utils.emission_factors import EMISSION_REGISTRY, get_factor_details

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_electricity_calculation_india_grid(db_session):
    # Test India Grid factor: 0.716 kg CO2e / kWh
    calc_input = CalculationInput(
        category="electricity",
        subcategory="india_grid",
        activity_amount=1000.0,
        region="India"
    )
    res = CalculatorService.calculate_and_save(db_session, calc_input)
    assert res.emissions_kg_co2e == 716.0
    assert res.emissions_tonnes_co2e == 0.716
    assert res.activity_amount == 1000.0
    assert res.emission_factor == 0.716

def test_fuel_calculation_diesel(db_session):
    # Test Diesel factor: 2.68 kg CO2e / liter
    calc_input = CalculationInput(
        category="fuel",
        subcategory="diesel_liters",
        activity_amount=500.0
    )
    res = CalculatorService.calculate_and_save(db_session, calc_input)
    assert res.emissions_kg_co2e == 1340.0
    assert res.emissions_tonnes_co2e == 1.34

def test_custom_factor_override(db_session):
    calc_input = CalculationInput(
        category="electricity",
        subcategory="custom",
        activity_amount=200.0,
        custom_factor=0.450
    )
    res = CalculatorService.calculate_and_save(db_session, calc_input)
    assert res.emissions_kg_co2e == 90.0

def test_negative_activity_amount_rejected():
    with pytest.raises(Exception):
        CalculationInput(
            category="electricity",
            subcategory="india_grid",
            activity_amount=-100.0
        )

def test_zero_activity_amount_rejected():
    with pytest.raises(Exception):
        CalculationInput(
            category="electricity",
            subcategory="india_grid",
            activity_amount=0.0
        )

def test_calculation_history_and_deletion(db_session):
    calc_input = CalculationInput(
        category="transportation",
        subcategory="car_petrol",
        activity_amount=100.0
    )
    res = CalculatorService.calculate_and_save(db_session, calc_input)
    records, total = CalculatorService.get_history(db_session)
    assert total >= 1
    assert records[0].id == res.id

    deleted = CalculatorService.delete_record(db_session, res.id)
    assert deleted is True
    records_after, total_after = CalculatorService.get_history(db_session)
    assert total_after == 0
