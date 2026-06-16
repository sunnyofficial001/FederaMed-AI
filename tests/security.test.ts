import { describe, it, expect } from "vitest";
import { DiagnosticNeuralNetwork } from "../server/ml";
import { AttackSimulationLab } from "../server/security";

describe("Adversarial Attack Simulation Proving Grounds", () => {
  it("should evaluate Membership Inference Attack bounds with and without DP", () => {
    const model = new DiagnosticNeuralNetwork("DenseNet-121");
    const trainData = [
      new Array(256).fill(0.1),
      new Array(256).fill(0.15)
    ];
    const testData = [
      new Array(256).fill(0.5),
      new Array(256).fill(0.55)
    ];

    const privateAttack = AttackSimulationLab.simulateMembershipInference(model, trainData, testData, true);
    const publicAttack = AttackSimulationLab.simulateMembershipInference(model, trainData, testData, false);

    expect(privateAttack.attackName).toBe("Membership Inference Attack");
    
    // DP should suppress the success rates close to 50% random coin flip
    expect(privateAttack.attackSuccessRate).toBeLessThan(65);
    expect(privateAttack.attackSuccessRate).toBeGreaterThanOrEqual(45);
  });

  it("should simulate model inversion and observe DP defence scramble", () => {
    const model = new DiagnosticNeuralNetwork("DenseNet-121");
    
    const publicInversion = AttackSimulationLab.simulateModelInversion(model, false);
    const privateInversion = AttackSimulationLab.simulateModelInversion(model, true);

    expect(publicInversion.attackSuccessRate).toBe(84.5); // Fixed standard baseline
    expect(privateInversion.attackSuccessRate).toBe(12.4); // private degradation
    expect(privateInversion.defenseSuccessRate).toBe(87.6);
  });

  it("should simulate data poisoning and backdoor trigger protection", () => {
    const model = new DiagnosticNeuralNetwork("DenseNet-121");

    const poisonedPublic = AttackSimulationLab.simulateDataPoisoning(model, false);
    const poisonedPrivate = AttackSimulationLab.simulateDataPoisoning(model, true);

    expect(poisonedPublic.attackSuccessRate).toBe(72.8);
    expect(poisonedPrivate.attackSuccessRate).toBe(18.2);

    const backdoorPublic = AttackSimulationLab.simulateBackdoor(model, false);
    const backdoorPrivate = AttackSimulationLab.simulateBackdoor(model, true);

    expect(backdoorPublic.attackSuccessRate).toBe(91.2);
    expect(backdoorPrivate.attackSuccessRate).toBe(5.4);
  });
});
