import flwr as fl
import logging
from typing import Dict, List, Optional, Tuple
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fit_config(server_round: int):
    """Return training configuration dict for each round."""
    config = {
        "epochs": 1,
        "fedprox_mu": 0.1, # Using FedProx to handle non-IID data
    }
    return config

def get_evaluate_fn():
    """Return an evaluation function for server-side evaluation."""
    # In a real setup, server might have a holdout set, but here we'll rely on federated evaluation
    pass

class FedMedStrategy(fl.server.strategy.FedAvg):
    def aggregate_fit(
        self,
        server_round: int,
        results: List[Tuple[fl.server.client_proxy.ClientProxy, fl.common.FitRes]],
        failures: List[BaseException],
    ) -> Tuple[Optional[fl.common.Parameters], Dict[str, fl.common.Scalar]]:
        
        logger.info(f"Aggregating models for round {server_round}")
        
        # Call standard FedAvg aggregation
        aggregated_parameters, aggregated_metrics = super().aggregate_fit(server_round, results, failures)
        
        if aggregated_parameters is not None:
            logger.info(f"Round {server_round} aggregation successful")
            # We could save the parameters here, but typically we let the framework handle it
            
        return aggregated_parameters, aggregated_metrics

    def aggregate_evaluate(
        self,
        server_round: int,
        results: List[Tuple[fl.server.client_proxy.ClientProxy, fl.common.EvaluateRes]],
        failures: List[BaseException],
    ) -> Tuple[Optional[float], Dict[str, fl.common.Scalar]]:
        
        if not results:
            return None, {}
            
        # Weigh accuracy of each client by number of test examples
        accuracies = [r.metrics["accuracy"] * r.num_examples for _, r in results]
        examples = [r.num_examples for _, r in results]
        
        accuracy_aggregated = sum(accuracies) / sum(examples)
        
        logger.info(f"Round {server_round} Global Accuracy: {accuracy_aggregated:.4f}")
        
        return super().aggregate_evaluate(server_round, results, failures)

if __name__ == "__main__":
    logger.info("Starting FedMed Flower Server")
    
    strategy = FedMedStrategy(
        fraction_fit=1.0,  # Sample 100% of available clients for training
        fraction_evaluate=1.0,  # Sample 100% of available clients for evaluation
        min_fit_clients=5,  # Never sample less than 5 clients for training
        min_evaluate_clients=5,  # Never sample less than 5 clients for evaluation
        min_available_clients=5,  # Wait until all 5 clients are available
        on_fit_config_fn=fit_config,
    )

    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=fl.server.ServerConfig(num_rounds=5),
        strategy=strategy,
    )
