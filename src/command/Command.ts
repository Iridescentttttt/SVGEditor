export type HistoryPolicy = "edit" | "reset" | "lock" | "none";

export interface Command {
  execute(): readonly string[];
  historyPolicy(): HistoryPolicy;
}
