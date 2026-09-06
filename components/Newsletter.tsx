"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string("Email inválido");

export default function Newsletter() {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [isValidEmail, setIsValidEmail] = useState(false);

	const validateEmail = (value: string) => {
		try {
			emailSchema.parse(value);
			setIsValidEmail(true);
		} catch {
			setIsValidEmail(false);
		}
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setEmail(value);
		validateEmail(value);
	};

	const handleSubmit = async () => {
		try {
			emailSchema.parse(email);
			setStatus("loading");

			const response = await fetch("/api/newsletter/subscribe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			if (!response.ok) {
				throw new Error("Erro ao inscrever");
			}

			setStatus("success");
			setEmail("");
			setIsValidEmail(false);
		} catch (error) {
			console.error("Erro:", error);
			setStatus("error");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && isValidEmail) {
			handleSubmit();
		}
	};

	if (status === "success") {
		return (
			<div className="w-full max-w-5xl mx-auto my-8 p-8 bg-linear-to-r from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
				<div className="flex flex-col items-center justify-center text-center gap-3">
					<div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
						<Mail className="w-8 h-8 text-white" />
					</div>
					<p className="text-xl md:text-2xl text-blue-700 dark:text-blue-400 font-bold">Quase lá! 📧</p>
					<p className="font-bold text-base md:text-lg text-blue-600 dark:text-blue-500">
						Enviamos um email de confirmação. Verifique sua caixa de entrada!
					</p>
					<p className="font-bold text-blue-600 dark:text-blue-500">
						Não esqueça de verificar a pasta de spam 😉
					</p>
				</div>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="w-full max-w-5xl mx-auto my-8 p-8 bg-linear-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 rounded-lg border border-red-200 dark:border-red-800 shadow-sm">
				<div className="flex flex-col items-center justify-center text-center gap-3">
					<div className="w-16 h-16 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center">
						<span className="text-3xl text-white">✕</span>
					</div>
					<p className="text-xl md:text-2xl text-red-700 dark:text-red-400 font-bold">Ops! Algo deu errado</p>
					<p className="text-base md:text-lg text-red-600 dark:text-red-500">
						Por favor, tente novamente mais tarde.
					</p>
					<button
						type="button"
						onClick={() => setStatus("idle")}
						className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-semibold rounded-md transition-all duration-200"
					>
						Tentar novamente
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full max-w-5xl mx-auto p-6 bg-linear-to-r from-blue-50 to-blue-50 dark:from-blue-950/20 dark:to-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm mt-6">
			<div className="flex flex-col gap-4">
				<div className="flex items-start gap-2 justify-center">
					<Mail className="w-6 h-6 text-blue-600 dark:text-blue-500 mt-0.5 shrink-0" />
					<p className="text-black dark:text-white font-bold text-center">
						Receba novas postagens direto no seu email
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-2">
					<input
						type="email"
						value={email}
						onChange={handleEmailChange}
						onKeyDown={handleKeyPress}
						placeholder="seu@email.com"
						disabled={status === "loading"}
						className="flex-1 px-4 py-2.5 rounded-md border border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-900 text-black dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					/>

					<button
						type="button"
						onClick={handleSubmit}
						disabled={status === "loading" || !isValidEmail}
						className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md whitespace-nowrap"
					>
						{status === "loading" ? "Enviando..." : "Eu Quero!"}
					</button>
				</div>
			</div>
		</div>
	);
}
