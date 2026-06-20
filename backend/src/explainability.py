import shap
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os
import logging

logger = logging.getLogger(__name__)

class ExplainerService:
    def __init__(self, model_path: str, data_path: str):
        self.model_path = model_path
        self.data_path = data_path
        self.model = None
        self.explainer = None
        self.background_data = None
        
        self._load_resources()

    def _load_resources(self):
        if os.path.exists(self.model_path) and os.path.exists(self.data_path):
            logger.info("Loading model and data for SHAP explanations")
            self.model = joblib.load(self.model_path)
            
            # Load a sample of data as background for SHAP
            df = pd.read_csv(self.data_path)
            X = df.drop(columns=['readmitted_binary']).fillna(0)
            self.background_data = shap.sample(X, 100)
            
            # TreeExplainer is best for XGBoost/LightGBM/RF
            # If it's Logistic Regression we use LinearExplainer
            model_type = str(type(self.model)).lower()
            if 'tree' in model_type or 'xgboost' in model_type or 'lightgbm' in model_type or 'ensemble' in model_type:
                self.explainer = shap.TreeExplainer(self.model)
            else:
                self.explainer = shap.LinearExplainer(self.model, self.background_data)
        else:
            logger.warning("Model or data path not found. Explainer not initialized.")

    def get_global_importance(self):
        if not self.explainer:
            return {"error": "Explainer not initialized"}
            
        shap_values = self.explainer.shap_values(self.background_data)
        
        # Depending on model, shap_values might be a list or array
        if isinstance(shap_values, list):
            shap_values = shap_values[1] # For binary classification
            
        feature_importance = pd.DataFrame({
            'feature': self.background_data.columns,
            'importance': np.abs(shap_values).mean(0)
        }).sort_values(by='importance', ascending=False)
        
        return feature_importance.head(20).to_dict(orient='records')
        
    def generate_summary_plot(self, output_path="backend/data/processed/shap_summary.png"):
        if not self.explainer:
            return False
            
        shap_values = self.explainer.shap_values(self.background_data)
        if isinstance(shap_values, list):
            shap_values = shap_values[1]
            
        plt.figure()
        shap.summary_plot(shap_values, self.background_data, show=False)
        plt.savefig(output_path, bbox_inches='tight')
        plt.close()
        return True

if __name__ == "__main__":
    # Example usage
    # Note: Requires the model to be trained first
    svc = ExplainerService("backend/models/saved/best_model_LightGBM.pkl", "backend/data/processed/global_dataset.csv")
    svc.generate_summary_plot()
