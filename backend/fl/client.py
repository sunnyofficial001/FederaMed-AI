import os
import argparse
import logging
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import pandas as pd
import numpy as np
import flwr as fl

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TabularNN(nn.Module):
    def __init__(self, input_dim):
        super(TabularNN, self).__init__()
        self.fc1 = nn.Linear(input_dim, 128)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(128, 64)
        self.out = nn.Linear(64, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        return self.sigmoid(self.out(x))

def load_partition(client_name: str):
    logger.info(f"Loading data for {client_name}")
    path = f"backend/data/processed/partitions/{client_name}.csv"
    if not os.path.exists(path):
        raise FileNotFoundError(f"Partition {path} not found. Run feature_store.py first.")
    
    df = pd.read_csv(path)
    # Fill remaining NaNs for PyTorch
    df.fillna(df.mean(), inplace=True)
    
    y = df['readmitted_binary'].values.astype(np.float32)
    X = df.drop(columns=['readmitted_binary']).values.astype(np.float32)
    
    return X, y

def train(net, trainloader, epochs, fedprox_mu=0.0, global_params=None):
    criterion = nn.BCELoss()
    optimizer = optim.Adam(net.parameters(), lr=0.001)
    net.train()
    
    for epoch in range(epochs):
        for X_batch, y_batch in trainloader:
            optimizer.zero_grad()
            outputs = net(X_batch).squeeze()
            loss = criterion(outputs, y_batch)
            
            # FedProx Proximal Term
            if fedprox_mu > 0 and global_params is not None:
                proximal_term = 0.0
                for local_weights, global_weights in zip(net.parameters(), global_params):
                    proximal_term += ((local_weights - global_weights) ** 2).sum()
                loss += (fedprox_mu / 2) * proximal_term
                
            loss.backward()
            
            # DP Gradient Clipping (Phase 6 placeholder)
            torch.nn.utils.clip_grad_norm_(net.parameters(), max_norm=1.0)
            
            optimizer.step()

def test(net, testloader):
    criterion = nn.BCELoss()
    correct = 0
    total = 0
    loss = 0.0
    net.eval()
    with torch.no_grad():
        for X_batch, y_batch in testloader:
            outputs = net(X_batch).squeeze()
            loss += criterion(outputs, y_batch).item()
            predicted = (outputs > 0.5).float()
            total += y_batch.size(0)
            correct += (predicted == y_batch).sum().item()
    accuracy = correct / total
    return loss / len(testloader), accuracy

class HospitalClient(fl.client.NumPyClient):
    def __init__(self, net, trainloader, testloader, num_examples):
        self.net = net
        self.trainloader = trainloader
        self.testloader = testloader
        self.num_examples = num_examples

    def get_parameters(self, config):
        return [val.cpu().numpy() for _, val in self.net.state_dict().items()]

    def set_parameters(self, parameters):
        params_dict = zip(self.net.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.net.load_state_dict(state_dict, strict=True)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        epochs = config.get("epochs", 1)
        fedprox_mu = config.get("fedprox_mu", 0.0)
        
        # Convert parameters to tensors for FedProx
        global_params = [torch.tensor(p) for p in parameters]
        
        train(self.net, self.trainloader, epochs, fedprox_mu, global_params)
        return self.get_parameters(config={}), self.num_examples["train"], {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        loss, accuracy = test(self.net, self.testloader)
        logger.info(f"Client Evaluation - Loss: {loss:.4f}, Accuracy: {accuracy:.4f}")
        return float(loss), self.num_examples["test"], {"accuracy": float(accuracy)}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--client", type=str, required=True, help="Client name (e.g., Hospital_A)")
    args = parser.parse_args()

    X, y = load_partition(args.client)
    
    # Simple train test split
    split = int(0.8 * len(X))
    X_train, y_train = X[:split], y[:split]
    X_test, y_test = X[split:], y[split:]
    
    trainloader = DataLoader(TensorDataset(torch.tensor(X_train), torch.tensor(y_train)), batch_size=32, shuffle=True)
    testloader = DataLoader(TensorDataset(torch.tensor(X_test), torch.tensor(y_test)), batch_size=32)
    
    net = TabularNN(input_dim=X.shape[1])
    
    client = HospitalClient(net, trainloader, testloader, {"train": len(X_train), "test": len(X_test)})
    
    logger.info(f"Starting FL Client: {args.client}")
    fl.client.start_numpy_client(server_address="127.0.0.1:8080", client=client)
