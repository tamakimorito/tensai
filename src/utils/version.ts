import changelog from '../../memory/changelog.md?raw';

// 見出し例: "## 2025/10/02 - v1.0.4"（空白揺れ許容）
const VERSION_RE = /^##\s*\d{4}\/\d{2}\/\d{2}\s*-\s*(v\d+\.\d+\.\d+)\s*$/gmi;

function extractFromChangelog(text: string): string | null {
  const norm = (text || '').replace(/\r\n/g, '\n');
  let m: RegExpExecArray | null, last: string | null = null;
  while ((m = VERSION_RE.exec(norm)) !== null) last = m[1];
  return last;
}

/** 優先度: 1) changelog → 2) env(VITE_APP_VERSION) → 3) 'v0.0.0' */
export function getAppVersion(): string {
  const fromMd = extractFromChangelog(changelog);
  if (fromMd) return fromMd;
  const envVal = (import.meta as any).env?.VITE_APP_VERSION;
  return envVal || 'v0.0.0';
}
