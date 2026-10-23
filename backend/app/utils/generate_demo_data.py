import csv
import random
from pathlib import Path

def generate_datasets():
    demo_dir = Path(__file__).resolve().parent.parent.parent.parent / "data" / "demo_datasets"
    demo_dir.mkdir(parents=True, exist_ok=True)

    random.seed(42)

    # 1. Enterprise ESG Operations Dataset (150 rows)
    esg_file = demo_dir / "enterprise_esg_operations.csv"
    departments = ["Headquarters", "Manufacturing Plant A", "Data Center", "Logistics Hub", "Regional Office"]
    
    activities_meta = [
        {"cat": "Electricity", "type": "Grid Electricity", "unit": "kWh", "factor": 0.716, "scope": "Scope 2", "min": 8000, "max": 45000},
        {"cat": "Fuel", "type": "Diesel Generator Backup", "unit": "liters", "factor": 2.68, "scope": "Scope 1", "min": 250, "max": 1800},
        {"cat": "Transportation", "type": "Commercial Fleet Logistics", "unit": "km", "factor": 0.241, "scope": "Scope 1", "min": 2000, "max": 14000},
        {"cat": "Fuel", "type": "Natural Gas Heating", "unit": "m3", "factor": 2.03, "scope": "Scope 1", "min": 500, "max": 3500},
        {"cat": "Operations", "type": "Municipal Solid Waste", "unit": "kg", "factor": 0.58, "scope": "Scope 3", "min": 150, "max": 1200},
        {"cat": "Operations", "type": "Water Supply & Treatment", "unit": "m3", "factor": 0.344, "scope": "Scope 3", "min": 100, "max": 800},
        {"cat": "Transportation", "type": "Employee Commute Travel", "unit": "km", "factor": 0.113, "scope": "Scope 3", "min": 1500, "max": 9000},
    ]

    esg_rows = []
    months = [f"2024-{m:02d}" for m in range(1, 13)]
    for month in months:
        for dept in departments:
            # Pick 2-3 activities per department per month
            chosen_activities = random.sample(activities_meta, 3)
            for act in chosen_activities:
                day = random.randint(1, 28)
                date_str = f"{month}-{day:02d}"
                amount = round(random.uniform(act["min"], act["max"]), 1)
                factor = act["factor"]
                emissions = round(amount * factor, 2)
                esg_rows.append([
                    date_str, dept, act["cat"], act["type"], amount, act["unit"],
                    factor, emissions, act["scope"], f"Verified record from {dept} operations"
                ])

    with open(esg_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Date", "Department", "Category", "Activity_Type", "Activity_Amount",
            "Activity_Unit", "Emission_Factor", "Emissions_kgCO2e", "Scope", "Notes"
        ])
        writer.writerows(esg_rows)
    print(f"Generated {len(esg_rows)} rows in {esg_file}")

    # 2. Fleet Transport Telematics Dataset (180 rows)
    fleet_file = demo_dir / "fleet_transport_emissions.csv"
    fleet_rows = []
    vehicle_types = [
        {"type": "Light Delivery Van", "fuel": "Diesel", "fuel_rate_base": 0.10, "factor": 2.68},
        {"type": "Medium Rigid Truck", "fuel": "Diesel", "fuel_rate_base": 0.22, "factor": 2.68},
        {"type": "Heavy Freight Hauler", "fuel": "Diesel", "fuel_rate_base": 0.35, "factor": 2.68},
        {"type": "Electric Transit Van", "fuel": "Electric", "fuel_rate_base": 0.26, "factor": 0.716}, # kWh base
        {"type": "Petrol Courier Van", "fuel": "Petrol", "fuel_rate_base": 0.11, "factor": 2.31},
    ]

    for i in range(180):
        veh = random.choice(vehicle_types)
        distance = round(random.uniform(25.0, 550.0), 1)
        cargo_tonnes = round(random.uniform(0.2, 18.5), 2)
        speed = round(random.uniform(35.0, 92.0), 1)
        temp_c = round(random.uniform(12.0, 42.0), 1)

        # Realistic physics-based fuel / power consumption
        weight_penalty = 1.0 + (cargo_tonnes * 0.025)
        speed_penalty = 1.0 + (max(0, speed - 65) * 0.012)
        temp_penalty = 1.0 + (max(0, temp_c - 30) * 0.008) # AC load

        consumed_rate = veh["fuel_rate_base"] * weight_penalty * speed_penalty * temp_penalty
        consumed_total = round(distance * consumed_rate, 2)
        emissions = round(consumed_total * veh["factor"], 2)

        fleet_rows.append([
            f"TRIP-{i+1001}", veh["type"], veh["fuel"], distance, cargo_tonnes,
            speed, temp_c, consumed_total, emissions
        ])

    with open(fleet_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Trip_ID", "Vehicle_Type", "Fuel_Type", "Trip_Distance_km", "Cargo_Weight_Tonnes",
            "Avg_Speed_kmh", "Ambient_Temp_C", "Fuel_Energy_Consumed", "Emissions_kgCO2e"
        ])
        writer.writerows(fleet_rows)
    print(f"Generated {len(fleet_rows)} rows in {fleet_file}")

if __name__ == "__main__":
    generate_datasets()
