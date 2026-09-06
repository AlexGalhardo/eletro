import { ContactEmail } from "@/emails/contact-email";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	try {
		if (!process.env.RESEND_API_KEY) {
			console.error("[send-contact-email] RESEND_API_KEY não está definida no .env");
			return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
		}

		const body = await request.json();
		const { name, email, message } = body;

		console.log("[send-contact-email] Payload recebido:", { name, email, message });

		if (!name || !email || !message) {
			console.warn("[send-contact-email] Campos obrigatórios faltando");
			return NextResponse.json({ error: "All fields are required" }, { status: 400 });
		}

		const { data, error } = await resend.emails.send({
			from: "EletroRadar <onboarding@resend.dev>",
			to: ["aleexgvieira@gmail.com"],
			replyTo: email,
			subject: `eletroradar Contato`,
			react: ContactEmail({ name, email, message }),
		});

		if (error) {
			console.error("[send-contact-email] Erro retornado pelo Resend:", error);
			return NextResponse.json({ error: "Error to send email" }, { status: 500 });
		}

		console.log("[send-contact-email] Email enviado com sucesso:", data);

		return NextResponse.json({ success: true, data });
	} catch (_error: any) {
		console.error("[send-contact-email] Exceção capturada:", _error);
		return NextResponse.json({ error: "Server Error" }, { status: 500 });
	}
}
