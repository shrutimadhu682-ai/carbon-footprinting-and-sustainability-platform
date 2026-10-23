# Datasets Directory

This directory contains verified sample templates and demo datasets for the **Carbon Footprinting & Sustainability Platform**.

## Contents

1. `sample_templates/carbon_activity_template.csv`
   - Standard blank template for enterprise/organizational activity data.
   - Includes standard headers compatible with the column-mapping engine.

2. `demo_datasets/enterprise_esg_operations.csv`
   - **Type**: Multi-category corporate activity records across 12 months.
   - **Scopes Covered**: Scope 1 (Direct fuel/diesel), Scope 2 (Grid electricity), Scope 3 (Commute, waste, logistics).
   - **Emission Factor References**: 
     - CEA (Central Electricity Authority, India) CO2 Baseline Database Ver 19 / US EPA eGRID.
     - DEFRA / DESNZ 2023 Greenhouse Gas Reporting Conversion Factors.
     - IPCC Guidelines for National Greenhouse Gas Inventories.
   - **Total Records**: 120+ structured activity observations.

3. `demo_datasets/fleet_transport_emissions.csv`
   - **Type**: Operational fleet telematics and logistics dataset.
   - **Features**: `Trip_Distance_km`, `Vehicle_Type`, `Fuel_Type`, `Cargo_Weight_Tonnes`, `Avg_Speed_kmh`, `Ambient_Temp_C`, `Fuel_Consumption_L`, and target `Emissions_kgCO2e`.
   - **Purpose**: Ideal for Supervised Machine Learning (Linear Regression, Random Forest, Gradient Boosting) and K-Means Clustering of vehicle efficiency profiles.

## Note on Methodology
All emission calculations in demo datasets use transparent standard GHG Protocol formulas:
$$\text{Emissions} (\text{kg CO}_2\text{e}) = \text{Activity Amount} \times \text{Applicable Emission Factor}$$
Illustrative factors are clearly documented with their respective source bodies.
