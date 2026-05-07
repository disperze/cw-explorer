export function trunc(addr: string, start = 10, end = 6): string {
  if (!addr) return '';
  if (addr.length <= start + end) return addr;
  return `${addr.slice(0, start)}…${addr.slice(-end)}`;
}

export function syntaxHighlight(json: unknown): string {
  const str = typeof json !== 'string' ? JSON.stringify(json, null, 2) : json;
  return str.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-num';
      if (/^"/.test(match)) { cls = /:$/.test(match) ? 'json-key' : 'json-str'; }
      else if (/true|false/.test(match)) { cls = 'json-bool'; }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
