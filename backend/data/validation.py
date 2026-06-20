import pandas as pd
import logging

logger = logging.getLogger(__name__)

class DataValidator:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        
    def validate_schema(self) -> bool:
        expected_columns = [
            'encounter_id', 'patient_nbr', 'race', 'gender', 'age', 'weight',
            'admission_type_id', 'discharge_disposition_id', 'admission_source_id',
            'time_in_hospital', 'payer_code', 'medical_specialty',
            'num_lab_procedures', 'num_procedures', 'num_medications',
            'number_outpatient', 'number_emergency', 'number_inpatient',
            'diag_1', 'diag_2', 'diag_3', 'number_diagnoses', 'max_glu_serum',
            'A1Cresult', 'metformin', 'repaglinide', 'nateglinide', 'chlorpropamide',
            'glimepiride', 'acetohexamide', 'glipizide', 'glyburide', 'tolbutamide',
            'pioglitazone', 'rosiglitazone', 'acarbose', 'miglitol', 'troglitazone',
            'tolazamide', 'examide', 'citoglipton', 'insulin', 'glyburide-metformin',
            'glipizide-metformin', 'glimepiride-pioglitazone', 'metformin-rosiglitazone',
            'metformin-pioglitazone', 'change', 'diabetesMed', 'readmitted'
        ]
        
        missing_cols = [col for col in expected_columns if col not in self.df.columns]
        if missing_cols:
            logger.error(f"Missing expected columns: {missing_cols}")
            return False
            
        logger.info("Schema validation passed.")
        return True

    def validate_data_quality(self) -> dict:
        quality_report = {
            "total_records": int(len(self.df)),
            "duplicates": int(self.df.duplicated().sum()),
            "missing_values_by_col": {k: int(v) for k, v in (self.df == '?').sum().to_dict().items()}
        }
        logger.info(f"Data quality report generated: {quality_report['total_records']} records, {quality_report['duplicates']} duplicates.")
        return quality_report
