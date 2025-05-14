import { db, Suggestions, Geolocation } from "astro:db";
import type { APIContext } from "astro";
import { asc, eq } from "drizzle-orm";
import getFlagEmoji from "../../utils/emoji-flag";

export const config = {
	runtime: "edge",
};

function verifyMathAnswer(answer: string): boolean {
	const num = parseInt(answer, 10);
	return !isNaN(num) && num >= 0 && num <= 100;
}

export async function GET() {
	try {
		const suggestions = await db
			.select({
				track_title: Suggestions.track_title,
				artist_name: Suggestions.artist_name,
				album_name: Suggestions.album_name,
				link: Suggestions.link,
				cover_url: Suggestions.cover_url,
				geolocation: {
					flag: Geolocation.flag,
					city: Geolocation.city,
					country: Geolocation.country,
				},
			})
			.from(Suggestions)
			.leftJoin(Geolocation, eq(Suggestions.id, Geolocation.suggestion_id))
			.orderBy(asc(Suggestions.created_at));
		return new Response(JSON.stringify(suggestions), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (err) {
		console.error("GET /api/suggest error:", err);
		return new Response("Error fetching suggestions", { status: 500 });
	}
}

export async function POST({ request }: APIContext) {
	try {
		const data = await request.json();

		if (!data.captchaToken) {
			return new Response(JSON.stringify({ error: "Missing CAPTCHA answer" }), {
				status: 400,
			});
		}

		// Verify the math answer
		if (!verifyMathAnswer(data.captchaToken)) {
			console.error("Invalid math answer");
			return new Response(JSON.stringify({ error: "CAPTCHA failed" }), {
				status: 403,
			});
		}

		const insertedSuggestion = await db
			.insert(Suggestions)
			.values({
				id: Date.now(),
				track_id: data.track_id,
				track_title: data.track_title,
				artist_name: data.artist_name,
				album_name: data.album_name,
				cover_url: data.cover_url,
				link: data.link,
				created_at: new Date(),
			})
			.returning({ id: Suggestions.id });

		const { country, city, latitude, longitude } = (request as any).cf || {};

		if (country && city) {
			await db.insert(Geolocation).values({
				id: Date.now(),
				suggestion_id: insertedSuggestion[0].id,
				city: city,
				country: country,
				flag: getFlagEmoji(country),
				latitude: latitude ? latitude.toString() : null,
				longitude: longitude ? longitude.toString() : null,
				recorded_at: new Date(),
			});
		}

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error) {
		console.error("API Error:", error);
		return new Response(JSON.stringify({ error: "Server error" }), {
			status: 500,
		});
	}
}
