import { EditorError } from "./EditorError.js";

export class DecimalText {
  static parse(token: string): number {
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(token)) {
      throw new EditorError(`error: invalid number: ${token}`);
    }
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new EditorError(`error: invalid number: ${token}`);
    }
    return value;
  }

  static format(value: number): string {
    if (!Number.isFinite(value)) {
      return "NaN";
    }
    const nearest = Math.round(value);
    if (Math.abs(value - nearest) <= 1e-9) {
      return String(nearest);
    }
    return value
      .toFixed(6)
      .replace(/(\.\d*?)0+$/, "$1")
      .replace(/\.$/, "");
  }

  static pair(x: number, y: number): string {
    return `(${DecimalText.format(x)},${DecimalText.format(y)})`;
  }
}
