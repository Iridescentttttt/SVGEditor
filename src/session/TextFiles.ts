export interface TextFiles {
  read(path: string): string;
  write(path: string, content: string): void;
}
