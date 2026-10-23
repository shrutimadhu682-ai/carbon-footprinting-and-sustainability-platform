import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from ..config import MODELS_DIR

class MLPipelineService:
    @staticmethod
    def get_algorithm_instance(algorithm_name: str):
        algo = algorithm_name.lower().strip()
        if algo == "linear_regression":
            return LinearRegression()
        elif algo == "gradient_boosting":
            return GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
        else: # default random_forest
            return RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)

    @classmethod
    def train_and_evaluate(
        cls,
        df: pd.DataFrame,
        target_column: str,
        feature_columns: List[str],
        algorithm: str = "random_forest",
        test_size: float = 0.2,
        split_strategy: str = "random",
        date_column: Optional[str] = None
    ) -> Dict[str, Any]:
        """Trains Scikit-learn regression pipeline and computes real evaluation metrics."""
        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' is missing from the dataset.")

        missing_feats = [col for col in feature_columns if col not in df.columns]
        if missing_feats:
            raise ValueError(f"Feature columns not found in dataset: {missing_feats}")

        # Drop rows where target is NaN
        valid_df = df.dropna(subset=[target_column]).copy()
        valid_df[target_column] = pd.to_numeric(valid_df[target_column], errors="coerce")
        valid_df = valid_df.dropna(subset=[target_column])

        if len(valid_df) < 10:
            raise ValueError(f"Insufficient valid data ({len(valid_df)} rows). At least 10 rows are required for ML training.")

        X = valid_df[feature_columns]
        y = valid_df[target_column]

        # Determine numeric and categorical columns
        numeric_features = []
        categorical_features = []
        for col in feature_columns:
            if pd.api.types.is_numeric_dtype(X[col]):
                numeric_features.append(col)
            else:
                categorical_features.append(col)

        # Preprocessing sub-pipelines
        numeric_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])

        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])

        transformers = []
        if numeric_features:
            transformers.append(('num', numeric_transformer, numeric_features))
        if categorical_features:
            transformers.append(('cat', categorical_transformer, categorical_features))

        preprocessor = ColumnTransformer(transformers=transformers)

        # Train / test split
        if split_strategy == "chronological" and date_column and date_column in valid_df.columns:
            sorted_indices = pd.to_datetime(valid_df[date_column], errors='coerce').argsort()
            X_sorted = X.iloc[sorted_indices]
            y_sorted = y.iloc[sorted_indices]
            split_idx = int(len(X_sorted) * (1 - test_size))
            X_train, X_test = X_sorted.iloc[:split_idx], X_sorted.iloc[split_idx:]
            y_train, y_test = y_sorted.iloc[:split_idx], y_sorted.iloc[split_idx:]
        else:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42
            )

        model_estimator = cls.get_algorithm_instance(algorithm)
        full_pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model_estimator)
        ])

        # Fit model
        full_pipeline.fit(X_train, y_train)

        # Predictions on test set
        y_pred = full_pipeline.predict(X_test)

        # Real evaluation metrics
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        # Extract feature importances if available
        feature_importances = {}
        try:
            regressor = full_pipeline.named_steps['regressor']
            if hasattr(regressor, 'feature_importances_'):
                # Get transformed feature names
                transformed_names = []
                if numeric_features:
                    transformed_names.extend(numeric_features)
                if categorical_features:
                    ohe = full_pipeline.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot']
                    cat_names = ohe.get_feature_names_out(categorical_features).tolist()
                    transformed_names.extend(cat_names)
                
                raw_importances = regressor.feature_importances_
                for name, imp in zip(transformed_names[:len(raw_importances)], raw_importances):
                    feature_importances[name] = round(float(imp), 4)
                # Sort descending
                feature_importances = dict(sorted(feature_importances.items(), key=lambda item: item[1], reverse=True)[:10])
            elif hasattr(regressor, 'coef_'):
                coefs = regressor.coef_
                for name, coef in zip(numeric_features[:len(coefs)], coefs):
                    feature_importances[name] = round(float(abs(coef)), 4)
        except Exception:
            pass

        # Sample actual vs predicted points for chart
        actual_vs_predicted = []
        residuals = []
        for act, pred in zip(y_test.head(30), y_pred[:30]):
            res = float(pred - act)
            actual_vs_predicted.append({
                "actual": round(float(act), 2),
                "predicted": round(float(pred), 2)
            })
            residuals.append({
                "actual": round(float(act), 2),
                "residual": round(res, 2)
            })

        explanation = {
            "r2_score": f"The model explains {max(0.0, round(r2 * 100, 1))}% of variance in test data.",
            "mae": f"On average, emissions predictions deviate by ±{round(mae, 2)} kg CO2e.",
            "rmse": f"Root mean squared error is {round(rmse, 2)} kg CO2e, penalizing larger deviations.",
            "split_info": f"Trained on {len(X_train)} samples, evaluated on {len(X_test)} unseen test samples."
        }

        return {
            "pipeline": full_pipeline,
            "metrics": {
                "mae": round(mae, 2),
                "rmse": round(rmse, 2),
                "r2_score": round(r2, 4),
                "train_samples": len(X_train),
                "test_samples": len(X_test),
                "feature_importances": feature_importances
            },
            "actual_vs_predicted": actual_vs_predicted,
            "residuals": residuals,
            "explanation": explanation
        }

    @classmethod
    def save_model(cls, model_id: str, pipeline: Pipeline) -> str:
        file_path = MODELS_DIR / f"{model_id}.joblib"
        joblib.dump(pipeline, file_path)
        return str(file_path)

    @classmethod
    def load_model(cls, model_path: str) -> Pipeline:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model artifact not found: {model_path}")
        return joblib.load(model_path)

    @classmethod
    def predict_single(cls, model_path: str, feature_dict: Dict[str, Any]) -> float:
        pipeline = cls.load_model(model_path)
        input_df = pd.DataFrame([feature_dict])
        pred = pipeline.predict(input_df)[0]
        return float(pred)

    @classmethod
    def run_clustering(
        cls,
        df: pd.DataFrame,
        feature_columns: List[str],
        n_clusters: int = 3
    ) -> Dict[str, Any]:
        """Performs K-Means clustering to discover activity & emission profile archetypes."""
        missing = [c for c in feature_columns if c not in df.columns]
        if missing:
            raise ValueError(f"Features missing for clustering: {missing}")

        X = df[feature_columns].copy()
        numeric_cols = [c for c in feature_columns if pd.api.types.is_numeric_dtype(X[c])]

        if not numeric_cols:
            raise ValueError("Clustering requires at least one numeric feature column.")

        X_num = X[numeric_cols].fillna(X[numeric_cols].median())
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_num)

        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
        cluster_labels = kmeans.fit_predict(X_scaled)
        df_clustered = X_num.copy()
        df_clustered['cluster'] = cluster_labels

        cluster_profiles = []
        for c_id in range(n_clusters):
            c_data = df_clustered[df_clustered['cluster'] == c_id]
            stats = {}
            for col in numeric_cols:
                stats[col] = {
                    "mean": round(float(c_data[col].mean()), 2),
                    "min": round(float(c_data[col].min()), 2),
                    "max": round(float(c_data[col].max()), 2)
                }
            cluster_profiles.append({
                "cluster_id": c_id,
                "label": f"Cluster {c_id + 1}: {'High' if c_id == 0 else 'Moderate' if c_id == 1 else 'Low'} Intensity Group",
                "sample_count": len(c_data),
                "percentage": round(len(c_data) / len(df_clustered) * 100, 1),
                "feature_averages": stats
            })

        # 2D projection for scatter plot
        if len(numeric_cols) >= 2:
            pca = PCA(n_components=2)
            coords = pca.fit_transform(X_scaled)
            scatter_points = []
            for i in range(min(100, len(coords))):
                scatter_points.append({
                    "x": round(float(coords[i, 0]), 3),
                    "y": round(float(coords[i, 1]), 3),
                    "cluster": int(cluster_labels[i])
                })
        else:
            scatter_points = []
            for i in range(min(100, len(X_num))):
                scatter_points.append({
                    "x": round(float(X_num.iloc[i, 0]), 2),
                    "y": 0.0,
                    "cluster": int(cluster_labels[i])
                })

        return {
            "clusters_count": n_clusters,
            "cluster_profiles": cluster_profiles,
            "scatter_points": scatter_points
        }
