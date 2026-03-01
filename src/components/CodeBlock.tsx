import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'hcl' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="absolute right-4 top-4 z-10">
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-white/70 hover:text-white"
          title="Copy code"
        >
          {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          background: '#0a0a0a',
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
