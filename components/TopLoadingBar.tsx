"use client";

import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import { useEffect } from "react";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: true, trickleSpeed: 1000 });

export default function TopLoadingBar() {
	const pathname = usePathname();

	useEffect(() => {
		NProgress.start();
		NProgress.set(0.4); // optional pre-load step

		const timeout = setTimeout(() => {
			NProgress.done();
		}, 1000); // Adjust to simulate route loading

		return () => {
			clearTimeout(timeout);
			NProgress.done();
		};
	}, [pathname]);

	return null;
}
