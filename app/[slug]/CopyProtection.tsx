"use client";

import { useEffect } from "react";

export default function CopyProtection() {
	useEffect(() => {
		const contentElement = document.getElementById("blog-content-protected");

		if (!contentElement) return;

		const preventCopy = (e: Event) => e.preventDefault();

		contentElement.addEventListener("copy", preventCopy);
		contentElement.addEventListener("cut", preventCopy);
		contentElement.addEventListener("contextmenu", preventCopy);
		contentElement.addEventListener("dragstart", preventCopy);

		return () => {
			contentElement.removeEventListener("copy", preventCopy);
			contentElement.removeEventListener("cut", preventCopy);
			contentElement.removeEventListener("contextmenu", preventCopy);
			contentElement.removeEventListener("dragstart", preventCopy);
		};
	}, []);

	return null;
}
