import sys

print(f"Python version: {sys.version}")

try:
    import fastapi
    from fastapi import FastAPI
    app = FastAPI()
    import uvicorn
    import pydantic
    import sqlalchemy
    import psycopg2
    import alembic
    print("Backend dependencies verified: fastapi, uvicorn, pydantic, sqlalchemy, psycopg2, alembic")
    
    import sklearn
    import pandas
    import numpy
    import scipy
    import xgboost
    import lightgbm
    import imblearn
    import optuna
    import joblib
    print("Machine Learning dependencies verified: scikit-learn, pandas, numpy, scipy, xgboost, lightgbm, imbalanced-learn, optuna, joblib")
    
    import flwr
    print("Federated Learning dependencies verified: flwr")
    
    import shap
    print("Explainable AI dependencies verified: shap")
    
    import mlflow
    print("MLOps dependencies verified: mlflow")
    
    import evidently
    print("Monitoring dependencies verified: evidently")
    
    import matplotlib
    import plotly
    import seaborn
    print("Visualization dependencies verified: matplotlib, plotly, seaborn")
    
    import pytest
    import dotenv
    import tqdm
    import rich
    import httpx
    print("Testing and Utilities verified: pytest, python-dotenv, tqdm, rich, httpx")
    
    print("\nALL IMPORTS SUCCESSFUL")
    
except Exception as e:
    print(f"IMPORT FAILED: {e}")
    sys.exit(1)
