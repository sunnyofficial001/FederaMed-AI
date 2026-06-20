import os
import time
import logging
import socket
from typing import Dict, List, Tuple
import numpy as np
import flwr as fl
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Simple Model for Demo (Replace with actual clinical model) ---
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.fc = nn.Linear(10, 2) # Dummy input/output for validation

    def forward(self, x):
        return self.fc(x)

def get_weights(model: nn.Module) -> List[np.ndarray]:
    return [val.cpu().numpy() for _, val in model.state_dict().items()]

def set_weights(model: nn.Module, weights: List[np.ndarray]):
    weight_dict = {name: torch.tensor(val) for name, val in zip([k for k, _ in model.state_dict().items()], weights)}
    model.load_state_dict(weight_dict, strict=True)

class FlowerClient(fl.client.NumPyClient):
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = Net().to(self.device)
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.SGD(self.model.parameters(), lr=0.01)

    def get_parameters(self, config):
        return get_weights(self.model)

    def fit(self, parameters, config):
        set_weights(self.model, parameters)
        # Dummy training step for validation
        # In production, load real MIMIC/eICU data here
        logger.info("Training started...")
        time.sleep(1) # Simulate work
        return get_weights(self.model), len([]), {}

    def evaluate(self, parameters, config):
        # Dummy evaluation
        return 0.95, 0, {"accuracy": 0.95}

def wait_for_server(host: str, port: int, timeout: int = 60):
    """Wait for the Flower Server to be reachable via DNS/TCP."""
    start_time = time.time()
    while True:
        try:
            socket.create_connection((host, port), timeout=2)
            logger.info(f"Successfully connected to Flower Server at {host}:{port}")
            return
        except (socket.timeout, ConnectionRefusedError, OSError) as e:
            elapsed = time.time() - start_time
            if elapsed > timeout:
                logger.error(f"Could not connect to Flower Server after {timeout}s. Giving up.")
                raise TimeoutError(f"Connection to {host}:{port} failed")
            
            # Exponential Backoff
            wait_time = min(2 ** (int(elapsed) % 5), 10)
            logger.warning(f"Server not ready ({host}:{port}). Retrying in {wait_time}s... ({elapsed:.1f}s elapsed)")
            time.sleep(wait_time)

def main():
    # Service Discovery
    host = os.getenv("FL_SERVER_HOST", "flower-server-service")
    port = int(os.getenv("FL_SERVER_PORT", "9092"))
    
    logger.info(f"Flower Client starting. Target Server: {host}:{port}")
    
    # Wait for connectivity
    try:
        wait_for_server(host, port, timeout=120)
    except TimeoutError:
        logger.error("Startup failed: Server unreachable.")
        exit(1)

    # Start Client
    try:
        fl.client.start_numpy_client(
            server_address=f"{host}:{port}",
            client=FlowerClient(),
        )
    except Exception as e:
        logger.error(f"Client crashed: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    main()