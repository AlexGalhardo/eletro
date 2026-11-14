import { ChartColumn, ExternalLink, FileText, Flag, Link2, Mail, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "#lib/admin-ui/ui/button.tsx";
import { Separator } from "#lib/admin-ui/ui/separator.tsx";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "#lib/admin-ui/ui/sidebar.tsx";
import { TooltipProvider } from "#lib/admin-ui/ui/tooltip.tsx";
import { toggleTheme } from "#lib/theme.ts";

export const ADMIN_NAV = [
	{ id: "products", label: "Produtos e links", href: "/admin/products", icon: Link2 },
	{ id: "posts", label: "Posts", href: "/admin/posts", icon: FileText },
	{ id: "metrics", label: "Métricas", href: "/admin/metrics", icon: ChartColumn },
	{ id: "flags", label: "Flags", href: "/admin/flags", icon: Flag },
	{ id: "newsletter", label: "Newsletter", href: "/admin/newsletter", icon: Mail },
] as const;

export type AdminSection = (typeof ADMIN_NAV)[number]["id"];

interface Props {
	current: AdminSection;
	siteName: string;
	logo: string;
	children?: ReactNode;
}

/** Vercel-style dashboard chrome: collapsible sidebar, top bar and the page content in the inset. */
export function AdminShell({ current, siteName, logo, children }: Props): ReactNode {
	const title = ADMIN_NAV.find((item) => item.id === current)?.label ?? "";
	return (
		<TooltipProvider>
			<SidebarProvider>
				<Sidebar collapsible="icon" aria-label="Navegação do painel">
					<SidebarHeader>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton size="lg" asChild tooltip={siteName}>
									<a href="/admin">
										<span
											aria-hidden="true"
											className="size-8 shrink-0 bg-foreground"
											style={{
												mask: `url(${logo}) center/contain no-repeat`,
												WebkitMask: `url(${logo}) center/contain no-repeat`,
											}}
										/>
										<span className="font-brand text-base font-bold">{siteName}</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupContent>
								<SidebarMenu>
									{ADMIN_NAV.map((item) => (
										<SidebarMenuItem key={item.id}>
											<SidebarMenuButton
												asChild
												isActive={item.id === current}
												tooltip={item.label}
											>
												<a
													href={item.href}
													aria-current={item.id === current ? "page" : undefined}
												>
													<item.icon />
													<span>{item.label}</span>
												</a>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
					<SidebarFooter>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild tooltip="Ver o site">
									<a href="/">
										<ExternalLink />
										<span>Ver o site</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
					<SidebarRail />
				</Sidebar>
				<SidebarInset>
					<header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
						<SidebarTrigger aria-label="Recolher ou expandir o menu" />
						<Separator orientation="vertical" className="mr-1 h-4" />
						<p className="text-sm font-semibold">{title}</p>
						<Button
							variant="ghost"
							size="icon"
							className="ml-auto"
							aria-label="Alternar tema"
							onClick={() => toggleTheme()}
						>
							<Sun className="hidden dark:block" />
							<Moon className="dark:hidden" />
						</Button>
					</header>
					<div className="min-w-0 flex-1">{children}</div>
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	);
}
