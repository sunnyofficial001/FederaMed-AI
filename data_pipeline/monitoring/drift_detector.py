# @license
# SPDX-License-Identifier: Apache-2.0

"""
FederaMed AI - Data Drift Monitoring Framework

Production-grade drift detection for healthcare datasets across federated nodes.

This module implements:
- Statistical drift detection (PSI, KS test, Wasserstein distance)
- Feature distribution monitoring
- Label drift detection
- Covariate shift analysis
- Concept drift detection
- Automated alerting thresholds

Usage:
    python data_pipeline/monitoring/drift_detector.py --reference healthcare_datasets/mimic_iv/features --target healthcare_datasets/eicu/features
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict, field
import logging

import pandas as pd
import numpy as np
from scipy import stats

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class DriftResult:
    """Result of drift detection for a single feature."""
    feature_name: str
    drift_detected: bool
    psi_score: float
    ks_statistic: float
    ks_pvalue: float
    wasserstein_distance: float
    mean_shift: float
    std_ratio: float
    severity: str  # "low", "medium", "high", "critical"


@dataclass
class DriftReport:
    """Comprehensive drift report across all features."""
    reference_dataset: str
    target_dataset: str
    comparison_timestamp: str
    total_features: int
    drifted_features: int
    drift_rate: float
    overall_severity: str
    feature_results: List[DriftResult] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)


class HealthcareDriftDetector:
    """
    Production-grade drift detector for healthcare federated learning.
    
    Implements multiple drift detection methods:
    - Population Stability Index (PSI)
    - Kolmogorov-Smirnov test
    - Wasserstein distance
    - Mean/std shift analysis
    """
    
    def __init__(self, psi_thresholds: Dict[str, float] = None,
                 ks_alpha: float = 0.05):
        """
        Initialize drift detector with configurable thresholds.
        
        Args:
            psi_thresholds: PSI threshold dict (low, medium, high, critical)
            ks_alpha: Significance level for KS test
        """
        self.psi_thresholds = psi_thresholds or {
            "low": 0.1,
            "medium": 0.2,
            "high": 0.3,
            "critical": 0.4
        }
        self.ks_alpha = ks_alpha
        self.drift_history: List[DriftReport] = []
    
    def compute_psi(self, reference: np.ndarray, target: np.ndarray, 
                    n_bins: int = 10) -> float:
        """
        Computes Population Stability Index (PSI) between two distributions.
        
        PSI < 0.1: No significant change
        0.1 <= PSI < 0.2: Moderate change
        0.2 <= PSI < 0.3: Significant change
        PSI >= 0.3: Highly significant change
        
        Args:
            reference: Reference distribution array
            target: Target distribution array
            n_bins: Number of bins for discretization
            
        Returns:
            PSI score
        """
        # Handle NaN values
        reference = reference[~np.isnan(reference)]
        target = target[~np.isnan(target)]
        
        if len(reference) == 0 or len(target) == 0:
            return float('nan')
        
        # Create bins based on reference distribution
        min_val = min(reference.min(), target.min())
        max_val = max(reference.max(), target.max())
        
        # Add small epsilon to avoid division by zero
        epsilon = 1e-10
        
        bins = np.linspace(min_val, max_val, n_bins + 1)
        
        # Calculate percentages in each bin
        ref_counts, _ = np.histogram(reference, bins=bins)
        target_counts, _ = np.histogram(target, bins=bins)
        
        ref_pcts = (ref_counts + epsilon) / (len(reference) + epsilon * n_bins)
        target_pcts = (target_counts + epsilon) / (len(target) + epsilon * n_bins)
        
        # Calculate PSI
        psi = np.sum((target_pcts - ref_pcts) * np.log(target_pcts / ref_pcts))
        
        return psi
    
    def compute_ks_test(self, reference: np.ndarray, target: np.ndarray) -> Tuple[float, float]:
        """
        Performs two-sample Kolmogorov-Smirnov test.
        
        Args:
            reference: Reference distribution array
            target: Target distribution array
            
        Returns:
            Tuple of (KS statistic, p-value)
        """
        reference = reference[~np.isnan(reference)]
        target = target[~np.isnan(target)]
        
        if len(reference) == 0 or len(target) == 0:
            return float('nan'), float('nan')
        
        ks_stat, p_value = stats.ks_2samp(reference, target)
        return ks_stat, p_value
    
    def compute_wasserstein_distance(self, reference: np.ndarray, 
                                      target: np.ndarray) -> float:
        """
        Computes 1D Wasserstein (Earth Mover's) distance.
        
        Args:
            reference: Reference distribution array
            target: Target distribution array
            
        Returns:
            Wasserstein distance
        """
        reference = reference[~np.isnan(reference)]
        target = target[~np.isnan(target)]
        
        if len(reference) == 0 or len(target) == 0:
            return float('nan')
        
        return stats.wasserstein_distance(reference, target)
    
    def detect_feature_drift(self, reference: np.ndarray, target: np.ndarray,
                             feature_name: str) -> DriftResult:
        """
        Detects drift for a single feature using multiple methods.
        
        Args:
            reference: Reference feature values
            target: Target feature values
            feature_name: Name of the feature
            
        Returns:
            DriftResult with all metrics
        """
        # Compute all drift metrics
        psi = self.compute_psi(reference, target)
        ks_stat, ks_pval = self.compute_ks_test(reference, target)
        wasserstein = self.compute_wasserstein_distance(reference, target)
        
        # Compute simple statistics
        ref_mean = np.nanmean(reference)
        target_mean = np.nanmean(target)
        ref_std = np.nanstd(reference)
        target_std = np.nanstd(target)
        
        mean_shift = abs(target_mean - ref_mean) / (ref_std + 1e-10)
        std_ratio = target_std / (ref_std + 1e-10)
        
        # Determine if drift is detected
        drift_detected = (
            psi > self.psi_thresholds["low"] or
            ks_pval < self.ks_alpha
        )
        
        # Determine severity
        if psi >= self.psi_thresholds["critical"]:
            severity = "critical"
        elif psi >= self.psi_thresholds["high"]:
            severity = "high"
        elif psi >= self.psi_thresholds["medium"]:
            severity = "medium"
        elif psi >= self.psi_thresholds["low"]:
            severity = "low"
        else:
            severity = "none"
        
        return DriftResult(
            feature_name=feature_name,
            drift_detected=drift_detected,
            psi_score=round(float(psi), 6),
            ks_statistic=round(float(ks_stat), 6),
            ks_pvalue=round(float(ks_pval), 6),
            wasserstein_distance=round(float(wasserstein), 6),
            mean_shift=round(float(mean_shift), 6),
            std_ratio=round(float(std_ratio), 6),
            severity=severity
        )
    
    def detect_dataset_drift(self, reference_df: pd.DataFrame, 
                             target_df: pd.DataFrame,
                             reference_name: str = "reference",
                             target_name: str = "target") -> DriftReport:
        """
        Detects drift across all features in two datasets.
        
        Args:
            reference_df: Reference dataset DataFrame
            target_df: Target dataset DataFrame
            reference_name: Name of reference dataset
            target_name: Name of target dataset
            
        Returns:
            Comprehensive DriftReport
        """
        logger.info(f"Detecting drift between {reference_name} and {target_name}")
        
        # Find common numeric columns
        common_cols = set(reference_df.columns) & set(target_df.columns)
        numeric_cols = [col for col in common_cols 
                       if pd.api.types.is_numeric_dtype(reference_df[col])]
        
        feature_results = []
        drifted_count = 0
        
        for col in numeric_cols:
            ref_values = reference_df[col].values.astype(float)
            target_values = target_df[col].values.astype(float)
            
            result = self.detect_feature_drift(ref_values, target_values, col)
            feature_results.append(result)
            
            if result.drift_detected:
                drifted_count += 1
        
        # Calculate overall metrics
        total_features = len(numeric_cols)
        drift_rate = drifted_count / total_features if total_features > 0 else 0
        
        # Determine overall severity
        severities = [r.severity for r in feature_results]
        if "critical" in severities:
            overall_severity = "critical"
        elif "high" in severities:
            overall_severity = "high"
        elif "medium" in severities:
            overall_severity = "medium"
        elif "low" in severities:
            overall_severity = "low"
        else:
            overall_severity = "none"
        
        # Generate recommendations
        recommendations = self._generate_recommendations(feature_results)
        
        report = DriftReport(
            reference_dataset=reference_name,
            target_dataset=target_name,
            comparison_timestamp=datetime.utcnow().isoformat(),
            total_features=total_features,
            drifted_features=drifted_count,
            drift_rate=round(drift_rate, 4),
            overall_severity=overall_severity,
            feature_results=feature_results,
            recommendations=recommendations
        )
        
        self.drift_history.append(report)
        return report
    
    def _generate_recommendations(self, feature_results: List[DriftResult]) -> List[str]:
        """Generates actionable recommendations based on drift results."""
        recommendations = []
        
        critical_features = [r for r in feature_results if r.severity == "critical"]
        high_features = [r for r in feature_results if r.severity == "high"]
        
        if critical_features:
            recommendations.append(
                f"CRITICAL: {len(critical_features)} features show critical drift. "
                f"Consider retraining model immediately. "
                f"Affected: {[f.feature_name for f in critical_features[:5]]}"
            )
        
        if high_features:
            recommendations.append(
                f"HIGH: {len(high_features)} features show high drift. "
                f"Schedule model retraining. "
                f"Affected: {[f.feature_name for f in high_features[:5]]}"
            )
        
        # Check for specific clinical patterns
        vital_signs = ["heart_rate", "bp_sys", "bp_dia", "temp", "spo2", "respiration"]
        lab_values = ["creatinine", "bun", "lactate", "wbc", "glucose"]
        
        drifted_vitals = [r for r in feature_results 
                        if r.feature_name.lower() in vital_signs and r.drift_detected]
        drifted_labs = [r for r in feature_results 
                       if r.feature_name.lower() in lab_values and r.drift_detected]
        
        if drifted_vitals:
            recommendations.append(
                f"Vital signs drift detected ({len(drifted_vitals)}). "
                f"This may indicate different patient acuity levels."
            )
        
        if drifted_labs:
            recommendations.append(
                f"Lab values drift detected ({len(drifted_labs)}). "
                f"This may indicate different testing protocols or patient populations."
            )
        
        if not recommendations:
            recommendations.append("No significant drift detected. Continue monitoring.")
        
        return recommendations
    
    def save_report(self, report: DriftReport, output_path: str):
        """Saves drift report to JSON file."""
        report_dict = {
            "reference_dataset": report.reference_dataset,
            "target_dataset": report.target_dataset,
            "comparison_timestamp": report.comparison_timestamp,
            "summary": {
                "total_features": report.total_features,
                "drifted_features": report.drifted_features,
                "drift_rate": report.drift_rate,
                "overall_severity": report.overall_severity
            },
            "feature_results": [asdict(r) for r in report.feature_results],
            "recommendations": report.recommendations
        }
        
        with open(output_path, 'w') as f:
            json.dump(report_dict, f, indent=2)
        
        logger.info(f"Drift report saved to {output_path}")


def main():
    """Main entry point for drift detection."""
    parser = argparse.ArgumentParser(description="Healthcare Data Drift Detector")
    parser.add_argument(
        "--reference",
        type=str,
        required=True,
        help="Path to reference dataset directory"
    )
    parser.add_argument(
        "--target",
        type=str,
        required=True,
        help="Path to target dataset directory"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="drift_report.json",
        help="Output path for drift report"
    )
    parser.add_argument(
        "--psi-low",
        type=float,
        default=0.1,
        help="PSI threshold for low severity"
    )
    parser.add_argument(
        "--psi-medium",
        type=float,
        default=0.2,
        help="PSI threshold for medium severity"
    )
    parser.add_argument(
        "--psi-high",
        type=float,
        default=0.3,
        help="PSI threshold for high severity"
    )
    parser.add_argument(
        "--psi-critical",
        type=float,
        default=0.4,
        help="PSI threshold for critical severity"
    )
    parser.add_argument(
        "--ks-alpha",
        type=float,
        default=0.05,
        help="Significance level for KS test"
    )
    
    args = parser.parse_args()
    
    reference_dir = Path(args.reference)
    target_dir = Path(args.target)
    
    # Load datasets
    logger.info(f"Loading reference dataset from {reference_dir}")
    reference_files = list(reference_dir.glob("*.parquet")) + list(reference_dir.glob("*.csv"))
    
    logger.info(f"Loading target dataset from {target_dir}")
    target_files = list(target_dir.glob("*.parquet")) + list(target_dir.glob("*.csv"))
    
    if not reference_files or not target_files:
        logger.error("No data files found in reference or target directories")
        sys.exit(1)
    
    # Load first file from each (assuming single table comparison)
    ref_file = reference_files[0]
    target_file = target_files[0]
    
    if ref_file.suffix == ".parquet":
        reference_df = pd.read_parquet(ref_file)
    else:
        reference_df = pd.read_csv(ref_file)
    
    if target_file.suffix == ".parquet":
        target_df = pd.read_parquet(target_file)
    else:
        target_df = pd.read_csv(target_file)
    
    logger.info(f"Reference dataset: {len(reference_df)} rows, {len(reference_df.columns)} columns")
    logger.info(f"Target dataset: {len(target_df)} rows, {len(target_df.columns)} columns")
    
    # Initialize detector
    detector = HealthcareDriftDetector(
        psi_thresholds={
            "low": args.psi_low,
            "medium": args.psi_medium,
            "high": args.psi_high,
            "critical": args.psi_critical
        },
        ks_alpha=args.ks_alpha
    )
    
    # Detect drift
    report = detector.detect_dataset_drift(
        reference_df,
        target_df,
        reference_name=str(reference_dir),
        target_name=str(target_dir)
    )
    
    # Save report
    detector.save_report(report, args.output)
    
    # Print summary
    print("\n" + "=" * 60)
    print("DRIFT DETECTION REPORT")
    print("=" * 60)
    print(f"Reference: {report.reference_dataset}")
    print(f"Target: {report.target_dataset}")
    print(f"Timestamp: {report.comparison_timestamp}")
    print("-" * 60)
    print(f"Total features analyzed: {report.total_features}")
    print(f"Features with drift: {report.drifted_features}")
    print(f"Drift rate: {report.drift_rate:.2%}")
    print(f"Overall severity: {report.overall_severity.upper()}")
    print("-" * 60)
    print("\nTop drifted features:")
    
    sorted_results = sorted(report.feature_results, key=lambda x: x.psi_score, reverse=True)
    for result in sorted_results[:5]:
        print(f"  - {result.feature_name}: PSI={result.psi_score:.4f}, severity={result.severity}")
    
    print("-" * 60)
    print("\nRecommendations:")
    for rec in report.recommendations:
        print(f"  • {rec}")
    
    print("=" * 60)
    
    # Exit with warning if significant drift detected
    if report.overall_severity in ["high", "critical"]:
        sys.exit(2)
    elif report.overall_severity == "medium":
        sys.exit(1)
    
    sys.exit(0)


if __name__ == "__main__":
    main()
