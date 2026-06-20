import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/fedmed")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True, nullable=True)
    model_version = Column(String)
    prediction = Column(String)
    probability = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class FLMetrics(Base):
    __tablename__ = "fl_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    round_number = Column(Integer)
    global_accuracy = Column(Float)
    global_loss = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class HospitalClientLog(Base):
    __tablename__ = "hospital_clients"
    
    id = Column(Integer, primary_key=True, index=True)
    hospital_name = Column(String, unique=True, index=True)
    status = Column(String)
    last_active = Column(DateTime, default=datetime.utcnow)
    data_samples = Column(Integer)

def init_db():
    Base.metadata.create_all(bind=engine)
