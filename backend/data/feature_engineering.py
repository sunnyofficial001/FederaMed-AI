import pandas as pd
import logging
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger(__name__)

class FeatureEngineer:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        
    def encode_labels(self):
        # Target variable: readmitted
        # Typical approach: Predict readmission within 30 days (<30 = 1, >30 or NO = 0)
        logger.info("Encoding 'readmitted' label for binary classification (<30 days vs others)")
        self.df['readmitted_binary'] = self.df['readmitted'].apply(lambda x: 1 if x == '<30' else 0)
        self.df.drop(columns=['readmitted'], inplace=True)
        
    def transform_features(self):
        # Age is grouped like [0-10), [10-20), ..., [90-100)
        # We can map it to midpoints
        age_map = {
            '[0-10)': 5, '[10-20)': 15, '[20-30)': 25, '[30-40)': 35, '[40-50)': 45,
            '[50-60)': 55, '[60-70)': 65, '[70-80)': 75, '[80-90)': 85, '[90-100)': 95
        }
        if 'age' in self.df.columns:
            logger.info("Transforming 'age' to numeric midpoints")
            self.df['age'] = self.df['age'].map(age_map)
            
        # Drop IDs that shouldn't be used for modeling
        cols_to_drop = ['encounter_id', 'patient_nbr']
        self.df.drop(columns=[col for col in cols_to_drop if col in self.df.columns], inplace=True)

        # One hot encode categorical features
        cat_cols = self.df.select_dtypes(include=['object']).columns.tolist()
        logger.info(f"One-hot encoding categorical features: {len(cat_cols)} columns")
        
        # We use pd.get_dummies for simplicity in feature engineering
        self.df = pd.get_dummies(self.df, columns=cat_cols, drop_first=True)
        
    def process(self) -> pd.DataFrame:
        self.encode_labels()
        self.transform_features()
        logger.info(f"Feature engineering complete. Final shape: {self.df.shape}")
        return self.df
