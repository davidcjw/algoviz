"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import type { CodeSnippet } from "@/lib/snippets";
import { cn } from "@/lib/utils";

const KEYWORDS = new Set([
  "def", "class", "return", "if", "elif", "else", "for", "while", "in", "not",
  "and", "or", "is", "import", "from", "as", "with", "try", "except", "finally",
  "raise", "yield", "lambda", "global", "nonlocal", "pass", "break", "continue",
  "del", "assert", "async", "await",
]);
const CONSTANTS = new Set(["True", "False", "None"]);
const BUILTINS = new Set([
  "print", "len", "range", "enumerate", "sum", "min", "max", "sorted", "set",
  "dict", "list", "tuple", "int", "str", "float", "bool", "abs", "map", "filter",
  "zip", "reversed", "any", "all", "isinstance", "super", "self", "cls",
]);

const COLOR = {
  comment: "text-[#6f7888] italic",
  string: "text-[#a3c585]",
  number: "text-[#d9a566]",
  keyword: "text-[#c8a2e0]",
  constant: "text-[#d9a566]",
  builtin: "text-[#7fb0d8]",
  name: "text-[#e6cd8a]",
  decorator: "text-[#c8a2e0]",
} as const;

// Pure, allocation-light Python tokenizer → React spans. No dangerouslySetInnerHTML,
// so it is XSS-safe and works under the site's strict CSP.
const TOKEN =
  /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|(?:[rbfRBF]{0,2})"(?:\\.|[^"\\\n])*"|(?:[rbfRBF]{0,2})'(?:\\.|[^'\\\n])*')|(\b\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?\b)|(@\w+)|([A-Za-z_]\w*)/g;

function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let prev = "";
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const [full, comment, str, num, decorator, ident] = m;
    let cls = "";
    if (comment) cls = COLOR.comment;
    else if (str) cls = COLOR.string;
    else if (num) cls = COLOR.number;
    else if (decorator) cls = COLOR.decorator;
    else if (ident) {
      if (KEYWORDS.has(ident)) cls = COLOR.keyword;
      else if (CONSTANTS.has(ident)) cls = COLOR.constant;
      else if (BUILTINS.has(ident)) cls = COLOR.builtin;
      else if (prev === "def" || prev === "class") cls = COLOR.name;
      else if (code[TOKEN.lastIndex] === "(") cls = COLOR.builtin;
    }
    out.push(cls ? <span key={key++} className={cls}>{full}</span> : full);
    if (ident) prev = ident;
    last = TOKEN.lastIndex;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CodeBlock({
  snippets,
  embedded = false,
}: {
  snippets: CodeSnippet[];
  /** Drop the outer border/rounding so it sits flush inside another framed surface. */
  embedded?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const snippet = snippets[Math.min(active, snippets.length - 1)];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden bg-[#13161d]",
        embedded
          ? "h-full"
          : "rounded-xl border border-[#262b36] shadow-[0_1px_2px_rgba(22,26,34,0.06)]",
      )}
    >
      {/* tab + chrome bar */}
      <div className="flex items-stretch justify-between gap-2 border-b border-[#262b36] bg-[#161a22]">
        <div className="flex min-w-0 flex-1 overflow-x-auto">
          {snippets.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "whitespace-nowrap border-b-2 px-3.5 py-2.5 font-mono text-2xs uppercase tracking-wider transition-colors",
                i === active
                  ? "border-ds-soft text-[#e7ebf2]"
                  : "border-transparent text-[#7a8392] hover:text-[#c4cad6]",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3">
          <span className="font-mono text-2xs uppercase tracking-wider text-[#5d6675]">python</span>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy code"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-2xs text-[#9aa2b1] transition-colors hover:bg-white/5 hover:text-[#e7ebf2]"
          >
            {copied ? <Check size={13} className="text-ds-soft" /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* code */}
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-[#c9d0dd]">{highlight(snippet.code)}</code>
      </pre>
    </div>
  );
}
