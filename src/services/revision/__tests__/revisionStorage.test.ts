/**
 * Deterministic Unit and Regression Tests for SRS Status Normalization (Fix #3).
 *
 * Covers:
 * 1. Item with nextDueDate = yesterday and stored status = "upcoming" returns "overdue".
 * 2. Item with nextDueDate = today and stored status = "upcoming" returns "due".
 * 3. Item with nextDueDate = tomorrow returns "upcoming".
 * 4. Completed item remains "completed" even when nextDueDate is in the past.
 * 5. Skipped item remains "skipped" even when nextDueDate is in the past.
 * 6. Audit scenario: stored nextDueDate = "2026-08-01", stored status = "upcoming", evaluated on "2026-09-01" -> "overdue".
 * 7. LocalStorageRevisionStorage.getItems() integrates normalization dynamically upon read.
 */

import assert from "node:assert/strict";
import { test, describe } from "node:test";

import {
  normalizeRevisionItemStatus,
  LocalStorageRevisionStorage,
} from "../revisionStorage";
import { RevisionItem } from "../revisionTypes";

// Mock localStorage for Node environment tests
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

if (typeof globalThis.localStorage === "undefined") {
  (globalThis as unknown as { localStorage: LocalStorageMock }).localStorage = new LocalStorageMock();
}

function makeMockRevisionItem(overrides: Partial<RevisionItem> = {}): RevisionItem {
  return {
    id: "rev_test_item_1",
    problemId: 1,
    problemTitle: "Two Sum",
    platform: "leetcode",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Table"],
    repetitions: 1,
    intervalDays: 3,
    easeFactor: 2.5,
    memoryStrength: 80,
    successRate: 100,
    lastSolvedAt: "2026-08-20T00:00:00.000Z",
    nextDueDate: "2026-08-23",
    status: "upcoming",
    history: [],
    createdAt: "2026-08-20T00:00:00.000Z",
    ...overrides,
  };
}

describe("normalizeRevisionItemStatus -- Fix #3 regression", () => {
  const TODAY = "2026-09-01";

  test("Case 1: nextDueDate is yesterday (in the past) -> status becomes 'overdue'", () => {
    const item = makeMockRevisionItem({
      nextDueDate: "2026-08-31",
      status: "upcoming", // Stored as upcoming when originally scheduled
    });
    const normalized = normalizeRevisionItemStatus(item, TODAY);
    assert.strictEqual(normalized.status, "overdue");
  });

  test("Case 2: nextDueDate is today -> status becomes 'due'", () => {
    const item = makeMockRevisionItem({
      nextDueDate: "2026-09-01",
      status: "upcoming",
    });
    const normalized = normalizeRevisionItemStatus(item, TODAY);
    assert.strictEqual(normalized.status, "due");
  });

  test("Case 3: nextDueDate is tomorrow (in the future) -> status becomes 'upcoming'", () => {
    const item = makeMockRevisionItem({
      nextDueDate: "2026-09-02",
      status: "due", // Stored as due previously, but now scheduled for tomorrow
    });
    const normalized = normalizeRevisionItemStatus(item, TODAY);
    assert.strictEqual(normalized.status, "upcoming");
  });

  test("Case 4: completed item remains 'completed' even when nextDueDate is in the past", () => {
    const item = makeMockRevisionItem({
      nextDueDate: "2026-08-01",
      status: "completed",
    });
    const normalized = normalizeRevisionItemStatus(item, TODAY);
    assert.strictEqual(normalized.status, "completed");
  });

  test("Case 5: skipped item remains 'skipped' even when nextDueDate is in the past", () => {
    const item = makeMockRevisionItem({
      nextDueDate: "2026-08-01",
      status: "skipped",
    });
    const normalized = normalizeRevisionItemStatus(item, TODAY);
    assert.strictEqual(normalized.status, "skipped");
  });

  test("Case 6: Audit scenario -- stored nextDueDate = '2026-08-01', stored status = 'upcoming', read on '2026-09-01' -> 'overdue'", () => {
    const item = makeMockRevisionItem({
      nextDueDate: "2026-08-01",
      status: "upcoming",
    });
    const normalized = normalizeRevisionItemStatus(item, "2026-09-01");
    assert.strictEqual(normalized.status, "overdue");
  });
});

describe("LocalStorageRevisionStorage.getItems -- Dynamic normalization on read", () => {
  test("getItems normalizes raw stored items relative to current date upon read", async () => {
    const storage = new LocalStorageRevisionStorage();

    // Store items directly with stale/static statuses
    const rawItems: RevisionItem[] = [
      makeMockRevisionItem({
        id: "rev_past_due",
        nextDueDate: "2020-01-01",
        status: "upcoming", // Stale status in storage
      }),
      makeMockRevisionItem({
        id: "rev_future",
        nextDueDate: "2099-12-31",
        status: "overdue", // Stale status in storage
      }),
      makeMockRevisionItem({
        id: "rev_done",
        nextDueDate: "2020-01-01",
        status: "completed",
      }),
    ];

    await storage.saveItems(rawItems);

    const loaded = await storage.getItems();

    const pastDue = loaded.find((i) => i.id === "rev_past_due");
    const future = loaded.find((i) => i.id === "rev_future");
    const done = loaded.find((i) => i.id === "rev_done");

    assert.strictEqual(pastDue?.status, "overdue", "Past item must be dynamically normalized to 'overdue'");
    assert.strictEqual(future?.status, "upcoming", "Future item must be dynamically normalized to 'upcoming'");
    assert.strictEqual(done?.status, "completed", "Completed item status must remain 'completed'");
  });
});
