import type { Restorable } from "./Restorable.js";

/** 备忘录：一次编辑前的图形状态。命令只能调用 restore，不能读取字段。 */
export class ShapeMemento implements Restorable {
  constructor(private readonly apply: () => void) {}

  restore(): readonly string[] {
    this.apply();
    return [];
  }
}
