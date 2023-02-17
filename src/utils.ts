export function getGuidForMicrophoneLine(line: string): string | null {
  const match = line.match(/{[a-zA-Z0-9-]+}/);
  return match ? match[0].toUpperCase() : null;
}
