# @license
# SPDX-License-Identifier: Apache-2.0

import flwr as fl
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
from models import get_model
from dp_engine import DifferentiallyPrivateTrainer
from sec_agg import SecureAggregatorEngine

class ClinicalFlowerClient(fl.client.NumPyClient):
    """
    Highly secure Flower learning client deployed inside hospital nodes.
    Maintains clinical dataset isolation, trains custom backbones,
    injects differential privacy, and masks gradients utilizing Secure Aggregation.
    """
    def __init__(
        self,
        client_id: str,
        backbone_type: str = "DenseNet121",
        dp_enabled: bool = True,
        sec_agg_enabled: bool = True
    ):
        self.client_id = client_id
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = get_model(backbone_type).to(self.device)
        self.dp_enabled = dp_enabled
        self.sec_agg_enabled = sec_agg_enabled
        
        # Load local synthesized clinical data vectors matching our preprocessing schemas
        self.num_samples = 500
        features = np.random.normal(loc=0.0, scale=0.5, size=(self.num_samples, 3, 224, 224)).astype(np.float32)
        labels = (np.random.rand(self.num_samples) >= 0.5).astype(np.int64)
        
        dataset = TensorDataset(torch.tensor(features), torch.tensor(labels))
        self.dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

    def get_parameters(self, config):
        # Extract neural network parameters as list of numpy ndarrays
        return [val.cpu().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        # Fit network state boundaries
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.model.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        
        optimizer = torch.optim.AdamW(self.model.parameters(), lr=1e-4)
        loss_fn = nn.BCELoss()
        
        print(f"[Client {self.client_id}] Launching local optimization loop on GPU/CPU...")
        
        epsilon_spent = 0.0
        delta_bound = 0.0
        
        if self.dp_enabled:
            # Wrap standard optimizer and dataloader with Opacus differential privacy
            dp_trainer = DifferentiallyPrivateTrainer(
                self.model, optimizer, self.dataloader, target_epsilon=2.5, epochs=1
            )
            report = dp_trainer.train_epoch(loss_fn)
            epoch_loss = report["loss"]
            epoch_acc = report["accuracy"]
            epsilon_spent = report["epsilon_spent"]
            delta_bound = report["delta_bound"]
        else:
            # Standard PyTorch Training
            self.model.train()
            epoch_loss = 0.0
            correct = 0
            for data, target in self.dataloader:
                data, target = data.to(self.device), target.to(self.device).float().unsqueeze(1)
                optimizer.zero_grad()
                outputs = self.model(data)
                loss = loss_fn(outputs, target)
                loss.backward()
                optimizer.step()
                
                epoch_loss += loss.item() * data.size(0)
                preds = (outputs >= 0.5).long()
                correct += preds.eq(target).sum().item()
                
            epoch_loss /= len(self.dataloader.dataset)
            epoch_acc = correct / len(self.dataloader.dataset)

        updated_params = self.get_parameters(config={})
        
        if self.sec_agg_enabled:
            # Apply dynamic cryptographically secure additive cancelation masks
            print(f"[Client {self.client_id}] Masking weight updates utilizing pairwise Secure Aggregation secrets...")
            node_ids = ["hospital_a", "hospital_b", "hospital_c"]
            all_masks = SecureAggregatorEngine.generate_pairwise_secrets(node_ids, sum(p.size for p in updated_params))
            
            client_mask = all_masks.get(self.client_id)
            if client_mask is not None:
                # Flatten parameters, add mask, unflatten
                flat_params = np.concatenate([p.ravel() for p in updated_params])
                masked_flat = flat_params + client_mask[:len(flat_params)]
                
                offset = 0
                masked_params = []
                for p in updated_params:
                    sz = p.size
                    masked_params.append(masked_flat[offset:offset+sz].reshape(p.shape))
                    offset += sz
                updated_params = masked_params

        metrics = {
            "loss": float(epoch_loss),
            "accuracy": float(epoch_acc),
            "epsilon_spent": float(epsilon_spent),
            "delta_bound": float(delta_bound),
            "local_steps": float(len(self.dataloader))
        }
        
        return updated_params, len(self.dataloader.dataset), metrics

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        self.model.eval()
        loss_fn = nn.BCELoss()
        
        eval_loss = 0.0
        correct = 0
        with torch.no_grad():
            for data, target in self.dataloader:
                data, target = data.to(self.device), target.to(self.device).float().unsqueeze(1)
                outputs = self.model(data)
                loss = loss_fn(outputs, target)
                eval_loss += loss.item() * data.size(0)
                preds = (outputs >= 0.5).long()
                correct += preds.eq(target).sum().item()

        eval_loss /= len(self.dataloader.dataset)
        eval_acc = correct / len(self.dataloader.dataset)
        
        return float(eval_loss), len(self.dataloader.dataset), {"accuracy": float(eval_acc)}


def join_federated_consensus(server_address: str = "localhost:8080", client_id: str = "hospital_a"):
    client = ClinicalFlowerClient(
        client_id=client_id,
        backbone_type="DenseNet121",
        dp_enabled=True,
        sec_agg_enabled=True
    )
    print(f"[Flower Connection] Node {client_id} contacting global coordinator on: {server_address}...")
    fl.client.start_client(server_address=server_address, client=client.to_client())

if __name__ == "__main__":
    import sys
    node_id = sys.argv[1] if len(sys.argv) > 1 else "hospital_a"
    join_federated_consensus(server_address="localhost:8080", client_id=node_id)
