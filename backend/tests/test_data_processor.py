import pytest
from pathlib import Path
import pandas as pd
from backend.app.services.data_processor import DataProcessor

@pytest.fixture
def sample_csv(tmp_path):
    csv_file = tmp_path / "test_emissions.csv"
    data = """Date,Department,Category,Activity_Amount,Emissions_kgCO2e
2024-01-01,HQ,Electricity,1000,716.0
2024-01-02,HQ,Electricity,1200,859.2
2024-02-01,Factory,Fuel,500,1340.0
2024-02-15,Logistics,Transportation,2000,482.0
2024-03-01,Factory,Fuel,450,1206.0
"""
    csv_file.write_text(data, encoding="utf-8")
    return csv_file

def test_data_processor_preview(sample_csv):
    preview = DataProcessor.inspect_and_preview(sample_csv)
    assert preview["row_count"] == 5
    assert "Emissions_kgCO2e" in preview["columns"]
    assert preview["duplicate_count"] == 0
    assert len(preview["head_rows"]) == 5

def test_data_processor_analyze(sample_csv):
    analysis = DataProcessor.analyze_dataset(
        file_path=sample_csv,
        emissions_col="Emissions_kgCO2e",
        category_col="Category",
        date_col="Date",
        department_col="Department"
    )
    assert analysis["total_records"] == 5
    assert analysis["total_emissions_kg"] > 0
    assert len(analysis["category_breakdown"]) >= 3
    assert len(analysis["department_breakdown"]) >= 3
    assert analysis["data_quality_score"] > 80.0
