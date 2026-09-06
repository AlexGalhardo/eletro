"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
	width?: number;
	height?: number;
	className?: string;
	centered?: boolean;
}

declare global {
	interface Window {
		atOptions?: any;
	}
}

export default function AdBannerHorizontal({
	width = 728,
	height = 90,
	className = "",
	centered = false,
}: AdBannerProps) {
	const adRef = useRef<HTMLDivElement>(null);
	const scriptLoadedRef = useRef(false);

	useEffect(() => {
		if (!scriptLoadedRef.current) {
			window.atOptions = {
				key: "4513acf0391bd68b299106f302eff1a9",
				format: "iframe",
				height: height,
				width: width,
				params: {},
			};

			const script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "//haulsquirt.com/4513acf0391bd68b299106f302eff1a9/invoke.js";
			script.async = true;

			if (adRef.current) {
				adRef.current.innerHTML = ""; // limpa antes de inserir
				adRef.current.appendChild(script);
			}

			scriptLoadedRef.current = true;
		}

		return () => {
			if (adRef.current) {
				adRef.current.innerHTML = ""; // remove qualquer conteúdo injetado
			}
		};
	}, [width, height]);

	const containerClasses = `
		${className}
		${centered ? "flex justify-center" : ""}
	`.trim();

	return <div ref={adRef} className={containerClasses} style={{ minWidth: width, minHeight: height }} />;
}
