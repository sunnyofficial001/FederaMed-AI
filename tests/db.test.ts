import { describe, it, expect } from "vitest";
import { postgresDb, redisCache } from "../server/db";

describe("Durable Simulated State Databases", () => {
  describe("PostgreSQLClient", () => {
    it("should initialize default clinical tables and rows", async () => {
      postgresDb.initializeSchema();
      const res = await postgresDb.query("SELECT * FROM HOSPITAL_METADATA");
      expect(res.rowCount).toBeGreaterThanOrEqual(4);
      expect(res.rows[0].id).toBe("hospital_a");
    });

    it("should process custom queries such as inserting training runs", async () => {
      const testRun = {
        timestamp: new Date().toISOString(),
        version: "v1.2.0-test",
        accuracy: 0.85,
        loss: 0.35,
        rounds: 5
      };

      await postgresDb.query("INSERT INTO TRAINING_RUNS", [testRun]);
      const res = await postgresDb.query("SELECT * FROM TRAINING_RUNS");
      expect(res.rowCount).toBeGreaterThan(0);
      expect(res.rows[res.rows.length - 1].version).toBe("v1.2.0-test");
    });
  });

  describe("RedisClient Memory Caching", () => {
    it("should store and retrieve active telemetry parameters", () => {
      redisCache.set("test_key", { param: "val" });
      const val = redisCache.get("test_key");
      expect(val).toEqual({ param: "val" });
    });

    it("should expire cache elements based on timestamps", async () => {
      redisCache.set("expiring_key", "still_here", 1); // 1 second duration
      let val = redisCache.get("expiring_key");
      expect(val).toBe("still_here");

      // Verify expiration handling (Mocking expiration or waiting)
      redisCache.set("expired_key", "gone", -1); // already expired
      const expiredVal = redisCache.get("expired_key");
      expect(expiredVal).toBeNull();
    });
  });
});
