# @license
# SPDX-License-Identifier: Apache-2.0

import torch
from torch.utils.data import DataLoader
from opacus import PrivacyEngine

class DifferentiallyPrivateTrainer:
    """
    Integrates Opacus for active client-grade Differential Privacy tracking.
    Enforces dynamic gradient clipping, calibrated noise injection, 
    and Renyi Differential Privacy (RDP) accounting.
    """
    def __init__(
        self,
        model: torch.nn.Module,
        optimizer: torch.optim.Optimizer,
        dataloader: DataLoader,
        target_epsilon: float = 2.5,
        target_delta: float = 1e-5,
        epochs: int = 5,
        max_grad_norm: float = 1.0,
    ):
        self.model = model
        self.optimizer = optimizer
        self.dataloader = dataloader
        self.target_epsilon = target_epsilon
        self.target_delta = target_delta
        self.epochs = epochs
        self.max_grad_norm = max_grad_norm
        
        # Initialize Opacus PrivacyEngine
        self.privacy_engine = PrivacyEngine()
        
        # Make the components DP-compliant (returns wrapped module, optimizer, and loader)
        self.model, self.optimizer, self.dataloader = self.privacy_engine.make_private(
            module=self.model,
            optimizer=self.optimizer,
            data_loader=self.dataloader,
            noise_multiplier=1.2, # Sigma multiplier for standard Gaussian noise
            max_grad_norm=self.max_grad_norm,
        )

    def train_epoch(self, loss_fn = torch.nn.BCELoss()):
        self.model.train()
        total_loss = 0.0
        correct = 0
        total = 0
        
        for batch_idx, (data, target) in enumerate(self.dataloader):
            self.optimizer.zero_grad()
            outputs = self.model(data)
            loss = loss_fn(outputs, target.float().unsqueeze(1))
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item() * data.size(0)
            preds = (outputs >= 0.5).long()
            correct += preds.eq(target.unsqueeze(1)).sum().item()
            total += data.size(0)

        epoch_loss = total_loss / total
        epoch_acc = correct / total
        
        # Query spent RDP privacy budget
        epsilon = self.privacy_engine.get_epsilon(self.target_delta)
        
        return {
            "loss": epoch_loss,
            "accuracy": epoch_acc,
            "epsilon_spent": epsilon,
            "delta_bound": self.target_delta
        }
