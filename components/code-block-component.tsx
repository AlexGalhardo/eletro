"use client";

import { ClipboardCopy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function CodeBlockComponent({ code, language = "javascript" }: { code?: string; language?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(code as string);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative">
			<button
				onClick={handleCopy}
				className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded"
			>
				{copied ? "Copied!" : <ClipboardCopy size={14} />}
			</button>
			<SyntaxHighlighter language={language} style={oneDark}>
				{code ?? ""}
			</SyntaxHighlighter>
		</div>
	);
}
