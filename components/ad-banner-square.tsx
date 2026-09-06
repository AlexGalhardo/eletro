"use client";

import { useEffect, useRef } from "react";

export function AdBannerSquare() {
	const adRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const scriptConfig = document.createElement("script");
		scriptConfig.type = "text/javascript";
		scriptConfig.innerHTML = `
			atOptions = {
				'key': '9a4fff7d76a6cb0aa4fa980a58485d85',
				'format': 'iframe',
				'height': 250,
				'width': 300,
				'params': {}
			};
		`;

		const scriptInvoke = document.createElement("script");
		scriptInvoke.type = "text/javascript";
		scriptInvoke.src = "//haulsquirt.com/9a4fff7d76a6cb0aa4fa980a58485d85/invoke.js";

		if (adRef.current) {
			adRef.current.innerHTML = "";
			adRef.current.appendChild(scriptConfig);
			adRef.current.appendChild(scriptInvoke);
		}
	}, []);

	return <div ref={adRef} style={{ width: 300, height: 250 }} />;
}
