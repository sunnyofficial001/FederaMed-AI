# @license
# SPDX-License-Identifier: Apache-2.0

"""
FederaMed AI - Healthcare Data Pipeline Configuration

This module configures DVC (Data Version Control) for healthcare dataset versioning,
lineage tracking, and reproducibility across MIMIC-IV, eICU, and CheXpert datasets.

Production-grade implementation following MLOps best practices for healthcare AI.
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any, List


class DVCConfigManager:
    """
    Manages DVC configuration for healthcare dataset versioning and lineage.
    
    Implements:
    - Dataset versioning with DVC
    - Lineage tracking across pipeline stages
    - Reproducible data pipelines
    - Remote storage configuration (S3, GCS, Azure)
    """
    
    def __init__(self, base_dir: str = "/workspace"):
        self.base_dir = Path(base_dir)
        self.dvc_configs_dir = self.base_dir / "dvc_configs"
        self.datasets_dir = self.base_dir / "healthcare_datasets"
        self.pipeline_dir = self.base_dir / "data_pipeline"
        
        # Ensure directories exist
        self.dvc_configs_dir.mkdir(parents=True, exist_ok=True)
        self.datasets_dir.mkdir(parents=True, exist_ok=True)
        self.pipeline_dir.mkdir(parents=True, exist_ok=True)
    
    def create_dvc_yaml(self, dataset_name: str, stages: Dict[str, Any]) -> str:
        """
        Creates dvc.yaml pipeline definition for a healthcare dataset.
        
        Args:
            dataset_name: Name of the dataset (mimic_iv, eicu, chexpert)
            stages: Dictionary defining pipeline stages with deps, outs, and cmds
            
        Returns:
            Path to created dvc.yaml file
        """
        dvc_yaml = {
            "stages": stages
        }
        
        output_path = self.pipeline_dir / f"dvc_{dataset_name}.yaml"
        with open(output_path, 'w') as f:
            yaml.dump(dvc_yaml, f, default_flow_style=False, sort_keys=False)
        
        return str(output_path)
    
    def create_dvc_params(self, params: Dict[str, Any], dataset_name: str) -> str:
        """
        Creates params.yaml for reproducible pipeline parameters.
        
        Args:
            params: Pipeline parameters (validation thresholds, feature configs, etc.)
            dataset_name: Dataset identifier
            
        Returns:
            Path to created params file
        """
        params_file = self.pipeline_dir / f"params_{dataset_name}.yaml"
        with open(params_file, 'w') as f:
            yaml.dump(params, f, default_flow_style=False, sort_keys=False)
        
        return str(params_file)
    
    def create_dvc_remote_config(self, remote_type: str = "s3", 
                                  bucket_name: str = "federamed-datasets",
                                  region: str = "us-east-1") -> Dict[str, Any]:
        """
        Configures DVC remote storage for dataset artifacts.
        
        Args:
            remote_type: Storage backend (s3, gs, azure)
            bucket_name: Cloud storage bucket/container name
            region: Cloud region for storage
            
        Returns:
            DVC remote configuration dictionary
        """
        remote_config = {
            "core": {
                "remote": "healthcare_storage"
            },
            "remote": {
                "healthcare_storage": {
                    "url": f"{remote_type}://{bucket_name}/datasets",
                }
            }
        }
        
        if remote_type == "s3":
            remote_config["remote"]["healthcare_storage"].update({
                "region": region,
                "sse": "AES256",  # Server-side encryption
                "versioning": True
            })
        elif remote_type == "gs":
            remote_config["remote"]["healthcare_storage"].update({
                "projectname": "federamed-ai",
                "versioning": True
            })
        elif remote_type == "azure":
            remote_config["remote"]["healthcare_storage"].update({
                "container": bucket_name,
                "connection_string": "${AZURE_STORAGE_CONNECTION_STRING}"
            })
        
        # Save to .dvc/config
        config_path = self.base_dir / ".dvc" / "config"
        config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(config_path, 'w') as f:
            yaml.dump(remote_config, f, default_flow_style=False)
        
        return remote_config
    
    def create_dataset_lineage_config(self, dataset_name: str, 
                                       lineage_metadata: Dict[str, Any]) -> str:
        """
        Creates lineage tracking metadata for dataset provenance.
        
        Args:
            dataset_name: Dataset identifier
            lineage_metadata: Metadata including source, transformations, versions
            
        Returns:
            Path to lineage metadata file
        """
        lineage_file = self.datasets_dir / dataset_name / "lineage.yaml"
        lineage_file.parent.mkdir(parents=True, exist_ok=True)
        
        lineage_config = {
            "dataset": dataset_name,
            "created_at": lineage_metadata.get("created_at", ""),
            "source": lineage_metadata.get("source", ""),
            "version": lineage_metadata.get("version", "1.0.0"),
            "transformations": lineage_metadata.get("transformations", []),
            "quality_metrics": lineage_metadata.get("quality_metrics", {}),
            "compliance": lineage_metadata.get("compliance", {})
        }
        
        with open(lineage_file, 'w') as f:
            yaml.dump(lineage_config, f, default_flow_style=False, sort_keys=False)
        
        return str(lineage_file)
    
    def generate_mimic_iv_pipeline(self) -> str:
        """
        Generates complete DVC pipeline for MIMIC-IV dataset ingestion.
        
        Returns:
            Path to generated dvc.yaml
        """
        stages = {
            "ingest_mimic_iv": {
                "desc": "Ingest raw MIMIC-IV data from PhysioNet",
                "deps": [
                    "data_pipeline/ingestion/mimic_iv_ingestor.py"
                ],
                "outs": [
                    {
                        "path": "healthcare_datasets/mimic_iv/raw",
                        "cache": True,
                        "persist": True
                    }
                ],
                "params": [
                    "mimic_iv.version",
                    "mimic_iv.cohort_filters"
                ],
                "cmd": "python data_pipeline/ingestion/mimic_iv_ingestor.py --output healthcare_datasets/mimic_iv/raw"
            },
            "validate_mimic_iv": {
                "desc": "Validate MIMIC-IV data quality and schema compliance",
                "deps": [
                    "data_pipeline/ingestion/mimic_iv_ingestor.py",
                    "data_pipeline/validation/schema_validator.py",
                    "healthcare_datasets/mimic_iv/raw"
                ],
                "outs": [
                    {
                        "path": "healthcare_datasets/mimic_iv/validated",
                        "cache": True
                    },
                    {
                        "path": "healthcare_datasets/mimic_iv/validation_report.json",
                        "cache": False
                    }
                ],
                "params": [
                    "mimic_iv.validation_thresholds"
                ],
                "cmd": "python data_pipeline/validation/schema_validator.py --input healthcare_datasets/mimic_iv/raw --output healthcare_datasets/mimic_iv/validated"
            },
            "featurize_mimic_iv": {
                "desc": "Generate clinical features from validated MIMIC-IV data",
                "deps": [
                    "data_pipeline/features/clinical_feature_engineer.py",
                    "healthcare_datasets/mimic_iv/validated"
                ],
                "outs": [
                    {
                        "path": "healthcare_datasets/mimic_iv/features",
                        "cache": True
                    }
                ],
                "params": [
                    "mimic_iv.feature_config"
                ],
                "cmd": "python data_pipeline/features/clinical_feature_engineer.py --input healthcare_datasets/mimic_iv/validated --output healthcare_datasets/mimic_iv/features"
            }
        }
        
        return self.create_dvc_yaml("mimic_iv", stages)
    
    def generate_eicu_pipeline(self) -> str:
        """
        Generates complete DVC pipeline for eICU dataset ingestion.
        
        Returns:
            Path to generated dvc.yaml
        """
        stages = {
            "ingest_eicu": {
                "desc": "Ingest raw eICU data from PhysioNet",
                "deps": [
                    "data_pipeline/ingestion/eicu_ingestor.py"
                ],
                "outs": [
                    {
                        "path": "healthcare_datasets/eicu/raw",
                        "cache": True,
                        "persist": True
                    }
                ],
                "params": [
                    "eicu.version",
                    "eicu.hospital_filters"
                ],
                "cmd": "python data_pipeline/ingestion/eicu_ingestor.py --output healthcare_datasets/eicu/raw"
            },
            "validate_eicu": {
                "desc": "Validate eICU data quality and schema compliance",
                "deps": [
                    "data_pipeline/ingestion/eicu_ingestor.py",
                    "data_pipeline/validation/schema_validator.py",
                    "healthcare_datasets/eicu/raw"
                ],
                "outs": [
                    {
                        "path": "healthcare_datasets/eicu/validated",
                        "cache": True
                    },
                    {
                        "path": "healthcare_datasets/eicu/validation_report.json",
                        "cache": False
                    }
                ],
                "params": [
                    "eicu.validation_thresholds"
                ],
                "cmd": "python data_pipeline/validation/schema_validator.py --input healthcare_datasets/eicu/raw --output healthcare_datasets/eicu/validated"
            },
            "featurize_eicu": {
                "desc": "Generate clinical features from validated eICU data",
                "deps": [
                    "data_pipeline/features/clinical_feature_engineer.py",
                    "healthcare_datasets/eicu/validated"
                ],
                "outs": [
                    {
                        "path": "healthcare_datasets/eicu/features",
                        "cache": True
                    }
                ],
                "params": [
                    "eicu.feature_config"
                ],
                "cmd": "python data_pipeline/features/clinical_feature_engineer.py --input healthcare_datasets/eicu/validated --output healthcare_datasets/eicu/features"
            }
        }
        
        return self.create_dvc_yaml("eicu", stages)
    
    def generate_chexpert_pipeline(self) -> str:
        """
        Generates complete DVC pipeline for CheXpert dataset ingestion.
        
        Returns:
            Path to generated dvc.yaml
        """
        stages = {
            "ingest_chexpert": {
                "desc": "Ingest raw CheXpert chest X-ray dataset",
                "deps": [
                    "data_pipeline/ingestion/chexpert_ingestor.py"
                ],
                "outs": [
                    {
                        "path": "healthcare_datasets/chexpert/raw",
                        "cache": True,
                        "persist": True
                    }
                ],
                "params": [
                    "chexpert.version",
                    "chexpert.split_ratios"
                ],
                "cmd": "python data_pipeline/ingestion/chexpert_ingestor.py --output healthcare_datasets/chexpert/raw"
            },
            "validate_chexpert": {
                "desc": "Validate CheXpert image labels and metadata",
                "deps": [
                    "data_pipeline/ingestion/chexpert_ingestor.py",
                    "data_pipeline/validation/image_validator.py",
                    "healthcare_datasets/chexpert/raw"
                ],
                "outs": [
                    {
                        "path": "healthcare_datasets/chexpert/validated",
                        "cache": True
                    },
                    {
                        "path": "healthcare_datasets/chexpert/validation_report.json",
                        "cache": False
                    }
                ],
                "params": [
                    "chexpert.validation_thresholds"
                ],
                "cmd": "python data_pipeline/validation/image_validator.py --input healthcare_datasets/chexpert/raw --output healthcare_datasets/chexpert/validated"
            },
            "preprocess_chexpert": {
                "desc": "Preprocess CheXpert images (normalization, augmentation)",
                "deps": [
                    "data_pipeline/preprocessing/image_preprocessor.py",
                    "healthcare_datasets/chexpert/validated"
                ],
                "outs": [
                    {
                        "path": "healthcare_datasets/chexpert/preprocessed",
                        "cache": True
                    }
                ],
                "params": [
                    "chexpert.preprocessing_config"
                ],
                "cmd": "python data_pipeline/preprocessing/image_preprocessor.py --input healthcare_datasets/chexpert/validated --output healthcare_datasets/chexpert/preprocessed"
            }
        }
        
        return self.create_dvc_yaml("chexpert", stages)
    
    def create_all_pipelines(self) -> Dict[str, str]:
        """
        Generates all healthcare dataset pipelines.
        
        Returns:
            Dictionary mapping dataset names to their dvc.yaml paths
        """
        pipelines = {
            "mimic_iv": self.generate_mimic_iv_pipeline(),
            "eicu": self.generate_eicu_pipeline(),
            "chexpert": self.generate_chexpert_pipeline()
        }
        
        return pipelines


if __name__ == "__main__":
    # Initialize DVC configuration manager
    config_manager = DVCConfigManager()
    
    # Generate all dataset pipelines
    pipelines = config_manager.create_all_pipelines()
    
    print("✅ DVC Pipelines Generated:")
    for dataset, path in pipelines.items():
        print(f"  - {dataset}: {path}")
    
    # Create example params file
    example_params = {
        "mimic_iv": {
            "version": "2.2",
            "cohort_filters": {
                "min_age": 18,
                "max_age": 90,
                "icu_stay_min_hours": 24
            },
            "validation_thresholds": {
                "min_completeness": 0.95,
                "max_missing_rate": 0.05,
                "outlier_std_threshold": 4.0
            },
            "feature_config": {
                "vital_signs": ["heart_rate", "bp_sys", "bp_dia", "temp", "spo2"],
                "lab_values": ["creatinine", "bun", "lactate", "wbc"],
                "derived_features": ["sofa_score", "apsiii", "charlson_comorbidity"]
            }
        },
        "eicu": {
            "version": "2.0",
            "hospital_filters": {
                "min_beds": 100,
                "teaching_status": True
            },
            "validation_thresholds": {
                "min_completeness": 0.95,
                "max_missing_rate": 0.05,
                "outlier_std_threshold": 4.0
            },
            "feature_config": {
                "vital_signs": ["heart_rate", "bp_sys", "bp_dia", "temp", "spo2"],
                "lab_values": ["creatinine", "bun", "lactate", "wbc"],
                "derived_features": ["sofa_score", "apache_iv", "charlson_comorbidity"]
            }
        },
        "chexpert": {
            "version": "1.0",
            "split_ratios": {
                "train": 0.7,
                "val": 0.1,
                "test": 0.2
            },
            "validation_thresholds": {
                "min_image_quality": 0.9,
                "label_consistency_min": 0.85
            },
            "preprocessing_config": {
                "image_size": [224, 224],
                "normalize_mean": [0.485, 0.456, 0.406],
                "normalize_std": [0.229, 0.224, 0.225],
                "augmentations": ["random_flip", "random_rotation"]
            }
        }
    }
    
    params_path = config_manager.create_dvc_params(example_params, "all_datasets")
    print(f"\n✅ Parameters file created: {params_path}")
    
    # Configure remote storage (example with S3)
    remote_config = config_manager.create_dvc_remote_config(
        remote_type="s3",
        bucket_name="federamed-healthcare-datasets",
        region="us-east-1"
    )
    print(f"✅ Remote storage configured: {remote_config['core']['remote']}")
    
    print("\n📋 Next Steps:")
    print("1. Initialize DVC: cd /workspace && dvc init")
    print("2. Add remote: dvc remote add healthcare_storage s3://federamed-healthcare-datasets/datasets")
    print("3. Run pipeline: dvc repro data_pipeline/dvc_mimic_iv.yaml")
    print("4. Track lineage: Review healthcare_datasets/<dataset>/lineage.yaml")
