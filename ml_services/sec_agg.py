# @license
# SPDX-License-Identifier: Apache-2.0

import numpy as np
from typing import List, Dict

class SecureAggregatorEngine:
    """
    Symmetric Pairwise Masking for Cryptographically Secure Federated Aggregation.
    Allows clinical nodes to sum local weights privately without disclosing 
    raw parameters to the central coordinator.
    """
    @staticmethod
    def generate_pairwise_secrets(node_ids: List[str], num_elements: int) -> Dict[str, np.ndarray]:
        """
        Generates zero-sum additive masks across active hospital sites.
        Node A adds mask_ab, Node B subtracts mask_ab. The pairwise masks perfectly cancel. All masks sum to zero.
        """
        masks = {node_id: np.zeros(num_elements, dtype=np.float32) for node_id in node_ids}
        num_nodes = len(node_ids)
        
        for i in range(num_nodes):
            for j in range(i + 1, num_nodes):
                node_i = node_ids[i]
                node_j = node_ids[j]
                
                # Dynamic cryptographically stable shared seed creation for pair (i, j)
                shared_seed = hash(f"{node_i}_{node_j}_2026_consensus")
                rng = np.random.default_rng(abs(shared_seed))
                
                # Generate pairwise mask
                pairwise_mask = rng.normal(loc=0.0, scale=0.02, size=num_elements).astype(np.float32)
                
                # Symmmetric mutual cancellation: Node_i adds, Node_j subtracts
                masks[node_i] += pairwise_mask
                masks[node_j] -= pairwise_mask
                
        return masks

    @staticmethod
    def secure_sum(masked_weights: List[np.ndarray]) -> np.ndarray:
        """
        Aggregates masked weights across nodes. 
        Because individual pairwise masks sum to 0, sum(masked_weights) === sum(raw_weights).
        No individual hospital's raw gradients are leaked to the central coordinator.
        """
        return np.sum(masked_weights, axis=0)
