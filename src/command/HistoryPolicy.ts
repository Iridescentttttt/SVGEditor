import type { Command } from "./Command.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export interface HistoryLedger {
  recordEdit(command: UndoableCommand): void;
  recordReset(): void;
  recordLock(): void;
}

/** 策略：一条命令成功后，历史栈采用哪一种效果。 */
export class HistoryPolicy {
  private constructor(private readonly run: (ledger: HistoryLedger, command: Command) => void) {}

  static readonly edit = new HistoryPolicy((ledger, command) => {
    ledger.recordEdit(command as UndoableCommand);
  });

  static readonly reset = new HistoryPolicy((ledger) => {
    ledger.recordReset();
  });

  static readonly lock = new HistoryPolicy((ledger) => {
    ledger.recordLock();
  });

  static readonly none = new HistoryPolicy(() => undefined);

  apply(ledger: HistoryLedger, command: Command): void {
    this.run(ledger, command);
  }
}
