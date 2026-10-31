import { readFileSync, writeFileSync } from "node:fs";
import { SessionHarness } from "../test/support/SessionHarness.js";

const script = readFileSync(new URL("./library.commands", import.meta.url), "utf8");
const session = new SessionHarness();
const transcript: string[] = ["svg-editor 0.1 — type 'help' for commands", ""];
for (const line of script.split("\n")) {
  if (line.trim().length === 0) continue;
  transcript.push(`svg> ${line}`);
  transcript.push(...session.run(line));
}
const svg = session.files.stored("examples/library.svg");
if (!svg) throw new Error("demo svg was not produced");
writeFileSync(new URL("./library.svg", import.meta.url), svg);
writeFileSync(new URL("./library-session.txt", import.meta.url), `${transcript.join("\n")}\n`);
console.log(`wrote library.svg (${svg.length} bytes) and library-session.txt`);
