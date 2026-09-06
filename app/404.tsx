"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
	const router = useRouter();

	useEffect(() => {
		router.push("/");
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
			<div className="text-center">
				<h1 className="text-4xl font-bold text-black dark:text-white mb-4">404</h1>
				<p className="text-black dark:text-white mb-4">Página Não Encontrada</p>
				<p className="text-sm text-gray-500 dark:text-white">Redirecionando...</p>
			</div>
		</div>
	);
}
