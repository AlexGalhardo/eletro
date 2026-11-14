import { Body, Button, Container, Head, Heading, Html, Link, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { site } from "../../site.config.ts";

const text = { margin: "0 0 16px 0", fontSize: "16px", lineHeight: "24px" };
const small = { margin: "24px 0 0 0", fontSize: "13px", lineHeight: "20px", color: "#666666" };
const button = {
	backgroundColor: "#1a1917",
	color: "#ffffff",
	padding: "12px 20px",
	borderRadius: "8px",
	fontSize: "16px",
	fontWeight: "bold",
	textDecoration: "none",
};

function Layout({ title, children }: { title: string; children: ReactNode }) {
	return (
		<Html>
			<Head />
			<Body style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
				<Container style={{ padding: "20px", maxWidth: "600px" }}>
					<Heading style={{ fontSize: "24px", lineHeight: "32px" }}>{title}</Heading>
					{children}
				</Container>
			</Body>
		</Html>
	);
}

/** Double opt-in: nothing is sent to an address until its owner follows this link. */
export function ConfirmEmail({ url }: { url: string }) {
	return (
		<Layout title={`Confirme sua inscrição no ${site.name}`}>
			<Text style={text}>
				Recebemos um pedido para avisar este e-mail quando sair uma análise nova no {site.domain}.
			</Text>
			<Section style={{ margin: "24px 0" }}>
				<Button href={url} style={button}>
					Confirmar inscrição
				</Button>
			</Section>
			<Text style={small}>
				Se não foi você, ignore este e-mail: nada será enviado sem a confirmação.
			</Text>
		</Layout>
	);
}

type NewPostProps = { title: string; description: string; url: string; unsubscribeUrl: string };

export function NewPostEmail({ title, description, url, unsubscribeUrl }: NewPostProps) {
	return (
		<Layout title={title}>
			{description ? <Text style={text}>{description}</Text> : null}
			<Section style={{ margin: "24px 0" }}>
				<Button href={url} style={button}>
					Ler a análise
				</Button>
			</Section>
			<Text style={small}>
				Você recebe este e-mail porque se inscreveu em {site.domain}.{" "}
				<Link href={unsubscribeUrl}>Cancelar inscrição</Link>
			</Text>
		</Layout>
	);
}
