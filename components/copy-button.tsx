"use client";

import { FaCopy, FaCheck } from "react-icons/fa6";
import { useEffect, useState, useRef } from "react";

declare global {
	interface Window {
		ClipboardJS: any;
	}
}

interface CopyButtonProps {
	url: string;
	title?: string;
}

export default function CopyButton({ url, title = "Copiar link" }: CopyButtonProps) {
	const [mounted, setMounted] = useState(false);
	const [copied, setCopied] = useState<"success" | "error" | null>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	const showFeedback = (status: "success" | "error") => {
		setCopied(status);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setCopied(null), 2000);
	};

	useEffect(() => {
		if (mounted && buttonRef.current) {
			const loadClipboard = async () => {
				if (typeof window !== "undefined" && !window.ClipboardJS) {
					const script = document.createElement("script");
					script.src = "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js";
					script.onload = () => initClipboard();
					document.head.appendChild(script);
				} else {
					initClipboard();
				}
			};

			const initClipboard = () => {
				const ClipboardJS = window.ClipboardJS || (window as any).ClipboardJS;
				if (ClipboardJS && buttonRef.current) {
					const clipboard = new ClipboardJS(buttonRef.current, {
						text: () => url,
					});

					clipboard.on("success", () => showFeedback("success"));
					clipboard.on("error", () => showFeedback("error"));

					return () => {
						clipboard.destroy();
					};
				}
			};

			loadClipboard();
		}
	}, [mounted, url]);

	if (!mounted) {
		return null;
	}

	return (
		<div className="relative inline-flex">
			<button
				ref={buttonRef}
				className="bg-gray-600 hover:bg-gray-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
				title={title}
			>
				{copied === "success" ? <FaCheck /> : <FaCopy />}
			</button>

			{copied && (
				<span
					className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium px-2 py-1 rounded-md text-white ${
						copied === "success" ? "bg-green-600" : "bg-red-600"
					}`}
				>
					{copied === "success" ? "Link copiado!" : "Erro ao copiar"}
				</span>
			)}
		</div>
	);
}
