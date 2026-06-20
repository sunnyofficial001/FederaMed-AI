import os
import time
import logging
from prometheus_client import Counter, Histogram, Gauge, start_http_server

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Metrics Definitions
TRAINING_ROUNDS = Counter('fl_training_rounds_total', 'Total number of FL rounds completed')
TRAINING_DURATION = Histogram('fl_training_duration_seconds', 'Time spent training a round', buckets=(0.1, 0.5, 1.0, 5.0, 10.0, 30.0))
PRIVACY_BUDGET = Gauge('ml_privacy_budget_remaining', 'Remaining privacy budget (epsilon)')
MODEL_ACCURACY = Gauge('ml_model_accuracy', 'Current global model accuracy')
ACTIVE_CLIENTS = Gauge('fl_active_clients', 'Number of active clients in current round')
ERRORS = Counter('ml_training_errors_total', 'Total number of training errors')

def start_metrics_server(port: int = 8001):
    """Start Prometheus metrics server on a dedicated port."""
    try:
        start_http_server(port)
        logger.info(f"Metrics server started on port {port}")
    except OSError as e:
        logger.error(f"Failed to start metrics server on port {port}: {e}")
        raise

def track_round(func):
    """Decorator to track FL round metrics."""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            TRAINING_ROUNDS.inc()
            return result
        except Exception as e:
            ERRORS.inc()
            logger.error(f"Training round failed: {str(e)}")
            raise e
        finally:
            duration = time.time() - start_time
            TRAINING_DURATION.observe(duration)
    return wrapper

def update_privacy_budget(epsilon_spent: float, max_epsilon: float):
    """Update remaining privacy budget gauge."""
    remaining = max(0, max_epsilon - epsilon_spent)
    PRIVACY_BUDGET.set(remaining)

def update_model_accuracy(accuracy: float):
    """Update model accuracy gauge."""
    MODEL_ACCURACY.set(accuracy)

def update_active_clients(count: int):
    """Update active clients gauge."""
    ACTIVE_CLIENTS.set(count)

if __name__ == "__main__":
    # For local testing only
    port = int(os.getenv("METRICS_PORT", "8001"))
    start_metrics_server(port)
    while True:
        time.sleep(10)