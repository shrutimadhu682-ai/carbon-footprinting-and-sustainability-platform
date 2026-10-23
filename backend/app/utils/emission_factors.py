"""
Emission Factor Registry
Sourced from documented standards:
- India Central Electricity Authority (CEA) Baseline Database Ver 19
- US EPA eGRID 2022 Summary Tables
- UK Department for Environment, Food & Rural Affairs (DEFRA / DESNZ) 2023
- IPCC 2006 Guidelines for National Greenhouse Gas Inventories
"""

from typing import Dict, Any, List

EMISSION_REGISTRY: Dict[str, Dict[str, Any]] = {
    "electricity": {
        "name": "Electricity Consumption",
        "unit": "kWh",
        "description": "Grid electricity and power consumption emissions (Scope 2)",
        "subcategories": {
            "india_grid": {
                "name": "India National Grid (CEA Baseline Ver 19)",
                "factor": 0.716,
                "unit": "kg CO2e / kWh",
                "region": "India",
                "source": "Central Electricity Authority (CEA), CO2 Baseline Database for Indian Power Sector Ver 19",
                "reference_year": "2023",
                "notes": "Weighted average emission factor for Indian National Grid"
            },
            "us_grid": {
                "name": "US National Grid Average (EPA eGRID 2022)",
                "factor": 0.386,
                "unit": "kg CO2e / kWh",
                "region": "United States",
                "source": "US Environmental Protection Agency (EPA) eGRID 2022",
                "reference_year": "2022",
                "notes": "Average grid gross loss adjusted emission factor (~0.852 lb/kWh)"
            },
            "uk_grid": {
                "name": "UK National Grid (DEFRA 2023)",
                "factor": 0.207,
                "unit": "kg CO2e / kWh",
                "region": "United Kingdom",
                "source": "UK DEFRA / DESNZ Conversion Factors 2023",
                "reference_year": "2023",
                "notes": "Transmission & distribution included UK grid average"
            },
            "eu_grid": {
                "name": "European Union Grid Average (EEA)",
                "factor": 0.230,
                "unit": "kg CO2e / kWh",
                "region": "European Union",
                "source": "European Environment Agency (EEA) Greenhouse Gas Intensity",
                "reference_year": "2023",
                "notes": "EU-27 average electricity generation GHG intensity"
            },
            "solar_wind": {
                "name": "On-site Solar / Wind Renewable Power",
                "factor": 0.000,
                "unit": "kg CO2e / kWh",
                "region": "Global",
                "source": "GHG Protocol Scope 2 Guidance (Market-based Zero Emissions)",
                "reference_year": "2023",
                "notes": "Direct operational Scope 2 emission factor for verified renewables"
            }
        }
    },
    "transportation": {
        "name": "Transportation & Logistics",
        "unit": "km",
        "description": "Passenger and commercial logistics travel emissions (Scope 1 & Scope 3)",
        "subcategories": {
            "car_petrol": {
                "name": "Passenger Car - Petrol (Gasoline)",
                "factor": 0.192,
                "unit": "kg CO2e / km",
                "region": "Global Average",
                "source": "DEFRA / DESNZ 2023 Passenger Vehicles",
                "reference_year": "2023",
                "notes": "Medium passenger car, average fuel consumption"
            },
            "car_diesel": {
                "name": "Passenger Car - Diesel",
                "factor": 0.171,
                "unit": "kg CO2e / km",
                "region": "Global Average",
                "source": "DEFRA / DESNZ 2023 Passenger Vehicles",
                "reference_year": "2023",
                "notes": "Medium diesel passenger vehicle"
            },
            "car_ev": {
                "name": "Electric Vehicle (EV - Average Grid)",
                "factor": 0.053,
                "unit": "kg CO2e / km",
                "region": "Global Average",
                "source": "IEA / DEFRA EV Life-cycle Assessment (Operational)",
                "reference_year": "2023",
                "notes": "Electricity charging indirect emissions at ~0.18 kWh/km"
            },
            "motorbike": {
                "name": "Motorbike / Scooter",
                "factor": 0.113,
                "unit": "kg CO2e / km",
                "region": "Global Average",
                "source": "DEFRA 2023 Two-Wheelers",
                "reference_year": "2023",
                "notes": "Medium motorcycle (125cc-500cc)"
            },
            "bus_transit": {
                "name": "Public Transit Bus (per Passenger)",
                "factor": 0.089,
                "unit": "kg CO2e / passenger-km",
                "region": "Global Average",
                "source": "DEFRA / National Transit Database",
                "reference_year": "2023",
                "notes": "Average occupancy local urban bus service"
            },
            "train_metro": {
                "name": "Train / Metro (per Passenger)",
                "factor": 0.035,
                "unit": "kg CO2e / passenger-km",
                "region": "Global Average",
                "source": "DEFRA 2023 Rail Transit",
                "reference_year": "2023",
                "notes": "Electric heavy rail and subway systems"
            },
            "flight_domestic": {
                "name": "Domestic Flight (Economy)",
                "factor": 0.246,
                "unit": "kg CO2e / passenger-km",
                "region": "Global Average",
                "source": "ICAO / DEFRA Carbon Calculator",
                "reference_year": "2023",
                "notes": "Includes radiative forcing multiplier of ~1.9x for high altitude effects"
            },
            "flight_longhaul": {
                "name": "Long-haul International Flight",
                "factor": 0.150,
                "unit": "kg CO2e / passenger-km",
                "region": "Global Average",
                "source": "ICAO / DEFRA Carbon Calculator",
                "reference_year": "2023",
                "notes": "Includes high altitude cruise phase efficiency"
            },
            "truck_freight": {
                "name": "Heavy Commercial Truck (Rigid >17t)",
                "factor": 0.880,
                "unit": "kg CO2e / km",
                "region": "Global Average",
                "source": "DEFRA Freight Transport 2023",
                "reference_year": "2023",
                "notes": "Average laden heavy commercial freight vehicle"
            },
            "van_delivery": {
                "name": "Light Commercial Delivery Van",
                "factor": 0.241,
                "unit": "kg CO2e / km",
                "region": "Global Average",
                "source": "DEFRA Commercial Vans 2023",
                "reference_year": "2023",
                "notes": "Class III light commercial vehicle"
            }
        }
    },
    "fuel": {
        "name": "Stationary & Direct Fuel Combustion",
        "unit": "liters / kg / m3",
        "description": "Direct stationary combustion fuels (Scope 1)",
        "subcategories": {
            "diesel_liters": {
                "name": "Diesel Fuel (Stationary / Generators)",
                "factor": 2.68,
                "unit": "kg CO2e / liter",
                "region": "Global",
                "source": "IPCC Guidelines for GHG Inventories / DEFRA 2023",
                "reference_year": "2023",
                "notes": "100% mineral diesel, 1 liter = 2.68 kg CO2e"
            },
            "petrol_liters": {
                "name": "Petrol / Gasoline",
                "factor": 2.31,
                "unit": "kg CO2e / liter",
                "region": "Global",
                "source": "DEFRA 2023 Fuel Tables",
                "reference_year": "2023",
                "notes": "Standard retail automotive gasoline"
            },
            "cng_kg": {
                "name": "Compressed Natural Gas (CNG)",
                "factor": 2.75,
                "unit": "kg CO2e / kg",
                "region": "Global",
                "source": "IPCC Stationary Combustion Tables",
                "reference_year": "2023",
                "notes": "Clean burning methane-rich compressed gas"
            },
            "natural_gas_m3": {
                "name": "Natural Gas (Pipeline)",
                "factor": 2.03,
                "unit": "kg CO2e / m³",
                "region": "Global",
                "source": "DEFRA 2023 Gas Conversion",
                "reference_year": "2023",
                "notes": "Standard cubic meter of pipeline natural gas"
            },
            "lpg_liters": {
                "name": "Liquefied Petroleum Gas (LPG - Liquid)",
                "factor": 1.51,
                "unit": "kg CO2e / liter",
                "region": "Global",
                "source": "DEFRA 2023 LPG Factors",
                "reference_year": "2023",
                "notes": "Propane/butane liquid blend"
            },
            "coal_kg": {
                "name": "Bituminous Coal",
                "factor": 2.42,
                "unit": "kg CO2e / kg",
                "region": "Global",
                "source": "IPCC Stationary Combustion",
                "reference_year": "2023",
                "notes": "Industrial boiler coal combustion"
            }
        }
    },
    "operations": {
        "name": "Operational & Facility Activities",
        "unit": "various",
        "description": "Waste, water, paper, and facility operations (Scope 3)",
        "subcategories": {
            "waste_landfill": {
                "name": "Municipal Solid Waste (Landfilled)",
                "factor": 0.58,
                "unit": "kg CO2e / kg",
                "region": "Global Average",
                "source": "EPA WARM Model / DEFRA 2023",
                "reference_year": "2023",
                "notes": "Methane generation from mixed municipal solid waste landfilling"
            },
            "water_supply": {
                "name": "Mains Water Supply & Treatment",
                "factor": 0.344,
                "unit": "kg CO2e / m³",
                "region": "Global Average",
                "source": "DEFRA Water Treatment Tables",
                "reference_year": "2023",
                "notes": "Supply and wastewater treatment combined"
            },
            "paper_office": {
                "name": "Office Paper (Virgin Fiber)",
                "factor": 0.92,
                "unit": "kg CO2e / kg",
                "region": "Global",
                "source": "Environmental Paper Network / DEFRA",
                "reference_year": "2023",
                "notes": "A4 virgin copier paper production footprint"
            },
            "refrigerant_r410a": {
                "name": "Refrigerant Leakage (R-410A)",
                "factor": 2088.0,
                "unit": "kg CO2e / kg",
                "region": "Global",
                "source": "IPCC 4th Assessment Report (AR4) 100-year GWP",
                "reference_year": "2023",
                "notes": "High Global Warming Potential HVAC refrigerant leakage"
            }
        }
    }
}

def get_all_categories() -> List[Dict[str, Any]]:
    result = []
    for cat_key, cat_data in EMISSION_REGISTRY.items():
        result.append({
            "key": cat_key,
            "name": cat_data["name"],
            "unit": cat_data["unit"],
            "description": cat_data["description"],
            "subcategories_count": len(cat_data["subcategories"])
        })
    return result

def get_factor_details(category: str, subcategory: str) -> Dict[str, Any]:
    cat = EMISSION_REGISTRY.get(category.lower())
    if not cat:
        return {}
    return cat["subcategories"].get(subcategory, {})
