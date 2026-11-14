import type { ReactNode } from "react";
import { Badge } from "#lib/admin-ui/ui/badge.tsx";
import { Button } from "#lib/admin-ui/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#lib/admin-ui/ui/card.tsx";
import { Input } from "#lib/admin-ui/ui/input.tsx";

/** Navigation placeholder: the real list and sending will come from the vukem-email integration. */
export function NewsletterPanel(): ReactNode {
	return (
		<div className="mx-auto grid max-w-4xl gap-6 p-4 sm:p-6">
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center gap-2">
						<CardTitle>Newsletter</CardTitle>
						<Badge variant="outline">Em breve</Badge>
					</div>
					<CardDescription>
						Inscritos e envios vão vir da integração com o vukem-email. Ainda não há nada para
						configurar aqui.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid max-w-sm gap-3">
					<label htmlFor="vukem-email-list" className="text-sm font-medium">
						Lista no vukem-email
					</label>
					<Input id="vukem-email-list" placeholder="Disponível com a integração" disabled />
					<Button disabled className="w-fit">
						Conectar ao vukem-email
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
