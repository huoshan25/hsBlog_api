export interface DialogueSegment {
  speaker: 'host' | 'guest';
  content: string;
}

export class DialogueParser {
  static parse(text: string): DialogueSegment[] {
    const segments: DialogueSegment[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.trim() === '') continue;

      if (line.startsWith('小丽：')) {
        segments.push({
          speaker: 'host',
          content: line.replace('小丽：', '').trim()
        });
      } else if (line.startsWith('李教授：')) {
        segments.push({
          speaker: 'guest',
          content: line.replace('李教授：', '').trim()
        });
      }
    }

    return segments;
  }
}