# @license
# SPDX-License-Identifier: Apache-2.0

import torch
import torch.nn as nn
import numpy as np

class ClinicalLSTM(nn.Module):
    """
    Recurrent Neural Network leveraging Long Short-Term Memory (LSTM) cells
    specialized for time-series / sequential patient telemetry and electronic health record streams.
    Reshapes tabular physiological parameters into pseudo-sequential timeline steps of ICU charts.
    """
    def __init__(self, input_dim: int = 15, seq_len: int = 5, hidden_dim: int = 64, num_layers: int = 2):
        super(ClinicalLSTM, self).__init__()
        self.seq_len = seq_len
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        # Project 15 features to shape (seq_len, hidden_dim) via dense layer
        self.projection = nn.Linear(input_dim, seq_len * hidden_dim)
        
        # Recurrent Core
        self.lstm = nn.LSTM(
            input_size=hidden_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2 if num_layers > 1 else 0.0
        )
        
        # Fully-connected classification head
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Dropout(p=0.1),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        # x is of shape [batch_size, input_dim]
        batch_size = x.size(0)
        
        # Project and reshape to [batch_size, seq_len, hidden_dim]
        projected = self.projection(x).view(batch_size, self.seq_len, self.hidden_dim)
        
        # Forward through LSTM
        lstm_out, _ = self.lstm(projected)
        
        # Retrieve final sequence step output (many-to-one mapping)
        final_history = lstm_out[:, -1, :] # Shape: [batch_size, hidden_dim]
        
        return self.classifier(final_history)


class ClinicalTransformer(nn.Module):
    """
    Standard Self-Attention Transformer Encoder mapped for multivariate continuous eICU clinical vectors.
    Exploits attention blocks to capture complex cross-parameter interactions on synthetic EHR timelines.
    """
    def __init__(self, input_dim: int = 15, embed_dim: int = 32, num_heads: int = 4, num_layers: int = 2):
        super(ClinicalTransformer, self).__init__()
        self.embed_dim = embed_dim
        
        # Project 15 clinical indicators individually into sequence representations
        # We can treat each of the 15 features as a token of dimension embed_dim
        self.input_projections = nn.ModuleList([
            nn.Linear(1, embed_dim) for _ in range(input_dim)
        ])
        
        # Learnable temporal order encoding parameters (Positional Embeddings)
        self.positional_encoding = nn.Parameter(torch.randn(1, input_dim, embed_dim))
        
        # Core Self-Attention Encoder Layers
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim,
            nhead=num_heads,
            dim_feedforward=embed_dim * 2,
            dropout=0.2,
            batch_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # Squeeze classification blocks
        self.classifier = nn.Sequential(
            nn.Linear(embed_dim * input_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        # x shape: [batch_size, input_dim]
        batch_size = x.size(0)
        
        # Construct token embeddings
        token_list = []
        for i, proj in enumerate(self.input_projections):
            feat_slice = x[:, i].unsqueeze(1) # shape: [batch_size, 1]
            token_list.append(proj(feat_slice).unsqueeze(1)) # shape: [batch_size, 1, embed_dim]
            
        tokens = torch.cat(token_list, dim=1) # shape: [batch_size, input_dim, embed_dim]
        
        # Add positioning info
        tokens = tokens + self.positional_encoding
        
        # Process via self-attention
        attended_states = self.transformer_encoder(tokens) # shape: [batch_size, input_dim, embed_dim]
        
        # Flatten and categorize
        flattened = attended_states.view(batch_size, -1)
        return self.classifier(flattened)


class ClinicalTabTransformer(nn.Module):
    """
    State-of-the-art TabTransformer architecture for mixed-type electronic health records.
    - Fits embedding layers for sparse categorical markers (gender, admission_type)
    - Processes continuous telemetry parameters through dedicated Self-Attention Transformer encoders
    - Concatenates tabular encodings into Multi-Layer Perceptron (MLP) for high-fidelity clinical labels.
    """
    def __init__(
        self,
        num_continuous: int = 13, # 15 original features - 2 categorical identifiers (gender, admission_type)
        cat_cardinalities: list = [2, 3], # gender (card=2), admission_type (card=3)
        embed_dim: int = 16,
        num_heads: int = 2,
        num_layers: int = 2
    ):
        super(ClinicalTabTransformer, self).__init__()
        
        # 1. Categorical Feature Embeddings
        self.cat_embeddings = nn.ModuleList([
            nn.Embedding(card, embed_dim) for card in cat_cardinalities
        ])
        
        # 2. Transformers over Categorical Tokens
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim,
            nhead=num_heads,
            dim_feedforward=embed_dim * 2,
            dropout=0.1,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # 3. Continuous Features Projection Layer
        self.continuous_layer = nn.BatchNorm1d(num_continuous)
        
        # Combined Prediction MLP Head
        total_mlp_input = (len(cat_cardinalities) * embed_dim) + num_continuous
        self.mlp = nn.Sequential(
            nn.Linear(total_mlp_input, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        # Continuous feature slices (indices represent typical normalized continuous columns)
        # Tabular partition indexes:
        # Indices 0 (age), 3..14 (vital indicators + engineered scores) -> continuous parameters!
        # Indices 1 (gender) and 2 (admission_type) are categoricals.
        
        # Extract Categorical integers
        # Standardize gender/admission bounds inside embeddings
        gender_idx = torch.clamp(x[:, 1].long(), 0, 1)
        admission_idx = torch.clamp(x[:, 2].long(), 0, 2)
        
        gender_embed = self.cat_embeddings[0](gender_idx).unsqueeze(1) # shape: [batch_size, 1, embed_dim]
        admission_embed = self.cat_embeddings[1](admission_idx).unsqueeze(1) # shape: [batch_size, 1, embed_dim]
        
        # Combine categoricals and run attention
        cat_tokens = torch.cat([gender_embed, admission_embed], dim=1) # shape: [batch_size, 2, embed_dim]
        cat_attended = self.transformer(cat_tokens) # shape: [batch_size, 2, embed_dim]
        cat_flat = cat_attended.view(x.size(0), -1) # shape: [batch_size, 2 * embed_dim]
        
        # Extract Continuous variables
        continuous_indices = [0] + list(range(3, 15))
        continuous_feats = x[:, continuous_indices] # shape: [batch_size, 13]
        
        # Batch normalize continuous
        continuous_normalized = self.continuous_layer(continuous_feats)
        
        # Combine dense embeddings and feed to classifier
        combined_features = torch.cat([cat_flat, continuous_normalized], dim=1)
        return self.mlp(combined_features)


def get_model(model_name: str, num_classes: int = 1, pretrained: bool = False) -> nn.Module:
    """
    Model architecture dispatcher selector.
    """
    name_lower = model_name.lower()
    if "lstm" in name_lower:
        return ClinicalLSTM(input_dim=15, seq_len=5, hidden_dim=64)
    elif "tabtransformer" in name_lower:
        return ClinicalTabTransformer(num_continuous=13, cat_cardinalities=[2, 3], embed_dim=16)
    elif "transformer" in name_lower or "vit" in name_lower:
        return ClinicalTransformer(input_dim=15, embed_dim=32, num_heads=4)
    else:
        # Highly compliant fallback matching model specifications
        return ClinicalLSTM(input_dim=15, seq_len=5, hidden_dim=64)
