'use client';

interface ContentBlock {
  type: 'string' | 'array' | 'object';
  value: unknown;
}

interface ParsedBlock {
  type: 'heading' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'key-value-list';
  value: string | string[] | KeyValueItem[];
}

interface KeyValueItem {
  label: string;
  value: string;
}

function renderInlineFormatting(text: string) {
  const normalized = text.replace(/\\\*/g, '*').replace(/\\_/g, '_');
  const parts = normalized.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (
      (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'))
    ) {
      const value = part.slice(2, -2).trim();
      return (
        <strong key={`${value}-${index}`} className="font-semibold text-foreground">
          {value}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function normalizeContent(content: unknown): ContentBlock {
  if (typeof content === 'string') {
    return { type: 'string', value: content };
  }
  if (Array.isArray(content)) {
    return { type: 'array', value: content };
  }
  if (typeof content === 'object' && content !== null) {
    return { type: 'object', value: content };
  }
  return { type: 'string', value: String(content) };
}

function isBulletLine(line: string) {
  return /^[-*]\s+/.test(line);
}

function isNumberedLine(line: string) {
  return /^\d+\.\s+/.test(line);
}

function cleanListLine(line: string) {
  return line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
}

function cleanHeadingLine(line: string) {
  return line.replace(/^#{1,6}\s+/, '').replace(/:$/, '').trim();
}

function parseKeyValueLine(line: string): KeyValueItem | null {
  const markdownMatch = line.match(/^\*\*([^*]+):\*\*\s*(.*)$/);
  if (markdownMatch) {
    return {
      label: markdownMatch[1].trim(),
      value: markdownMatch[2].trim(),
    };
  }

  const plainMatch = line.match(/^([A-Za-z][A-Za-z0-9/&(),\-\s]{1,48}):\s+(.+)$/);
  if (!plainMatch) {
    return null;
  }

  const label = plainMatch[1].trim();
  const value = plainMatch[2].trim();
  const wordCount = label.split(/\s+/).filter(Boolean).length;

  if (wordCount > 6) {
    return null;
  }

  return { label, value };
}

function isMostlyTitleCase(line: string) {
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 10) {
    return false;
  }

  const meaningfulWords = words.filter((word) => /[A-Za-z]/.test(word));
  if (meaningfulWords.length === 0) {
    return false;
  }

  const titleCaseWords = meaningfulWords.filter((word) => /^[A-Z][A-Za-z0-9/&-]*$/.test(word));
  return titleCaseWords.length / meaningfulWords.length >= 0.7;
}

function isHeadingLine(line: string) {
  const normalized = line.trim();
  if (!normalized || normalized.length > 90) {
    return false;
  }

  if (/^#{1,6}\s+/.test(normalized)) {
    return true;
  }

  if (/:$/.test(normalized)) {
    return true;
  }

  if (/[.!?]$/.test(normalized)) {
    return false;
  }

  return isMostlyTitleCase(normalized);
}

function parseStringBlocks(content: string): ParsedBlock[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ParsedBlock[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) {
      return;
    }

    blocks.push({
      type: 'paragraph',
      value: paragraphLines.join(' '),
    });
    paragraphLines = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    if (isHeadingLine(line)) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        value: cleanHeadingLine(line),
      });
      continue;
    }

    if (isBulletLine(line)) {
      flushParagraph();
      const items: string[] = [];
      let cursor = index;

      while (cursor < lines.length) {
        const current = lines[cursor].trim();
        if (!current) {
          break;
        }
        if (!isBulletLine(current)) {
          break;
        }
        items.push(cleanListLine(current));
        cursor += 1;
      }

      blocks.push({ type: 'bullet-list', value: items });
      index = cursor - 1;
      continue;
    }

    if (isNumberedLine(line)) {
      flushParagraph();
      const items: string[] = [];
      let cursor = index;

      while (cursor < lines.length) {
        const current = lines[cursor].trim();
        if (!current) {
          break;
        }
        if (!isNumberedLine(current)) {
          break;
        }
        items.push(cleanListLine(current));
        cursor += 1;
      }

      blocks.push({ type: 'numbered-list', value: items });
      index = cursor - 1;
      continue;
    }

    const keyValueItem = parseKeyValueLine(line);
    if (keyValueItem) {
      flushParagraph();
      const items: KeyValueItem[] = [];
      let cursor = index;

      while (cursor < lines.length) {
        const current = lines[cursor].trim();
        if (!current) {
          break;
        }
        const matchedItem = parseKeyValueLine(current);
        if (!matchedItem) {
          break;
        }
        items.push(matchedItem);
        cursor += 1;
      }

      blocks.push({ type: 'key-value-list', value: items });
      index = cursor - 1;
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  return blocks;
}

function renderArray(items: unknown[]) {
  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-6 shadow-sm">
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-4">
              <span className="mt-3 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
              <span className="text-base leading-8 text-foreground/95">
                {renderInlineFormatting(String(item))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function renderString(content: string) {
  const blocks = parseStringBlocks(content);

  if (blocks.length === 0) {
    return <p className="text-sm leading-7 text-muted-foreground">No content available.</p>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <div key={index} className="space-y-2 border-t border-border/60 pt-6 first:border-t-0 first:pt-0">
              <h3 className="font-space-grotesk text-[1.75rem] font-semibold tracking-tight text-foreground">
                {renderInlineFormatting(block.value as string)}
              </h3>
            </div>
          );
        }

        if (block.type === 'key-value-list') {
          return (
            <div
              key={index}
              className="grid gap-3 rounded-3xl border border-border/70 bg-muted/20 p-5 shadow-sm"
            >
              {(block.value as KeyValueItem[]).map((item, itemIndex) => (
                <div
                  key={`${item.label}-${itemIndex}`}
                  className="grid gap-1 border-b border-border/50 pb-3 last:border-b-0 last:pb-0 md:grid-cols-[180px_minmax(0,1fr)] md:gap-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </p>
                  <div className="text-base leading-7 text-foreground/95">
                    {item.value ? renderInlineFormatting(item.value) : <span className="text-muted-foreground">Not provided</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === 'bullet-list') {
          return (
            <div
              key={index}
              className="rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-6 shadow-sm"
            >
              <ul className="space-y-4">
                {(block.value as string[]).map((line, lineIndex) => (
                  <li key={lineIndex} className="flex items-start gap-4">
                    <span className="mt-3 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    <span className="text-base leading-8 text-foreground/95">
                      {renderInlineFormatting(line)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === 'numbered-list') {
          return (
            <div
              key={index}
              className="rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-6 shadow-sm"
            >
              <ol className="space-y-4">
                {(block.value as string[]).map((line, lineIndex) => (
                  <li key={lineIndex} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                      {lineIndex + 1}
                    </span>
                    <span className="pt-0.5 text-base leading-8 text-foreground/95">
                      {renderInlineFormatting(line)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        }

        return (
          <p
            key={index}
            className="text-[1.05rem] leading-8 text-foreground/95"
          >
            {renderInlineFormatting(block.value as string)}
          </p>
        );
      })}
    </div>
  );
}

export function StrategyContentRenderer({ content }: { content: unknown }) {
  const block = normalizeContent(content);

  if (block.type === 'string') {
    return renderString(String(block.value ?? ''));
  }

  if (block.type === 'array') {
    return renderArray(block.value as unknown[]);
  }

  if (block.type === 'object') {
    return (
      <div className="overflow-x-auto rounded-3xl border border-border/70 bg-muted/20 p-6 font-mono text-xs leading-6 shadow-sm">
        <pre>{JSON.stringify(block.value, null, 2)}</pre>
      </div>
    );
  }

  return null;
}
