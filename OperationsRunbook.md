# Operations & Administration Runbook - FederaMed AI

This runbook specifies day-to-day administration procedures, emergency playbooks, security audits, and configuration tasks for platform reliability engineers (SREs).

---

## 1. Compliance Audits & Security Reports
To maintain HIPAA compliance standards, administrators must review audit trail signatures dynamically registered in the system ledger. 

### Checking the Audit Log via SQL Query
Run the following database query via local administration terminals to inspect raw transaction signatures, access IP addresses, and check for anomalies:
```sql
SELECT timestamp, "userId", role, action, status, signature, details 
FROM AUDIT_LOGS 
ORDER BY timestamp DESC 
LIMIT 50;
```

#### Expected compliance output pattern:
```
 timestamp                  | userId             | role       | action               | status  | signature
----------------------------+--------------------+------------+----------------------+---------+------------
 2026-06-13T16:20:05.112Z   | clinical-lead-sara | Admin      | Parameter Configured | SUCCESS | 0xee29a8c122
```

---

## 2. Dynamic Privacy Reconfiguration
If the database registry signals rapid budget spending flags or warnings:

```
[ALERT WARNING] Total Epsilon Spent (ε) is at 1.48, approaching limit threshold threshold of 1.5!
```

### Action Steps to Increase Privacy Lifetime:
1. Navigate to the **Coordinator Dashboard Settings Card** (or transmit a payload to `/api/settings`):
2. Increase the allocation threshold bounds (`privacyEpsilon`) from `1.5` to `2.5`.
3. If necessary, disable active differential privacy briefly during sandbox validations to verify convergence curves.
4. Reduce client sample rates under `server.ts` initialization fields which dynamically scales down Spent Epsilon bounds calculated under Rényi Accountants per epoch.

---

## 3. Handling Clinical Data Drift Flags

### Drift Response Playbook
When the Kolmogorov-Smirnov test statistics or Population Stability Index (PSI) values exceed warning parameters (`ksDistance` > 0.12 or `psiDistance` > 0.25):

```
[WARNING SIGNAL] Node hospital_c (eICU Database) reports active KS distance: 0.165! DRIFT DETECTED.
```

1. **Pruning Active Updates**: Temporarily change hospital node status flags to `offline` inside Redis memory nodes to prune their contribution weights from the consensus pool.
2. **Inject Gradient Correction**: The standard coordination pipeline automatically applies multipliers derived from **SCAFFOLD correction coefficients** inside `executeRealComputeRound()` to correct localized variance drift.
3. **Trigger Ingestion Retrain**: Coordinate with institutional database engineers to retrain local encoders on freshly balanced sample patient populations.

---

## 4. Emergency Backup of Unified Checkpoint Lists
Simulated SQLite datasets and parameter structures are stored in `/server_data`. To backup model binaries and audit trail databases:

```bash
# Execute disk snapshots to safe buckets
tar -czvf /backups/federamed_data_$(date +%F).tar.gz ./server_data/
```

To restore prior database checkpoints:
```bash
tar -xzvf /backups/federamed_data_2026-06-13.tar.gz -C .
```
Restart server tasks immediately following restorals using `npm run start` to re-sync PostgreSQL caches inside the environment.
---

## 5. Escalation Hierarchies
* **SQL/Storage Failures**: SRE On-call team.
* **Aggregator Node Sync Drops**: Coordinating Infrastructure Engineers.
* **Statistical Drift Anomalies**: Principal Clinical ML Research Scientist.
