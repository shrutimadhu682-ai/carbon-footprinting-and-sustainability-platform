import pytest
import pandas as pd
import numpy as np
from backend.app.ml.pipeline import MLPipelineService

@pytest.fixture
def regression_data():
    np.random.seed(42)
    n = 60
    dist = np.random.uniform(50, 400, n)
    cargo = np.random.uniform(1, 15, n)
    # Target emissions proportional to distance and cargo
    emissions = dist * 0.25 * 2.68 + cargo * 12.0 + np.random.normal(0, 5, n)
    veh_types = np.random.choice(["Van", "Truck"], n)
    df = pd.DataFrame({
        "Trip_Distance_km": dist,
        "Cargo_Weight_Tonnes": cargo,
        "Vehicle_Type": veh_types,
        "Emissions_kgCO2e": emissions
    })
    return df

def test_ml_train_and_evaluate(regression_data):
    res = MLPipelineService.train_and_evaluate(
        df=regression_data,
        target_column="Emissions_kgCO2e",
        feature_columns=["Trip_Distance_km", "Cargo_Weight_Tonnes", "Vehicle_Type"],
        algorithm="random_forest",
        test_size=0.2
    )
    metrics = res["metrics"]
    assert "mae" in metrics
    assert "rmse" in metrics
    assert "r2_score" in metrics
    assert metrics["r2_score"] > 0.5  # High correlation dataset should have strong R2
    assert len(res["actual_vs_predicted"]) > 0

def test_kmeans_clustering(regression_data):
    res = MLPipelineService.run_clustering(
        df=regression_data,
        feature_columns=["Trip_Distance_km", "Cargo_Weight_Tonnes"],
        n_clusters=3
    )
    assert res["clusters_count"] == 3
    assert len(res["cluster_profiles"]) == 3
    assert len(res["scatter_points"]) > 0
