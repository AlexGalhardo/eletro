"use client";

import { useEffect, useState } from "react";

export default function CookieBanner({ language }: { language?: string }) {
	const [showBanner, setShowBanner] = useState(false);
	const lang = (language ?? "pt").toLowerCase();

	useEffect(() => {
		const hasAcceptedCookies = getCookie("acceptCookiesIndicaFitness");
		if (!hasAcceptedCookies) {
			setShowBanner(true);
		}
	}, []);

	function acceptCookiesIndicaFitness() {
		setCookie("acceptCookiesIndicaFitness", "true", 30);
		setCookie("preferred_language", navigator.language || "pt-BR", 365);
		setCookie("theme", window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light", 365);
		setCookie("last_visit", new Date().toISOString(), 30);
		setCookie("cookie_consent", "true", 365);

		const sessionStart = Date.now();
		window.addEventListener("beforeunload", () => {
			const timeSpent = Math.floor((Date.now() - sessionStart) / 1000);
			setCookie("reading_time_seconds", String(timeSpent), 30);
		});

		setShowBanner(false);
		window.dispatchEvent(new Event("cookieAlertAccept"));
	}

	function setCookie(name: string, value: string, days: number) {
		const expires = new Date(Date.now() + days * 864e5).toUTCString();
		document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
	}

	function getCookie(name: string) {
		return document.cookie
			.split("; ")
			.find((row) => row.startsWith(`${name}=`))
			?.split("=")[1];
	}

	if (!showBanner) return null;

	const content = {
		en: {
			text: "We use cookies to enhance your experience on our site. Learn more at",
			link: "/privacy-policy",
			button: "OK",
			linkName: "Cookies and Privacy",
		},
		pt: {
			text: "Nós usamos cookies para melhorar sua experiência no site. Saiba mais em",
			link: "/politica-de-privacidade",
			button: "OK",
			linkName: "Cookies e Privacidade",
		},
		es: {
			text: "Usamos cookies para mejorar tu experiencia en el sitio. Más información en",
			link: "/es/privacy-policy",
			button: "OK",
			linkName: "Cookies y Privacidad",
		},
	};

	const { text, link, button, linkName } = content[lang as "en" | "pt" | "es"] || content.en;

	return (
		<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl px-4">
			<div className="bg-white text-black text-center p-4 shadow-lg rounded-xl border border-black flex flex-col md:flex-row items-center justify-between gap-4">
				<p className="text-sm font-medium">
					{text}{" "}
					<a href={link} className="underline text-black hover:text-green-500">
						{linkName}
					</a>
				</p>
				<button
					onClick={acceptCookiesIndicaFitness}
					className="bg-green-600 text-white text-sm px-4 py-2 rounded font-bold hover:bg-green-700 transition"
				>
					{button}
				</button>
			</div>
		</div>
	);
}
