"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import Footer from "@/components/footer";
import { BlogPost } from "@/lib/blog";
import BlogPostHeader from "@/components/blog-post-header";

export default function ContatoClient({ allPosts }: { allPosts: BlogPost[] }) {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
	});
	const [errors, setErrors] = useState({
		name: false,
		email: false,
		message: false,
	});
	const [loading, setLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (statusTimeoutRef.current) {
				clearTimeout(statusTimeoutRef.current);
			}
		};
	}, []);

	const showStatusMessage = (type: "success" | "error", text: string) => {
		if (statusTimeoutRef.current) {
			clearTimeout(statusTimeoutRef.current);
		}
		setStatusMessage({ type, text });
		statusTimeoutRef.current = setTimeout(() => {
			setStatusMessage(null);
		}, 10000);
	};

	const validateForm = () => {
		const newErrors = {
			name: formData.name.trim() === "",
			email: !formData.email.includes("@") || !formData.email.includes("."),
			message: formData.message.length < 32,
		};

		setErrors(newErrors);
		return !Object.values(newErrors).some(Boolean);
	};

	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);

		try {
			const response = await fetch("/api/send-contact-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const res = await response.json();

			if (res.success) {
				showStatusMessage("success", "Mensagem enviada com sucesso!");
			} else {
				showStatusMessage("error", "Erro ao enviar mensagem. Tente novamente mais tarde.");
			}
		} catch (_error: any) {
			showStatusMessage("error", "Erro ao enviar mensagem. Tente novamente mais tarde.");
		} finally {
			setFormData({
				name: "",
				email: "",
				message: "",
			});
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const inputClasses = (hasError: boolean) =>
		`w-full rounded-lg px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-900 border text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${
			hasError ? "border-red-500" : "border-gray-300 dark:border-zinc-700 focus:border-blue-500"
		}`;

	return (
		<>
			<BlogPostHeader allPosts={allPosts} />

			<main className="px-4 mx-auto max-w-xl py-12 text-black dark:text-white">
				<div className="">
					<h1 className="text-4xl font-bold mb-8 text-black dark:text-white text-center">
						Tem uma pergunta? <br />
						Encontrou algum problema? <br />
					</h1>
					<p className="text-xl text-black mb-8 text-center dark:text-white">
						Preencha o formulário abaixo e nos envie uma mensagem.
					</p>

					<div className="dark:bg-black border-gray-300">
						<div>
							<form onSubmit={handleSubmit} className="space-y-6 mx-auto max-w-2xl">
								<div className="space-y-2">
									<label
										htmlFor="name"
										className="block text-sm font-semibold text-black dark:text-white"
									>
										Seu nome
									</label>
									<input
										id="name"
										minLength={4}
										maxLength={16}
										name="name"
										placeholder="Seu nome"
										value={formData.name}
										onChange={handleChange}
										className={inputClasses(errors.name)}
									/>
									{errors.name && <p className="text-red-500 text-sm">Nome é obrigatório</p>}
								</div>

								<div className="space-y-2">
									<label
										htmlFor="email"
										className="block text-sm font-semibold text-black dark:text-white"
									>
										Seu email
									</label>
									<input
										id="email"
										name="email"
										type="email"
										minLength={12}
										maxLength={48}
										placeholder="seuemail@email.com"
										value={formData.email}
										onChange={handleChange}
										className={inputClasses(errors.email)}
									/>
									{errors.email && <p className="text-red-500 text-sm">Email inválido</p>}
								</div>

								<div className="space-y-2">
									<label
										htmlFor="message"
										className="block text-sm font-semibold text-black dark:text-white"
									>
										Mensagem
									</label>
									<textarea
										id="message"
										name="message"
										placeholder="Digite sua mensagem"
										rows={6}
										minLength={32}
										maxLength={1024}
										value={formData.message}
										onChange={handleChange}
										className={inputClasses(errors.message)}
									/>
									{errors.message && (
										<p className="text-red-500 text-sm">
											A mensagem deve ter pelo menos 64 caracteres
										</p>
									)}
								</div>

								<button
									type="submit"
									disabled={loading}
									className="w-full rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 transition-colors"
								>
									{loading ? "Enviando..." : "Enviar Mensagem"}
								</button>

								{statusMessage && (
									<div
										className={`w-full rounded-md border px-4 py-3 text-sm text-center ${
											statusMessage.type === "success"
												? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
												: "bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-400"
										}`}
									>
										{statusMessage.text}
									</div>
								)}
							</form>
						</div>
					</div>
				</div>
			</main>

			<Footer />
		</>
	);
}
