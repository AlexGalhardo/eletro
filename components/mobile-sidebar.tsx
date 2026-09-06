"use client";

import { X, Newspaper, Home, Info, Mail, NewspaperIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface MobileSidebarProps {
	isOpen: boolean;
	onClose: () => void;
	onOpenRecent?: () => void;
}

const NAV_LINKS = [
	{ href: "/", label: "Início", icon: Home },
	{ href: "/sobre", label: "Sobre", icon: Info },
	{ href: "/contato", label: "Contato", icon: Mail },
	{ href: "/politica-de-privacidade", label: "Política de Privacidade", icon: Newspaper },
	{ href: "/termos-de-uso", label: "Termos de Uso", icon: NewspaperIcon },
];

export default function MobileSidebar({ isOpen, onClose, onOpenRecent }: MobileSidebarProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} aria-hidden="true" />

			<div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 z-[70] flex flex-col overflow-hidden shadow-2xl">
				<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
					<Link href="/" onClick={onClose} prefetch={false} className="flex items-center gap-2">
						<Image src="/logo.png" alt="Logo" width={32} height={32} priority quality={75} />
						<span className="font-russo-one uppercase text-sm text-black dark:text-white">
							Eletro Radar
						</span>
					</Link>
					<button
						type="button"
						onClick={onClose}
						aria-label="Fechar menu"
						className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<nav className="flex-1 p-4 space-y-1 overflow-y-auto">
					{NAV_LINKS.map((link) => {
						const Icon = link.icon;
						return (
							<Link
								key={link.href}
								href={link.href}
								onClick={onClose}
								prefetch={false}
								className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
							>
								<Icon className="h-5 w-5 text-blue-600 dark:text-blue-500" />
								{link.label}
							</Link>
						);
					})}
				</nav>
			</div>
		</>
	);
}
