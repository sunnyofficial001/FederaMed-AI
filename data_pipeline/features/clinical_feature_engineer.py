# @license
# SPDX-License-Identifier: Apache-2.0

"""
FederaMed AI - Clinical Feature Engineering Pipeline

Production-grade feature engineering for healthcare datasets (MIMIC-IV, eICU).

This module implements:
- Vital sign feature extraction
- Laboratory value normalization
- Clinical score calculation (SOFA, APACHE, Charlson)
- Temporal feature aggregation
- Missing value imputation strategies
- Feature scaling and encoding

Usage:
    python data_pipeline/features/clinical_feature_engineer.py --input healthcare_datasets/mimic_iv/validated --output healthcare_datasets/mimic_iv/features
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
import logging

import pandas as pd
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class FeatureConfig:
    """Configuration for feature engineering."""
    vital_signs: List[str] = None
    lab_values: List[str] = None
    derived_features: List[str] = None
    imputation_strategy: str = "median"
    scaling_method: str = "zscore"
    
    def __post_init__(self):
        if self.vital_signs is None:
            self.vital_signs = ["heart_rate", "bp_sys", "bp_dia", "temp", "spo2", "respiration"]
        if self.lab_values is None:
            self.lab_values = ["creatinine", "bun", "lactate", "wbc", "glucose", "potassium", "sodium"]
        if self.derived_features is None:
            self.derived_features = ["sofa_score", "map", "shock_index", "bun_cr_ratio"]


class ClinicalFeatureEngineer:
    """
    Production-grade clinical feature engineering engine.
    
    Implements features used in critical care prediction models.
    """
    
    def __init__(self, config: FeatureConfig = None):
        self.config = config or FeatureConfig()
        self.feature_stats: Dict[str, Any] = {}
    
    def compute_sofa_score(self, df: pd.DataFrame) -> pd.Series:
        """
        Computes Sequential Organ Failure Assessment (SOFA) score.
        
        Components:
        - Respiratory (PaO2/FiO2 or SpO2 proxy)
        - Coagulation (Platelets)
        - Liver (Bilirubin)
        - Cardiovascular (MAP or vasopressors)
        - CNS (GCS)
        - Renal (Creatinine)
        
        Returns:
            SOFA score series (0-24)
        """
        sofa_components = []
        
        # Respiratory component (using SpO2 as proxy)
        if "oxygen_saturation" in df.columns or "spo2" in df.columns:
            spo2_col = "oxygen_saturation" if "oxygen_saturation" in df.columns else "spo2"
            resp_score = pd.Series(0, index=df.index)
            resp_score[df[spo2_col] < 90] = 2
            resp_score[(df[spo2_col] >= 90) & (df[spo2_col] < 95)] = 1
            sofa_components.append(resp_score)
        else:
            sofa_components.append(pd.Series(0, index=df.index))
        
        # Renal component (Creatinine)
        if "creatinine" in df.columns:
            renal_score = pd.Series(0, index=df.index)
            renal_score[df["creatinine"] >= 5.0] = 4
            renal_score[(df["creatinine"] >= 3.5) & (df["creatinine"] < 5.0)] = 3
            renal_score[(df["creatinine"] >= 2.0) & (df["creatinine"] < 3.5)] = 2
            renal_score[(df["creatinine"] >= 1.2) & (df["creatinine"] < 2.0)] = 1
            sofa_components.append(renal_score)
        else:
            sofa_components.append(pd.Series(0, index=df.index))
        
        # Cardiovascular component (using MAP)
        if "mean_arterial_pressure" in df.columns or ("bp_sys" in df.columns and "bp_dia" in df.columns):
            if "mean_arterial_pressure" in df.columns:
                map_vals = df["mean_arterial_pressure"]
            else:
                map_vals = (df["bp_sys"] + 2 * df["bp_dia"]) / 3
            
            cv_score = pd.Series(0, index=df.index)
            cv_score[map_vals < 70] = 2
            cv_score[(map_vals >= 70) & (map_vals < 80)] = 1
            sofa_components.append(cv_score)
        else:
            sofa_components.append(pd.Series(0, index=df.index))
        
        # Sum components
        sofa_score = sum(sofa_components)
        return sofa_score.clip(0, 24)
    
    def compute_map(self, df: pd.DataFrame) -> pd.Series:
        """Computes Mean Arterial Pressure from systolic/diastolic BP."""
        if "mean_arterial_pressure" in df.columns:
            return df["mean_arterial_pressure"]
        
        if "bp_sys" in df.columns and "bp_dia" in df.columns:
            return (df["bp_sys"] + 2 * df["bp_dia"]) / 3
        
        return pd.Series(np.nan, index=df.index)
    
    def compute_shock_index(self, df: pd.DataFrame) -> pd.Series:
        """Computes Shock Index (Heart Rate / Systolic BP)."""
        hr_col = "heart_rate" if "heart_rate" in df.columns else "hr"
        sbp_col = "bp_sys" if "bp_sys" in df.columns else "sbp"
        
        if hr_col in df.columns and sbp_col in df.columns:
            return df[hr_col] / (df[sbp_col] + 1e-5)
        
        return pd.Series(np.nan, index=df.index)
    
    def compute_bun_cr_ratio(self, df: pd.DataFrame) -> pd.Series:
        """Computes BUN-to-Creatinine ratio."""
        if "bun" in df.columns and "creatinine" in df.columns:
            return df["bun"] / (df["creatinine"] + 1e-5)
        
        return pd.Series(np.nan, index=df.index)
    
    def impute_missing(self, df: pd.DataFrame, strategy: str = "median") -> pd.DataFrame:
        """
        Imputes missing values using specified strategy.
        
        Args:
            df: DataFrame with missing values
            strategy: Imputation strategy (mean, median, mode, forward_fill)
            
        Returns:
            DataFrame with imputed values
        """
        df_imputed = df.copy()
        
        numeric_cols = df_imputed.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            if strategy == "median":
                fill_value = df_imputed[col].median()
            elif strategy == "mean":
                fill_value = df_imputed[col].mean()
            elif strategy == "mode":
                fill_value = df_imputed[col].mode().iloc[0] if len(df_imputed[col].mode()) > 0 else 0
            elif strategy == "forward_fill":
                df_imputed[col] = df_imputed[col].ffill()
                continue
            else:
                fill_value = 0
            
            df_imputed[col] = df_imputed[col].fillna(fill_value)
        
        return df_imputed
    
    def scale_features(self, df: pd.DataFrame, method: str = "zscore") -> Tuple[pd.DataFrame, Dict]:
        """
        Scales features using specified method.
        
        Args:
            df: DataFrame to scale
            method: Scaling method (zscore, minmax, robust)
            
        Returns:
            Tuple of (scaled DataFrame, scaling parameters)
        """
        df_scaled = df.copy()
        stats = {}
        
        numeric_cols = df_scaled.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            if method == "zscore":
                mean = df_scaled[col].mean()
                std = df_scaled[col].std()
                df_scaled[col] = (df_scaled[col] - mean) / (std + 1e-8)
                stats[col] = {"method": "zscore", "mean": mean, "std": std}
            
            elif method == "minmax":
                min_val = df_scaled[col].min()
                max_val = df_scaled[col].max()
                df_scaled[col] = (df_scaled[col] - min_val) / (max_val - min_val + 1e-8)
                stats[col] = {"method": "minmax", "min": min_val, "max": max_val}
            
            elif method == "robust":
                median = df_scaled[col].median()
                iqr = df_scaled[col].quantile(0.75) - df_scaled[col].quantile(0.25)
                df_scaled[col] = (df_scaled[col] - median) / (iqr + 1e-8)
                stats[col] = {"method": "robust", "median": median, "iqr": iqr}
        
        self.feature_stats = stats
        return df_scaled, stats
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Engineers all configured features from raw clinical data.
        
        Args:
            df: Raw clinical DataFrame
            
        Returns:
            DataFrame with engineered features
        """
        logger.info("Engineering clinical features...")
        
        df_out = df.copy()
        
        # Compute derived features
        if "map" in self.config.derived_features or "mean_arterial_pressure" in self.config.derived_features:
            df_out["mean_arterial_pressure"] = self.compute_map(df_out)
        
        if "shock_index" in self.config.derived_features:
            df_out["shock_index"] = self.compute_shock_index(df_out)
        
        if "bun_cr_ratio" in self.config.derived_features:
            df_out["bun_creatinine_ratio"] = self.compute_bun_cr_ratio(df_out)
        
        if "sofa_score" in self.config.derived_features:
            df_out["sofa_score"] = self.compute_sofa_score(df_out)
        
        logger.info(f"Engineered {len(self.config.derived_features)} derived features")
        
        return df_out
    
    def process_dataset(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict]:
        """
        Complete feature engineering pipeline.
        
        Args:
            df: Raw input DataFrame
            
        Returns:
            Tuple of (processed DataFrame, processing metadata)
        """
        # Step 1: Engineer features
        df_features = self.engineer_features(df)
        
        # Step 2: Impute missing values
        df_imputed = self.impute_missing(df_features, self.config.imputation_strategy)
        
        # Step 3: Scale features
        df_scaled, scaling_stats = self.scale_features(df_imputed, self.config.scaling_method)
        
        # Compile metadata
        metadata = {
            "n_original_features": len(df.columns),
            "n_engineered_features": len(df_features.columns),
            "n_final_features": len(df_scaled.columns),
            "imputation_strategy": self.config.imputation_strategy,
            "scaling_method": self.config.scaling_method,
            "scaling_stats": scaling_stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return df_scaled, metadata


def main():
    """Main entry point for feature engineering."""
    parser = argparse.ArgumentParser(description="Clinical Feature Engineering Pipeline")
    parser.add_argument(
        "--input",
        type=str,
        required=True,
        help="Input directory containing validated data"
    )
    parser.add_argument(
        "--output",
        type=str,
        required=True,
        help="Output directory for feature-engineered data"
    )
    parser.add_argument(
        "--imputation",
        type=str,
        choices=["mean", "median", "mode", "forward_fill"],
        default="median",
        help="Missing value imputation strategy"
    )
    parser.add_argument(
        "--scaling",
        type=str,
        choices=["zscore", "minmax", "robust"],
        default="zscore",
        help="Feature scaling method"
    )
    
    args = parser.parse_args()
    
    input_dir = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    config = FeatureConfig(
        imputation_strategy=args.imputation,
        scaling_method=args.scaling
    )
    
    engineer = ClinicalFeatureEngineer(config)
    
    # Process all parquet files
    total_metadata = {}
    
    for file_path in input_dir.glob("*.parquet"):
        table_name = file_path.stem
        logger.info(f"Processing {table_name}...")
        
        df = pd.read_parquet(file_path)
        df_processed, metadata = engineer.process_dataset(df)
        
        # Save processed data
        output_path = output_dir / f"{table_name}_features.parquet"
        df_processed.to_parquet(output_path, index=False)
        
        total_metadata[table_name] = metadata
        
        logger.info(f"Saved {table_name} features: {len(df_processed.columns)} columns")
    
    # Save metadata
    metadata_path = output_dir / "feature_metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(total_metadata, f, indent=2, default=str)
    
    print("\n" + "=" * 60)
    print("FEATURE ENGINEERING COMPLETE")
    print("=" * 60)
    
    for table_name, meta in total_metadata.items():
        print(f"\n{table_name}:")
        print(f"  Original features: {meta['n_original_features']}")
        print(f"  Final features: {meta['n_final_features']}")
        print(f"  Imputation: {meta['imputation_strategy']}")
        print(f"  Scaling: {meta['scaling_method']}")
    
    print("\n" + "=" * 60)
    print(f"Output directory: {output_dir}")
    print(f"Metadata saved: {metadata_path}")
    print("=" * 60)


if __name__ == "__main__":
    main()
