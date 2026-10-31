import type { HistoryPolicy } from "./HistoryPolicy.js";

export interface Command {
  execute(): readonly string[];
  historyPolicy(): HistoryPolicy;
}
