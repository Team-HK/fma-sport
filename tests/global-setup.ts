import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const RUN_START_FILE = join(tmpdir(), "fma-sport-e2e-run-start");

export default function globalSetup() {
  writeFileSync(RUN_START_FILE, new Date().toISOString());
}
