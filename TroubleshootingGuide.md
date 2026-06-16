# Troubleshooting & Recovery Guide - FederaMed AI

This triage guide contains diagnostics, resolutions, and recovery playbooks for common operational, development, and system issues.

---

## 1. System Failure Diagnostics Matrix

| Diagnostic symptom | Probable Cause | Urgent Remediation Action |
| :--- | :--- | :--- |
| **Port 3000 Collision** | Rogue Node process already bound. | Kill active daemon or run `npx kill-port 3000`. |
| **Missing Clinical Advice** | `GEMINI_API_KEY` undefined inside `.env`. | Add valid developer key inside target `.env` file. |
| **Drift warnings (hospital_c)** | Statistical variance skew in eICU datasets. | Apply SCAFFOLD multipliers or toggle client offline. |
| **Vitest fails to execute** | Missing `vitest` dependency in node_modules. | Execute standard `npm install` task. |

---

## 2. Walkthrough Resolution Guides

### 2.1 Resolving Gemini Disconnection Warnings
The expert clinician analysis requires standard Google GenAI tokens to generate automated summaries:

#### Verification
Check server execution logs:
```
Failed to initialize GoogleGenAI: GEMINI_API_KEY environment variable is required
```

#### Remediation Action:
1. Confirm `.env` exists in the project root:
```env
GEMINI_API_KEY=AIzaSy...YourKey...
```
2. Make sure you do NOT prefix this server-secret with `VITE_` (Vite-prefixed fields leak into browser networks).
3. Restart development processes via `npm run dev` to reload the system environment.

---

### 2.2 Recovering Corrupted SQLite/JSON Storage Stores
If server-start throws JSON syntax errors during parser processing:

```
SyntaxError: Unexpected end of JSON input at JSON.parse (<anonymous>)
```

#### Remediation Action:
1. Safe-delete or reset the corrupted store records under `./server_data/`:
```bash
rm -rf ./server_data/*.json
```
2. Restart the application daemon:
```bash
npm run dev
```
3. The platform's db module (`server/db.ts`) automatically re-bootstraps fresh structures, schemas, and seeds empty metadata databases on initialization.

---

### 2.3 Resolving Memory Overflow during Backprop Loops
If long-duration, high-epoch neural aggregation workloads prompt Node V8 errors:

```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
```

#### Remediation Action:
1. Decrease the batch size under localized parameters.
2. Manually increase Node's maximum RAM heap limits using CLI execution environment flags:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run start
```

---

### 2.4 Fixing TypeScript Type Compiler Clashing
Ensure your import bindings match standard ES6 formatting patterns (Named Imports):

```typescript
// ❌ INCORRECT (CommonJS binding)
const db = require("./server/db");

//  CORRECT (Standard ES6 Named Import)
import { postgresDb, redisCache } from "./server/db";
```

Ensure you avoid matching truncated code phrases or using `const enum` declarations which violate standard compilation safety targets.
