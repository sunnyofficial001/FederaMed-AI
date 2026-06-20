import pandas as pd
import numpy as np
import logging
import os
import mlflow
import mlflow.sklearn
import mlflow.xgboost
import mlflow.lightgbm
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, average_precision_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
import joblib
import warnings
warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self, data_path: str):
        self.data_path = data_path
        self.models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, n_jobs=-1),
            "Random Forest": RandomForestClassifier(n_estimators=100, n_jobs=-1, random_state=42),
            "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='logloss', n_jobs=-1, random_state=42),
            "LightGBM": LGBMClassifier(n_jobs=-1, random_state=42)
        }
        
    def load_data(self):
        logger.info(f"Loading preprocessed data from {self.data_path}")
        df = pd.read_csv(self.data_path)
        
        # Prepare X and y
        y = df['readmitted_binary']
        X = df.drop(columns=['readmitted_binary'])
        
        # Handle remaining NaNs if any by simple filling for trees/LR
        X.fillna(X.mean(), inplace=True)
        
        return train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
    def evaluate(self, y_true, y_pred, y_prob):
        acc = accuracy_score(y_true, y_pred)
        prec = precision_score(y_true, y_pred, zero_division=0)
        rec = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_true, y_prob)
        pr_auc = average_precision_score(y_true, y_prob)
        
        return {
            "Accuracy": acc,
            "Precision": prec,
            "Recall": rec,
            "F1 Score": f1,
            "ROC AUC": roc_auc,
            "PR AUC": pr_auc
        }

    def train_and_compare(self):
        X_train, X_test, y_train, y_test = self.load_data()
        
        mlflow.set_tracking_uri("sqlite:///mlruns.db")
        mlflow.set_experiment("Healthcare_Prediction_Engine")
        
        best_model_name = None
        best_f1 = -1
        best_model = None
        
        results = {}
        
        for name, model in self.models.items():
            logger.info(f"Training {name}...")
            with mlflow.start_run(run_name=name):
                model.fit(X_train, y_train)
                
                y_pred = model.predict(X_test)
                y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred
                
                metrics = self.evaluate(y_test, y_pred, y_prob)
                results[name] = metrics
                
                # Log to MLflow
                mlflow.log_params(model.get_params())
                mlflow.log_metrics({k.replace(" ", "_"): v for k, v in metrics.items()})
                
                if name == "XGBoost":
                    mlflow.xgboost.log_model(model, "model")
                elif name == "LightGBM":
                    mlflow.lightgbm.log_model(model, "model")
                else:
                    mlflow.sklearn.log_model(model, "model")
                
                if metrics["F1 Score"] > best_f1:
                    best_f1 = metrics["F1 Score"]
                    best_model_name = name
                    best_model = model
                    
                logger.info(f"{name} Metrics: {metrics}")
                
        logger.info(f"Best Model: {best_model_name} with F1: {best_f1}")
        
        # Save best model to feature store/model registry area
        os.makedirs("backend/models/saved", exist_ok=True)
        joblib.dump(best_model, f"backend/models/saved/best_model_{best_model_name.replace(' ', '_')}.pkl")
        
        return results

if __name__ == "__main__":
    trainer = ModelTrainer("backend/data/processed/global_dataset.csv")
    trainer.train_and_compare()
