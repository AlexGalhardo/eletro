import { Body, Container, Head, Heading, Html, Section, Text } from "@react-email/components";
import type { ContactMessage } from "../../contact.ts";
import { site } from "../../site.config.ts";

const text = { margin: "0 0 10px 0", fontSize: "16px" };

export function ContactEmail({ name, email, message }: ContactMessage) {
	return (
		<Html>
			<Head />
			<Body style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0 }}>
				<Container style={{ padding: "20px", maxWidth: "600px" }}>
					<Section style={{ marginBottom: "20px" }}>
						<Heading style={{ fontSize: "24px", lineHeight: "32px" }}>
							Contato {site.domain}
						</Heading>
					</Section>
					<Section style={{ marginBottom: "10px" }}>
						<Text style={text}>
							<strong>Nome:</strong> {name}
						</Text>
						<Text style={text}>
							<strong>Email:</strong> {email}
						</Text>
						<Text style={text}>
							<strong>Mensagem:</strong>
						</Text>
						<Text style={{ margin: "0", fontSize: "16px", whiteSpace: "pre-wrap" }}>
							{message}
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
