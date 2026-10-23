from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..database.models import ActionPlan
from ..schemas.schemas import RecommendationItem, ActionPlanCreate, ActionPlanResponse, ScenarioSimulationResponse

class RecommendationService:
    @staticmethod
    def generate_recommendations(analysis_data: Dict[str, Any]) -> List[RecommendationItem]:
        """Transparent rule-based recommendation generator driven by measured metrics."""
        recommendations = []
        total_kg = analysis_data.get("total_emissions_kg", 0)
        categories = analysis_data.get("category_breakdown", [])
        timeline = analysis_data.get("timeline_breakdown", [])
        outliers_count = analysis_data.get("potential_outliers_count", 0)

        # Rule 1: High Electricity Intensity
        elec_cat = next((c for c in categories if "elec" in c["category"].lower() or "power" in c["category"].lower()), None)
        if elec_cat:
            pct = elec_cat.get("percentage", 0)
            if pct >= 30:
                recommendations.append(RecommendationItem(
                    id="rec-elec-solar-efficiency",
                    category="Electricity",
                    title="Energy Efficiency & Rooftop Solar Feasibility Study",
                    reason=f"Electricity represents {pct}% ({round(elec_cat['total_emissions_tonnes'], 2)} tCO2e) of total measured emissions.",
                    metric_value=f"{pct}% of Total",
                    recommended_action="Conduct an ISO 50001 energy audit, evaluate LED retrofitting, variable frequency drives (VFDs) on HVAC motors, and assess rooftop solar PPA options.",
                    impact_level="High",
                    urgency="Immediate"
                ))
            elif pct > 15:
                recommendations.append(RecommendationItem(
                    id="rec-elec-submetering",
                    category="Electricity",
                    title="Deploy Departmental Smart Sub-metering",
                    reason=f"Electricity accounts for {pct}% of your footprint across operations.",
                    metric_value=f"{pct}% of Total",
                    recommended_action="Install IoT smart sub-meters across main distribution boards to identify idle baseload power waste outside business hours.",
                    impact_level="Medium",
                    urgency="Medium-term"
                ))

        # Rule 2: High Transportation / Logistics
        trans_cat = next((c for c in categories if any(k in c["category"].lower() for k in ["trans", "fleet", "logistics", "vehicle", "commute"])), None)
        if trans_cat:
            pct = trans_cat.get("percentage", 0)
            if pct >= 25:
                recommendations.append(RecommendationItem(
                    id="rec-trans-fleet-electrification",
                    category="Transportation",
                    title="Commercial Fleet Transition to Electric Vehicles (EV)",
                    reason=f"Transportation constitutes {pct}% ({round(trans_cat['total_emissions_tonnes'], 2)} tCO2e) of organizational emissions.",
                    metric_value=f"{pct}% of Total",
                    recommended_action="Pilot light commercial electric vans for urban distribution routes under 150 km and implement algorithmic route dispatch to reduce unladen mileage.",
                    impact_level="High",
                    urgency="Immediate"
                ))
            elif pct > 10:
                recommendations.append(RecommendationItem(
                    id="rec-trans-commute-policy",
                    category="Transportation",
                    title="Promote Low-Carbon Commute & Carpooling",
                    reason=f"Travel activities represent {pct}% of recorded footprint.",
                    metric_value=f"{pct}% of Total",
                    recommended_action="Offer public transit subsidies, corporate carpooling incentives, and flexible remote-work policies for eligible departments.",
                    impact_level="Medium",
                    urgency="Medium-term"
                ))

        # Rule 3: High Direct Fuel Combustion (Scope 1)
        fuel_cat = next((c for c in categories if any(k in c["category"].lower() for k in ["fuel", "diesel", "gas", "coal", "boiler"])), None)
        if fuel_cat:
            pct = fuel_cat.get("percentage", 0)
            if pct >= 20:
                recommendations.append(RecommendationItem(
                    id="rec-fuel-boiler-heat-recovery",
                    category="Fuel & Heating",
                    title="Industrial Heat Recovery & Fuel Switching Assessment",
                    reason=f"Direct fuel combustion generates {pct}% ({round(fuel_cat['total_emissions_tonnes'], 2)} tCO2e) of measured emissions.",
                    metric_value=f"{pct}% of Total",
                    recommended_action="Inspect thermal insulation on steam/hot water lines, install flue gas economizers, and evaluate transition from heavy oil/diesel to piped natural gas or heat pumps.",
                    impact_level="High",
                    urgency="Immediate"
                ))

        # Rule 4: Increasing Timeline Trend
        if len(timeline) >= 3:
            first_half = timeline[:len(timeline)//2]
            second_half = timeline[len(timeline)//2:]
            avg_first = sum(t["emissions_kg"] for t in first_half) / max(1, len(first_half))
            avg_second = sum(t["emissions_kg"] for t in second_half) / max(1, len(second_half))
            if avg_second > avg_first * 1.1:
                increase_pct = round(((avg_second - avg_first) / avg_first) * 100, 1)
                recommendations.append(RecommendationItem(
                    id="rec-trend-rising-emissions",
                    category="Emissions Trend",
                    title="Investigate Upward Emission Trajectory",
                    reason=f"Average emissions increased by {increase_pct}% between the first and second observation halves.",
                    metric_value=f"+{increase_pct}% Trend",
                    recommended_action="Perform variance decomposition to isolate whether increase stems from business expansion, capacity ramp-up, or operational degradation.",
                    impact_level="High",
                    urgency="Immediate"
                ))

        # Rule 5: Statistical Outliers Flagged
        if outliers_count > 0:
            recommendations.append(RecommendationItem(
                id="rec-data-outlier-audit",
                category="Data Governance",
                title="Operational Audit of Extreme Consumption Events",
                reason=f"Found {outliers_count} statistically abnormal data points outside 1.5 × Interquartile Range.",
                metric_value=f"{outliers_count} Outlier Rows",
                recommended_action="Verify meter readings, billing slips, or equipment logs on peak emission dates to eliminate data entry typos or identify equipment failures.",
                impact_level="Medium",
                urgency="Immediate"
            ))

        # Fallback general recommendation if no specific threshold triggered
        if not recommendations:
            recommendations.append(RecommendationItem(
                id="rec-general-baseline",
                category="General ESG",
                title="Establish Automated Granular Activity Logging",
                reason="Measured data demonstrates balanced activity distribution with no single category dominating above 30%.",
                metric_value=f"{len(categories)} Categories Monitored",
                recommended_action="Continue monthly reporting, implement API integrations for utility meter bills, and set science-based reduction targets (SBTi).",
                impact_level="Medium",
                urgency="Medium-term"
            ))

        return recommendations

    @staticmethod
    def simulate_scenario(
        baseline_kg: float,
        reduction_percentage: float,
        category: str,
        interventions: List[str]
    ) -> ScenarioSimulationResponse:
        """Transparent What-If simulation without fabricating guarantees."""
        hypothetical_savings = round(baseline_kg * (reduction_percentage / 100.0), 2)
        projected = round(baseline_kg - hypothetical_savings, 2)
        
        disclaimer = (
            "Hypothetical Scenario Calculation: This projection assumes full implementation of selected "
            "interventions and linear emission reduction. It does not constitute a guaranteed engineering outcome "
            "and depends on operational factors, grid decarbonization rates, and ongoing maintenance."
        )

        return ScenarioSimulationResponse(
            scenario_label=f"Target: -{reduction_percentage}% in {category}",
            baseline_emissions_kg=round(baseline_kg, 2),
            reduction_percentage=reduction_percentage,
            hypothetical_savings_kg=hypothetical_savings,
            projected_emissions_kg=projected,
            disclaimer=disclaimer
        )

    @staticmethod
    def save_action_plan(db: Session, plan_data: ActionPlanCreate) -> ActionPlanResponse:
        record = ActionPlan(
            recommendation_id=plan_data.recommendation_id,
            category=plan_data.category,
            title=plan_data.title,
            description=plan_data.description,
            potential_impact=plan_data.potential_impact,
            status="evaluating",
            target_date=plan_data.target_date or "",
            notes=plan_data.notes or ""
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return ActionPlanResponse(
            id=record.id,
            recommendation_id=record.recommendation_id,
            category=record.category,
            title=record.title,
            description=record.description,
            potential_impact=record.potential_impact,
            status=record.status,
            target_date=record.target_date,
            notes=record.notes,
            created_at=record.created_at
        )

    @staticmethod
    def list_action_plans(db: Session) -> List[ActionPlanResponse]:
        plans = db.query(ActionPlan).order_by(ActionPlan.created_at.desc()).all()
        return [
            ActionPlanResponse(
                id=p.id,
                recommendation_id=p.recommendation_id,
                category=p.category,
                title=p.title,
                description=p.description,
                potential_impact=p.potential_impact,
                status=p.status,
                target_date=p.target_date,
                notes=p.notes,
                created_at=p.created_at
            ) for p in plans
        ]

    @staticmethod
    def delete_action_plan(db: Session, plan_id: str) -> bool:
        record = db.query(ActionPlan).filter(ActionPlan.id == plan_id).first()
        if not record:
            return False
        db.delete(record)
        db.commit()
        return True
