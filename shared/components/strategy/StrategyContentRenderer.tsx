'use client';

interface ContentBlock {
  type: 'string' | 'array' | 'object';
  value: any;
}

function normalizeContent(content: any): ContentBlock {
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

export function StrategyContentRenderer({ content }: { content: any }) {
  const block = normalizeContent(content);

  if (block.type === 'string') {
    return (
      <p className="text-sm leading-relaxed text-foreground">
        {block.value}
      </p>
    );
  }

  if (block.type === 'array') {
    return (
      <ul className="space-y-2">
        {block.value.map((item: any, idx: number) => (
          <li key={idx} className="flex gap-3 text-sm text-foreground">
            <span className="text-primary mt-1 flex-shrink-0">•</span>
            <span>{String(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'object') {
    return (
      <div className="bg-muted/30 rounded border border-border p-4 font-mono text-xs overflow-x-auto">
        <pre>{JSON.stringify(block.value, null, 2)}</pre>
      </div>
    );
  }

  return null;
}
