import { Line } from "./Line.js";
import { TokenError } from "./TokenError.js";

export class LineTokenizer {
  tokenize(line: string): Line {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) return Line.ignore();
    return Line.command(this.scan(trimmed));
  }

  private scan(input: string): string[] {
    const tokens: string[] = [];
    let index = 0;
    while (index < input.length) {
      if (/\s/.test(input[index])) {
        index += 1;
        continue;
      }
      if (input[index] === '"') {
        index += 1;
        let value = "";
        let closed = false;
        while (index < input.length) {
          if (input[index] === "\\") {
            if (index + 1 >= input.length) {
              throw new TokenError("error: unclosed quote");
            }
            value += input[index + 1];
            index += 2;
            continue;
          }
          if (input[index] === '"') {
            closed = true;
            index += 1;
            break;
          }
          value += input[index];
          index += 1;
        }
        if (!closed) throw new TokenError("error: unclosed quote");
        tokens.push(value);
        continue;
      }
      let value = "";
      while (index < input.length && !/\s/.test(input[index])) {
        value += input[index];
        index += 1;
      }
      tokens.push(value);
    }
    return tokens;
  }
}
