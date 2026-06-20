import os
import logging
import time
from typing import List, Optional
import flwr as fl
from flwr.server.strategy import FedAvg

# Configure Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def get_strategy():
    """Initialize the Federated Averaging strategy."""
    return FedAvg(
        fraction_fit=float(os.getenv("FL_FRACTION_FIT", "1.0")),
        fraction_eval=float(os.getenv("FL_FRACTION_EVAL", "1.0")),
        min_fit_clients=int(os.getenv("FL_MIN_CLIENTS", "2")),
        min_eval_clients=int(os.getenv("FL_MIN_CLIENTS", "2")),
        min_available_clients=int(os.getenv("FL_MIN_CLIENTS", "2")),
        accept_failures=True,
    )

def start_server():
    """Start the Flower Server with environment-driven configuration."""
    
    # Configuration from Environment
    server_address = os.getenv("FL_SERVER_ADDRESS", "0.0.0.0:9092")
    num_rounds = int(os.getenv("FL_NUM_ROUNDS", "3"))
    
    logger.info(f"Starting Flower Server on {server_address}")
    logger.info(f"Configuration: {num_rounds} rounds, Strategy: FedAvg")
    
    try:
        # Start the server
        fl.server.start_server(
            server_address=server_address,
            config=fl.server.ServerConfig(num_rounds=num_rounds),
            strategy=get_strategy(),
        )
        logger.info("Flower Server stopped gracefully.")
    except Exception as e:
        logger.error(f"Flower Server crashed: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    # Health check probe simulation (optional for K8s startupProbe)
    time.sleep(2) 
    start_server()