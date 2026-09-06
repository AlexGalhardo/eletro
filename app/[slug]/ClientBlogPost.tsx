"use client";

import { useEffect, useRef } from "react";

export default function ClientBlogPost() {
	const scrollBarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
			const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
			const scrolled = (winScroll / height) * 100;

			if (scrollBarRef.current) {
				scrollBarRef.current.style.width = `${scrolled}%`;
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className="fixed top-0 left-0 w-full h-1 z-60 bg-transparent pointer-events-none">
			<div
				ref={scrollBarRef}
				id="scroll_bar"
				className="h-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-75 ease-linear"
			/>
		</div>
	);
}
