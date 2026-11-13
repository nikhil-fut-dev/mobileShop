import test from "node:test";
import assert from "node:assert/strict";

import { getBranchScope } from "../../shared/helpers/branchScope.js";

const branchA = "6af77431b121360c1ca26799";
const branchB = "6af77935f5d8c9be0e465adf";
const branchC = "6af77737f5d8c9be0e465add";

test("Owner can access all branches", () => {
  const result = getBranchScope({
    role: "owner",
    branchIds: [],
  });

  assert.deepEqual(result, {});
});

test("Owner can request a specific branch", () => {
  const result = getBranchScope({ role: "owner", branchIds: [] }, branchA);

  assert.equal(result.branchId.toString(), branchA);
});

test("Cashier can access assigned branches", () => {
  const result = getBranchScope({
    role: "cashier",
    branchIds: [branchA, branchB],
  });

  assert.deepEqual(
    result.branchId.$in.map((id) => id.toString()),
    [branchA, branchB],
  );
});

test("Admin can access assigned branches", () => {
  const result = getBranchScope({
    role: "admin",
    branchIds: [branchA],
  });

  assert.deepEqual(
    result.branchId.$in.map((id) => id.toString()),
    [branchA],
  );
});

test("Staff can access an assigned specific branch", () => {
  const result = getBranchScope(
    {
      role: "cashier",
      branchIds: [branchA, branchB],
    },
    branchB,
  );

  assert.equal(result.branchId.toString(), branchB);
});

test("Staff cannot access an unassigned branch", () => {
  assert.throws(
    () =>
      getBranchScope(
        {
          role: "cashier",
          branchIds: [branchA, branchB],
        },
        branchC,
      ),
    { statusCode: 403 },
  );
});

test("Staff without assigned branches cannot access data", () => {
  assert.throws(
    () =>
      getBranchScope({
        role: "cashier",
        branchIds: [],
      }),
    { statusCode: 403 },
  );
});

test("Invalid branch ID is rejected", () => {
  assert.throws(
    () =>
      getBranchScope(
        {
          role: "cashier",
          branchIds: [branchA],
        },
        "invalid-id",
      ),
    { statusCode: 400 },
  );
});

test("Missing user is rejected", () => {
  assert.throws(() => getBranchScope(null), { statusCode: 401 });
});
