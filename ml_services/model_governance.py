import os
import logging
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Depends, Header, Query
from pydantic import BaseModel, Field
from enum import Enum

# Fixed Import: Explicit package import
from ml_services.model_governance import ModelGovernance, ModelStage, ModelGovernanceError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FederaMed AI Model Governance API",
    description="API for managing model lifecycle, registry, and compliance.",
    version="1.0.0"
)

# Fail Fast: Raise error if critical env vars are missing
tracking_uri = os.getenv("MLFLOW_TRACKING_URI")
if not tracking_uri:
    raise EnvironmentError("CRITICAL: MLFLOW_TRACKING_URI environment variable is not set.")

governance = ModelGovernance(tracking_uri=tracking_uri)

# --- Pydantic Models ---
class StageEnum(str, Enum):
    DEVELOPMENT = "Development"
    STAGING = "Staging"
    PRODUCTION = "Production"
    ARCHIVED = "Archived"

class RegisterModelRequest(BaseModel):
    model_uri: str
    name: str
    run_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}
    tags: Optional[Dict[str, str]] = {}

class TransitionStageRequest(BaseModel):
    target_stage: StageEnum
    reason: Optional[str] = None
    
class UpdateDescriptionRequest(BaseModel):
    description: str

class DeleteModelRequest(BaseModel):
    reason: str

# --- Dependencies ---
def get_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    return x_user_id or "anonymous"

# --- Endpoints ---
@app.post("/models/register", response_model=Dict[str, Any], tags=["Models"])
async def register_model(request: RegisterModelRequest, user_id: str = Depends(get_user_id)):
    try:
        logger.info(f"User {user_id} registering model '{request.name}'")
        version = governance.register_model(
            model_uri=request.model_uri,
            name=request.name,
            run_id=request.run_id,
            metadata=request.metadata,
            tags=request.tags
        )
        return {"status": "success", "model_name": request.name, "version": version}
    except ModelGovernanceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/models/{name}/{version}/transition", response_model=Dict[str, Any], tags=["Models"])
async def transition_stage(name: str, version: str, request: TransitionStageRequest, user_id: str = Depends(get_user_id)):
    try:
        if request.target_stage == StageEnum.PRODUCTION:
            max_epsilon = float(os.getenv("MAX_PRIVACY_EPSILON", "10.0"))
            governance.enforce_privacy_budget(name, version, max_epsilon=max_epsilon)

        governance.transition_stage(
            name=name, version=version,
            target_stage=ModelStage(request.target_stage.value),
            reason=request.reason, user_id=user_id
        )
        return {"status": "success", "new_stage": request.target_stage.value}
    except ModelGovernanceError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health", tags=["Health"])
async def health_check():
    # Deep health check could go here (ping DB/MLflow)
    return {"status": "healthy", "service": "model-governance-api"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)