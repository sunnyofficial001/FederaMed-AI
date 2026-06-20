import pandas as pd
import numpy as np
import logging
import os

logger = logging.getLogger(__name__)

class DataPartitioner:
    def __init__(self, df: pd.DataFrame, num_clients: int = 5):
        self.df = df
        self.num_clients = num_clients
        self.client_names = ["Hospital_A", "Hospital_B", "Hospital_C", "Hospital_D", "Hospital_E"]
        
    def partition_non_iid(self, output_dir: str):
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        logger.info(f"Partitioning data into {self.num_clients} non-IID clients")
        
        # Sort by the target or a major feature to create non-IID distribution
        # Sorting by 'time_in_hospital' (if exists) or 'readmitted_binary'
        if 'time_in_hospital' in self.df.columns:
            sorted_df = self.df.sort_values(by='time_in_hospital').reset_index(drop=True)
        else:
            sorted_df = self.df.sort_values(by='readmitted_binary').reset_index(drop=True)
            
        # Split into unequal chunks or equal chunks
        chunks = np.array_split(sorted_df, self.num_clients)
        
        for i, chunk in enumerate(chunks):
            client_name = self.client_names[i]
            filepath = os.path.join(output_dir, f"{client_name}.csv")
            chunk.to_csv(filepath, index=False)
            logger.info(f"Saved {len(chunk)} records to {filepath}")
            
        logger.info("Data partitioning complete.")
