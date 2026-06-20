import pandas as pd
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataLoader:
    def __init__(self, filepath: str):
        self.filepath = filepath

    def load_data(self) -> pd.DataFrame:
        if not os.path.exists(self.filepath):
            logger.error(f"Dataset not found at {self.filepath}")
            raise FileNotFoundError(f"Dataset not found at {self.filepath}")
        
        logger.info(f"Loading dataset from {self.filepath}")
        df = pd.read_csv(self.filepath)
        logger.info(f"Dataset loaded with shape: {df.shape}")
        return df

if __name__ == "__main__":
    loader = DataLoader("diabetic_data.csv")
    df = loader.load_data()
