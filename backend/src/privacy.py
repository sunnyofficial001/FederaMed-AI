import logging
import math

logger = logging.getLogger(__name__)

class PrivacyEngineTracker:
    def __init__(self, target_epsilon: float = 10.0, target_delta: float = 1e-5):
        self.target_epsilon = target_epsilon
        self.target_delta = target_delta
        self.current_epsilon = 0.0
        self.noise_multiplier = 1.1
        self.max_grad_norm = 1.0
        
    def spend_budget(self, rounds: int, sample_rate: float):
        """
        Simulate privacy budget spending over FL rounds.
        In a real scenario, this would use moments accountant (RDP) like in Opacus.
        """
        # A simple placeholder calculation for tracking demonstration
        spent = (sample_rate * math.sqrt(rounds) * self.noise_multiplier)
        self.current_epsilon += spent
        logger.info(f"Spent {spent:.2f} epsilon. Total: {self.current_epsilon:.2f}/{self.target_epsilon}")
        
        if self.current_epsilon > self.target_epsilon:
            logger.warning("Privacy budget exceeded!")
            return False
        return True

    def get_privacy_metrics(self):
        return {
            "target_epsilon": self.target_epsilon,
            "target_delta": self.target_delta,
            "current_epsilon": self.current_epsilon,
            "noise_multiplier": self.noise_multiplier,
            "max_grad_norm": self.max_grad_norm,
            "budget_remaining": max(0, self.target_epsilon - self.current_epsilon)
        }
