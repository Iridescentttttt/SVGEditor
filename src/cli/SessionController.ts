export interface SessionController {
  executeLine(line: string): readonly string[];
}
