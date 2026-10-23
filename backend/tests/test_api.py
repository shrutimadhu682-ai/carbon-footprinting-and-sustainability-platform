import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.connection import engine, Base, SessionLocal
from backend.app.api.datasets import ensure_demo_datasets_registered

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_demo_datasets_registered(db)
    finally:
        db.close()
    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_categories_endpoint(client):
    res = client.get("/api/calculations/categories")
    assert res.status_code == 200
    data = res.json()
    assert "categories" in data
    assert len(data["categories"]) >= 3

def test_calculation_flow(client):
    calc_payload = {
        "category": "electricity",
        "subcategory": "india_grid",
        "activity_amount": 500.0,
        "region": "India",
        "notes": "Test HQ power"
    }
    post_res = client.post("/api/calculations", json=calc_payload)
    assert post_res.status_code == 200
    res_data = post_res.json()
    assert res_data["emissions_kg_co2e"] == 358.0
    calc_id = res_data["id"]

    # History
    hist_res = client.get("/api/calculations")
    assert hist_res.status_code == 200
    items = hist_res.json()["items"]
    assert any(i["id"] == calc_id for i in items)

    # Delete
    del_res = client.delete(f"/api/calculations/{calc_id}")
    assert del_res.status_code == 200

def test_dashboard_summary(client):
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert "category_emissions" in data
    assert "emissions_over_time" in data

def test_datasets_list(client):
    res = client.get("/api/datasets")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1  # Pre-loaded demo datasets
