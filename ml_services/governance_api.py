import os
import logging
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Depends, Header, Query, Body
from pydantic import BaseModel, Field
from enum import Enum

from model_governance import ModelGovernance, ModelStage, ModelGovernanceError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FederaMed AI Model Governance API",
    description="API for managing model lifecycle, registry, and compliance.",
    version="1.0.0"
)

# Initialize governance instance
governance = ModelGovernance()

# --- Pydantic Models ---

class StageEnum(str, Enum):
    DEVELOPMENT = "Development"
    STAGING = "Staging"
    PRODUCTION = "Production"
    ARCHIVED = "Archived"

class RegisterModelRequest(BaseModel):
    model_uri: str = Field(..., description="URI of the model artifact")
    name: str = Field(..., description="Name of the model in the registry")
    run_id: Optional[str] = Field(None, description="Associated MLflow run ID")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Model metadata")
    tags: Optional[Dict[str, str]] = Field(default_factory=dict, description="Model tags")

class TransitionStageRequest(BaseModel):
    target_stage: StageEnum = Field(..., description="Target lifecycle stage")
    reason: Optional[str] = Field(None, description="Reason for transition")
    
class UpdateDescriptionRequest(BaseModel):
    description: str = Field(..., description="New model description")

class DeleteModelRequest(BaseModel):
    reason: str = Field(..., description="Reason for deletion")

# --- Dependencies ---

def get_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    """Extract user ID from headers. Defaults to 'anonymous' if not provided."""
    return x_user_id or "anonymous"

# --- Endpoints ---

@app.post("/models/register", response_model=Dict[str, Any], tags=["Models"])
async def register_model(
    request: RegisterModelRequest,
    user_id: str = Depends(get_user_id)
):
    """
    Register a new model version in the MLflow Model Registry.
    """
    try:
        logger.info(f"User {user_id} registering model '{request.name}'")
        version = governance.register_model(
            model_uri=request.model_uri,
            name=request.name,
            run_id=request.run_id,
            metadata=request.metadata,
            tags=request.tags
        )
        return {
            "status": "success",
            "message": f"Model '{request.name}' version {version} registered successfully",
            "model_name": request.name,
            "version": version,
            "user_id": user_id
        }
    except ModelGovernanceError as e:
        logger.error(f"Registration failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/models/{name}/{version}/transition", response_model=Dict[str, Any], tags=["Models"])
async def transition_stage(
    name: str,
    version: str,
    request: TransitionStageRequest,
    user_id: str = Depends(get_user_id)
):
    """
    Transition a model version to a new stage (e.g., Staging -> Production).
    Enforces privacy budget checks before promoting to Production.
    """
    try:
        logger.info(f"User {user_id} transitioning model '{name}' v{version} to {request.target_stage.value}")
        
        # Enforce privacy budget if promoting to Production
        if request.target_stage == StageEnum.PRODUCTION:
            max_epsilon = float(os.getenv("MAX_PRIVACY_EPSILON", "10.0"))
            try:
                governance.enforce_privacy_budget(name, version, max_epsilon=max_epsilon)
            except ModelGovernanceError as e:
                raise HTTPException(status_code=403, detail=f"Privacy budget check failed: {str(e)}")

        governance.transition_stage(
            name=name,
            version=version,
            target_stage=ModelStage(request.target_stage.value),
            reason=request.reason,
            user_id=user_id
        )
        return {
            "status": "success",
            "message": f"Model '{name}' v{version} transitioned to {request.target_stage.value}",
            "model_name": name,
            "version": version,
            "new_stage": request.target_stage.value,
            "user_id": user_id
        }
    except ModelGovernanceError as e:
        logger.error(f"Transition failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during transition: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/models", response_model=List[Dict[str, Any]], tags=["Models"])
async def list_models(
    stage: Optional[StageEnum] = Query(None, description="Filter by stage")
):
    """
    List all registered models, optionally filtered by stage.
    """
    try:
        stage_filter = ModelStage(stage.value) if stage else None
        models = governance.list_models(stage_filter=stage_filter)
        return {"status": "success", "count": len(models), "models": models}
    except ModelGovernanceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error listing models: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/models/{name}/{version}", response_model=Dict[str, Any], tags=["Models"])
async def get_model_info(name: str, version: str):
    """
    Get detailed information about a specific model version.
    """
    try:
        info = governance.get_model_info(name, version)
        return {"status": "success", "model": info}
    except ModelGovernanceError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error getting model info: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/models/{name}/{version}/lineage", response_model=Dict[str, Any], tags=["Lineage"])
async def get_model_lineage(name: str, version: str):
    """
    Retrieve lineage information for a model version (run info, data sources, parameters).
    """
    try:
        lineage = governance.get_lineage(name, version)
        return {"status": "success", "lineage": lineage}
    except ModelGovernanceError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error getting lineage: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/models/{name}/{version}/description", response_model=Dict[str, Any], tags=["Models"])
async def update_description(
    name: str,
    version: str,
    request: UpdateDescriptionRequest,
    user_id: str = Depends(get_user_id)
):
    """Update the description of a model version."""
    try:
        governance.update_model_description(name, version, request.description, user_id)
        return {
            "status": "success",
            "message": f"Description updated for '{name}' v{version}",
            "user_id": user_id
        }
    except ModelGovernanceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error updating description: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/models/{name}/{version}", response_model=Dict[str, Any], tags=["Models"])
async def delete_model_version(
    name: str,
    version: str,
    request: DeleteModelRequest,
    user_id: str = Depends(get_user_id)
):
    """
    Delete a specific model version (cannot delete Production models).
    """
    try:
        governance.delete_model_version(name, version, request.reason, user_id)
        return {
            "status": "success",
            "message": f"Model '{name}' v{version} deleted",
            "user_id": user_id
        }
    except ModelGovernanceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error deleting model: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "model-governance-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)