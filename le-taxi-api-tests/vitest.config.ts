// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import { FlakyTestReporter } from "@villedemontreal/concurrent-api-tests";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.apiTestSuite.ts"],
    reporters: [new FlakyTestReporter() as any],
    testTimeout: 2 * 60 * 1000, // 2 min
    slowTestThreshold: 1 * 60 * 1000, // 1 min
    retry: 1,
    sequence: {
      concurrent: true,
    },
    maxConcurrency: 30,
    // single-threaded
    pool: "threads",
    maxWorkers: 1,
    // Avoid importing vitest in each test file
    globals: true,
  },
});
