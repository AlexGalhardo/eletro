import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "#lib/admin-ui/ui/badge.tsx";
import { Button } from "#lib/admin-ui/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#lib/admin-ui/ui/card.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#lib/admin-ui/ui/table.tsx";

const EVENT_PARAMS = [
	["product_id", "Id do produto no JSON da lista"],
	["post_slug", "Slug do review onde o clique aconteceu"],
	["store", "mercadolivre, shopee ou amazon"],
] as const;

interface Props {
	analyticsUrl: string;
}

export function MetricsPanel({ analyticsUrl }: Props): ReactNode {
	return (
		<div className="mx-auto grid max-w-4xl gap-6 p-4 sm:p-6">
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center gap-2">
						<CardTitle>Cliques de afiliado</CardTitle>
						<Badge variant="secondary">evento GA4: affiliate_click</Badge>
					</div>
					<CardDescription>
						Cada clique em um botão ou link de oferta envia o evento <code>affiliate_click</code>{" "}
						ao Google Analytics, com os parâmetros abaixo.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Parâmetro</TableHead>
								<TableHead>Conteúdo</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{EVENT_PARAMS.map(([name, description]) => (
								<TableRow key={name}>
									<TableCell>
										<code>{name}</code>
									</TableCell>
									<TableCell>{description}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<Button asChild className="w-fit">
						<a href={analyticsUrl} target="_blank" rel="noopener noreferrer">
							Abrir o relatório no Google Analytics
							<ExternalLink />
							<span className="sr-only"> (abre em nova aba)</span>
						</a>
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Por que o top de links e posts não aparece aqui</CardTitle>
					<CardDescription>
						Este painel é um site estático: roda só no navegador, sem backend.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 text-sm text-muted-foreground">
					<p>
						A API de dados do GA4 só responde a uma conta de serviço do Google, e a chave privada
						dela não pode ficar num site estático nem no navegador. Por isso o ranking fica no
						relatório do próprio Google Analytics, e a integração do servidor (
						<code>docs/google-console-analytics-setup.md</code>) só roda em um deploy com backend.
					</p>
					<p>Para ver o top de links e posts no GA4:</p>
					<ol className="list-decimal space-y-1 pl-5">
						<li>
							Em Administrador, Definições personalizadas, cadastre <code>product_id</code>,{" "}
							<code>post_slug</code> e <code>store</code> como dimensões personalizadas de
							escopo do evento.
						</li>
						<li>
							Em Explorar, crie uma tabela livre com o evento <code>affiliate_click</code>, a
							contagem de eventos e as três dimensões.
						</li>
					</ol>
					<p>As dimensões só valem para os cliques enviados depois de cadastradas.</p>
				</CardContent>
			</Card>
		</div>
	);
}
