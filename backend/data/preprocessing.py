import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

class Preprocessor:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        
    def replace_missing_values(self):
        logger.info("Replacing '?' with np.nan")
        self.df.replace('?', np.nan, inplace=True)
        
    def handle_missing_data(self):
        # Drop columns with high missing rate
        cols_to_drop = ['weight', 'payer_code', 'medical_specialty']
        logger.info(f"Dropping columns with high missing rates: {cols_to_drop}")
        self.df.drop(columns=[col for col in cols_to_drop if col in self.df.columns], inplace=True, errors='ignore')
        
        # Impute remaining missing values
        logger.info("Imputing missing values for 'race', 'diag_1', 'diag_2', 'diag_3'")
        for col in ['race', 'diag_1', 'diag_2', 'diag_3']:
            if col in self.df.columns:
                self.df[col].fillna(self.df[col].mode()[0], inplace=True)
                
    def clean_data(self):
        # Drop duplicates or invalid data
        logger.info("Dropping invalid gender data")
        self.df = self.df[self.df['gender'] != 'Unknown/Invalid']
        
    def process(self) -> pd.DataFrame:
        self.replace_missing_values()
        self.handle_missing_data()
        self.clean_data()
        logger.info("Preprocessing complete.")
        return self.df
