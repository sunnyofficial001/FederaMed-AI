FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

LABEL maintainer="FederaMed AI Security Team"
LABEL version="1.0.0"

WORKDIR /app

# Install deps
COPY ml_services/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ml_services/ ./ml_services/
COPY data_pipeline/ ./data_pipeline/

# Create artifact dir and fix permissions
RUN mkdir -p /app/mlruns && chown -R 1001:1001 /app

# Non-root user
USER 1001

# Remove shell access for extra security (optional in distroless, harder here)
# ENTRYPOINT ["python"] 
CMD ["uvicorn", "ml_services.governance_api:app", "--host", "0.0.0.0", "--port", "8000"]