"use client";

import { ThemeProvider } from "@/components/theme-provider";
import type React from "react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const root = document.documentElement;
		const theme = localStorage.getItem("theme-preference") || "light";

		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, []);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			enableSystem={false}
			storageKey="theme-preference"
			disableTransitionOnChange={false}
		>
			{children}
		</ThemeProvider>
	);
}
