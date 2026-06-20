import pandas as pd
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, DataQualityPreset
import os
import logging

logger = logging.getLogger(__name__)

class DriftMonitor:
    def __init__(self, reference_data_path: str, current_data_path: str):
        self.reference_data_path = reference_data_path
        self.current_data_path = current_data_path
        
    def generate_report(self, output_path: str = "backend/data/processed/drift_report.html"):
        if not os.path.exists(self.reference_data_path) or not os.path.exists(self.current_data_path):
            logger.error("Missing data for drift monitoring")
            return False
            
        logger.info("Loading data for drift detection")
        ref_df = pd.read_csv(self.reference_data_path)
        cur_df = pd.read_csv(self.current_data_path)
        
        # In a real scenario, current_data would be recent production requests
        # We can simulate by taking two different partitions
        
        report = Report(metrics=[
            DataDriftPreset(),
            DataQualityPreset()
        ])
        
        logger.info("Running Evidently drift calculations...")
        report.run(reference_data=ref_df, current_data=cur_df)
        
        report.save_html(output_path)
        logger.info(f"Drift report saved to {output_path}")
        
        # Extract metrics as JSON string
        drift_metrics = report.as_dict()
        return drift_metrics

if __name__ == "__main__":
    monitor = DriftMonitor(
        "backend/data/processed/partitions/Hospital_A.csv",
        "backend/data/processed/partitions/Hospital_B.csv"
    )
    monitor.generate_report()
