import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

class DataProcessor:
    @staticmethod
    def inspect_and_preview(file_path: Path, max_rows: int = 10) -> Dict[str, Any]:
        """Loads first rows and metadata for dataset preview."""
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            df = pd.read_csv(file_path)
        except Exception as e:
            raise ValueError(f"Could not parse CSV file: {str(e)}")

        row_count = len(df)
        columns = df.columns.tolist()
        column_types = {col: str(df[col].dtype) for col in columns}
        missing_summary = {col: int(df[col].isna().sum()) for col in columns}
        duplicate_count = int(df.duplicated().sum())

        # Intelligent column suggestions based on naming heuristics
        suggestions = []
        for col in columns:
            lower = col.lower().strip()
            role = None
            if any(k in lower for k in ["co2", "emission", "carbon", "kgco2", "tco2", "target"]):
                role = "emissions"
            elif any(k in lower for k in ["cat", "type", "scope", "sector", "activity_type"]):
                role = "category"
            elif any(k in lower for k in ["date", "time", "month", "year", "period"]):
                role = "date"
            elif any(k in lower for k in ["dept", "department", "facility", "site", "plant", "office", "branch"]):
                role = "department"
            elif any(k in lower for k in ["amount", "consumption", "kwh", "km", "liter", "volume", "quantity"]):
                role = "activity"
            elif pd.api.types.is_numeric_dtype(df[col]):
                role = "feature"

            sample_vals = df[col].dropna().head(3).tolist()
            # Convert any non-serializable objects to string
            clean_samples = [v.item() if hasattr(v, 'item') else str(v) for v in sample_vals]

            suggestions.append({
                "column": col,
                "suggested_role": role,
                "data_type": str(df[col].dtype),
                "sample_values": clean_samples,
                "missing_count": int(df[col].isna().sum())
            })

        # Replace NaN with None for JSON serialization
        head_data = df.head(max_rows).replace({np.nan: None}).to_dict(orient="records")

        return {
            "row_count": row_count,
            "columns": columns,
            "column_types": column_types,
            "head_rows": head_data,
            "column_suggestions": suggestions,
            "missing_summary": missing_summary,
            "duplicate_count": duplicate_count
        }

    @staticmethod
    def analyze_dataset(
        file_path: Path,
        emissions_col: str,
        category_col: Optional[str] = None,
        date_col: Optional[str] = None,
        department_col: Optional[str] = None,
        activity_col: Optional[str] = None
    ) -> Dict[str, Any]:
        """Runs the 10-stage processing pipeline on the mapped dataset."""
        if not file_path.exists():
            raise FileNotFoundError(f"Dataset file not found at: {file_path}")

        df = pd.read_csv(file_path)

        if emissions_col not in df.columns:
            raise ValueError(f"Selected emissions target column '{emissions_col}' was not found in dataset columns: {df.columns.tolist()}")

        total_records = len(df)
        duplicate_records = int(df.duplicated().sum())
        missing_values = {col: int(df[col].isna().sum()) for col in df.columns}

        # Stage 4 & 5: Clean and parse numeric target
        df[emissions_col] = pd.to_numeric(df[emissions_col], errors="coerce")
        valid_emissions_mask = df[emissions_col].notna() & (df[emissions_col] >= 0)
        df_clean = df[valid_emissions_mask].copy()

        if len(df_clean) == 0:
            raise ValueError(f"Target column '{emissions_col}' contains no valid non-negative numeric data.")

        target_series = df_clean[emissions_col]
        total_kg = float(target_series.sum())
        total_tonnes = round(total_kg / 1000.0, 4)
        mean_kg = float(target_series.mean())
        median_kg = float(target_series.median())
        std_kg = float(target_series.std()) if len(target_series) > 1 else 0.0
        min_kg = float(target_series.min())
        max_kg = float(target_series.max())

        # Stage 6: Outlier detection using IQR
        q25 = float(target_series.quantile(0.25))
        q75 = float(target_series.quantile(0.75))
        iqr = q75 - q25
        lower_bound = q25 - 1.5 * iqr
        upper_bound = q75 + 1.5 * iqr
        outliers_count = int(((target_series < lower_bound) | (target_series > upper_bound)).sum())

        # Category breakdown
        category_breakdown = []
        if category_col and category_col in df_clean.columns:
            df_clean[category_col] = df_clean[category_col].fillna("Uncategorized").astype(str)
            cat_grouped = df_clean.groupby(category_col)[emissions_col].agg(['sum', 'count', 'mean']).reset_index()
            cat_grouped = cat_grouped.sort_values(by='sum', ascending=False)
            for _, r in cat_grouped.iterrows():
                subtotal = float(r['sum'])
                pct = round((subtotal / total_kg * 100), 2) if total_kg > 0 else 0
                category_breakdown.append({
                    "category": str(r[category_col]),
                    "total_emissions_kg": round(subtotal, 2),
                    "total_emissions_tonnes": round(subtotal / 1000.0, 4),
                    "records_count": int(r['count']),
                    "average_emissions_kg": round(float(r['mean']), 2),
                    "percentage": pct
                })
        else:
            category_breakdown.append({
                "category": "All Activities",
                "total_emissions_kg": round(total_kg, 2),
                "total_emissions_tonnes": total_tonnes,
                "records_count": len(df_clean),
                "average_emissions_kg": round(mean_kg, 2),
                "percentage": 100.0
            })

        # Department / Facility breakdown
        department_breakdown = []
        if department_col and department_col in df_clean.columns:
            df_clean[department_col] = df_clean[department_col].fillna("General").astype(str)
            dept_grouped = df_clean.groupby(department_col)[emissions_col].agg(['sum', 'count']).reset_index()
            dept_grouped = dept_grouped.sort_values(by='sum', ascending=False)
            for _, r in dept_grouped.iterrows():
                subtotal = float(r['sum'])
                department_breakdown.append({
                    "department": str(r[department_col]),
                    "total_emissions_kg": round(subtotal, 2),
                    "total_emissions_tonnes": round(subtotal / 1000.0, 4),
                    "records_count": int(r['count']),
                    "percentage": round((subtotal / total_kg * 100), 2) if total_kg > 0 else 0
                })

        # Timeline breakdown
        timeline_breakdown = []
        if date_col and date_col in df_clean.columns:
            try:
                df_clean['_parsed_date'] = pd.to_datetime(df_clean[date_col], errors='coerce')
                valid_date_df = df_clean.dropna(subset=['_parsed_date']).sort_values('_parsed_date')
                if not valid_date_df.empty:
                    # Group by Month-Year or Date
                    valid_date_df['period'] = valid_date_df['_parsed_date'].dt.to_period('M').astype(str)
                    time_grouped = valid_date_df.groupby('period')[emissions_col].agg(['sum', 'count']).reset_index()
                    for _, r in time_grouped.iterrows():
                        subtotal = float(r['sum'])
                        timeline_breakdown.append({
                            "period": str(r['period']),
                            "emissions_kg": round(subtotal, 2),
                            "emissions_tonnes": round(subtotal / 1000.0, 4),
                            "records_count": int(r['count'])
                        })
            except Exception:
                # If date parsing fails, leave timeline_breakdown empty
                pass

        # Correlation between numeric features
        numeric_df = df_clean.select_dtypes(include=[np.number])
        correlations = {}
        if numeric_df.shape[1] > 1:
            corr_matrix = numeric_df.corr().fillna(0)
            for col1 in corr_matrix.columns:
                correlations[col1] = {col2: round(float(corr_matrix.loc[col1, col2]), 4) for col2 in corr_matrix.columns}

        # Data quality score evaluation (0-100)
        quality_score = 100.0
        quality_notes = []

        total_cells = df.size
        total_missing = sum(missing_values.values())
        missing_rate = (total_missing / total_cells) if total_cells > 0 else 0
        if missing_rate > 0.05:
            penalty = min(30.0, missing_rate * 50)
            quality_score -= penalty
            quality_notes.append(f"Missing values represent {round(missing_rate * 100, 1)}% of all data cells.")

        if duplicate_records > 0:
            dup_rate = duplicate_records / total_records
            quality_score -= min(15.0, dup_rate * 30)
            quality_notes.append(f"Found {duplicate_records} duplicate records ({round(dup_rate * 100, 1)}%).")

        if outliers_count > 0:
            quality_notes.append(f"Identified {outliers_count} statistical outlier(s) (beyond 1.5 × IQR).")

        if len(category_breakdown) < 2 and category_col:
            quality_notes.append("Only a single distinct category found; category-based variance cannot be benchmarked.")

        if not quality_notes:
            quality_notes.append("Excellent dataset integrity with zero missing values and high consistency.")

        return {
            "total_records": total_records,
            "duplicate_records": duplicate_records,
            "missing_values": missing_values,
            "total_emissions_kg": round(total_kg, 2),
            "total_emissions_tonnes": total_tonnes,
            "mean_emissions_kg": round(mean_kg, 2),
            "median_emissions_kg": round(median_kg, 2),
            "std_emissions_kg": round(std_kg, 2),
            "min_emissions_kg": round(min_kg, 2),
            "max_emissions_kg": round(max_kg, 2),
            "category_breakdown": category_breakdown,
            "department_breakdown": department_breakdown,
            "timeline_breakdown": timeline_breakdown,
            "correlations": correlations,
            "potential_outliers_count": outliers_count,
            "data_quality_score": round(max(0.0, min(100.0, quality_score)), 1),
            "quality_notes": quality_notes
        }
