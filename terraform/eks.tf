module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.0.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.28"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true # Restrict in prod with CIDR blocks

  eks_managed_node_group_defaults = {
    ami_type       = "AL2_x86_64_GPU" # For ML nodes
    instance_types = ["g5.xlarge", "m5.large"]
  }

  eks_managed_node_groups = {
    ml_nodes = {
      min_size     = 2
      max_size     = 10
      desired_size = 3
      instance_types = ["g5.xlarge"]
      taints = {
        gpu = {
          key    = "nvidia.com/gpu"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      }
    }
    general_nodes = {
      min_size     = 2
      max_size     = 5
      desired_size = 2
      instance_types = ["m5.large"]
    }
  }

  tags = {
    Environment = var.environment
  }
}