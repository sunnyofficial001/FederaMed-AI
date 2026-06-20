# Processed Datasets

This directory is intended to store the heavily processed healthcare datasets (e.g., `global_dataset.csv`, `Hospital_A.csv`, etc.). 

**Important:** These files can be incredibly large (exceeding 1 GB) and are therefore explicitly excluded from GitHub tracking to comply with file size limits.

## Setup Instructions

1. Download the raw datasets from PhysioNet (MIMIC-IV, eICU) and Stanford (CheXpert).
2. Place them in the `healthcare_datasets/` raw folder as instructed in the root README.
3. Run the DVC pipeline or data processing scripts to generate the processed CSV files and partitions in this directory.

`python extract_stats.py` will generate the data partitions automatically based on the configuration.
