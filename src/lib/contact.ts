import { z } from "zod";

/** Shared by the contact form (client) and the contact endpoint (server). */
export const contactSchema = z.object({
	name: z.string().trim().min(1).max(64),
	email: z.email().max(128),
	message: z.string().trim().min(32).max(2048),
});

export type ContactMessage = z.infer<typeof contactSchema>;
