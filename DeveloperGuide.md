# Developer Manual - FederaMed AI

This developer-vetted handbook covers system environment setups, local code pipelines, compilation mechanics, and extension instructions.

---

## 1. Local Development Setup

To build an isolated local workspace environment:

```bash
# 1. Install development components
npm install

# 2. Start fast hot-rebuilding server
npm run dev
```

The system runs on the standard Node.js loop, loading `server.ts` directly with preinstalled `tsx` loaders to execute code changes instantly.

---

## 2. Core Code Extensibility Targets

### 2.1 Adding a New Clinical Preprocessor Ingest
To support a new medical dataset (e.g., **UK Biobank genomic arrays** or **Mckesson MRI scans**):
1. Navigate to `/server/datasets.ts`.
2. Append a mapping utility inside the `MedicalDataPipeline` class:
```typescript
public static preprocessGenomics(rawSequences: any[]): DiagnosticPatientSample[] {
  return rawSequences.map((seq, index) => {
    const features = new Array(256).fill(0);
    // Extract nucleotides metrics or gene scores...
    features[0] = seq.variance_rsid_99 || 0.05;
    
    return {
      id: `biobank_pt_${index}`,
      features,
      labels: [seq.has_cardiovascular_risk ? 1 : 0]
    };
  });
}
```
3. Update `executeRealComputeRound()` inside `server.ts` to route telemetry based on new dataset string codes.

### 2.2 Adding Custom Optimization Calculations
To implement an updated optimization penalty algorithm (e.g., **AdaGrad-Federated** or **Momentum-Fl**):
1. Navigate to `DiagnosticNeuralNetwork.localTrainStep()` in `/server/ml.ts`.
2. Map your mathematical rule-set inside the local parameter loop.
3. Expose the argument variables in `types.ts` and add associated configuration switches to UI layers in `src/App.tsx`.

---

## 3. High-Speed Testing Mechanics

The engineering pipeline enforces testing boundaries under **Vitest**, running isolated multi-threaded suites in microseconds.

```bash
# Run tests
npm run test

# Run tests with active file-watcher enabled
npx vitest
```

### Adding a new test block:
We highly recommend adding regression tests inside `/tests/*` for any newly introduced mathematical helpers or API endpoints:
```typescript
import { describe, it, expect } from "vitest";

describe("My New Feature", () => {
  it("should execute assertions cleanly", () => {
    expect(1 + 1).toBe(2);
  });
});
```

---

## 4. Compilation & Production Bundling
Production builds compile both the web frontend (via Vite) and server entry files (via `esbuild` to solve nested module resolution overhead):

```bash
# Execute local clean and compiler scripts
npm run build
```
This writes standard production outputs into `/dist`, including the unified static page asset tree and `dist/server.cjs` executing independently on default Node instances.
---

## 5. IDE Setup (VScode, Cursor)
To maintain styling correctness, configure your IDE with the following plugins:
* **Tailwind CSS IntelliSense**: For real-time utility autocomplete.
* **ESLint / Prettier**: Using standard semicolons, double quotes, and 2-space tab indent configurations.
