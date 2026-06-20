import os
import json
import logging
from backend.data.data_loader import DataLoader
from backend.data.validation import DataValidator
from backend.data.preprocessing import Preprocessor
from backend.data.feature_engineering import FeatureEngineer
from backend.data.partitioning import DataPartitioner

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FeatureStore:
    def __init__(self, raw_data_path: str, output_dir: str):
        self.raw_data_path = raw_data_path
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def run_pipeline(self):
        logger.info("--- Starting Data Pipeline ---")
        
        # 1. Load
        loader = DataLoader(self.raw_data_path)
        df = loader.load_data()
        
        # 2. Validate
        validator = DataValidator(df)
        validator.validate_schema()
        quality_report = validator.validate_data_quality()
        self._save_report("data_quality_report.json", quality_report)
        
        # 3. Preprocess
        preprocessor = Preprocessor(df)
        df_clean = preprocessor.process()
        
        # 4. Feature Engineering
        engineer = FeatureEngineer(df_clean)
        df_features = engineer.process()
        
        feature_report = {
            "final_columns": df_features.columns.tolist(),
            "shape": df_features.shape,
            "target_distribution": {int(k): int(v) for k, v in df_features['readmitted_binary'].value_counts().to_dict().items()}
        }
        self._save_report("feature_engineering_report.json", feature_report)
        
        # 5. Partitioning
        partitioner = DataPartitioner(df_features)
        partition_dir = os.path.join(self.output_dir, "partitions")
        partitioner.partition_non_iid(partition_dir)
        
        # 6. Save final global dataset
        final_path = os.path.join(self.output_dir, "global_dataset.csv")
        df_features.to_csv(final_path, index=False)
        logger.info(f"--- Pipeline Complete. Global dataset saved to {final_path} ---")

    def _save_report(self, filename: str, data: dict):
        path = os.path.join(self.output_dir, filename)
        with open(path, 'w') as f:
            json.dump(data, f, indent=4)
        logger.info(f"Report saved to {path}")

if __name__ == "__main__":
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    
    raw_path = os.path.join(os.path.dirname(__file__), "diabetic_data.csv")
    out_dir = os.path.join(os.path.dirname(__file__), "processed")
    store = FeatureStore(raw_path, out_dir)
    store.run_pipeline()
