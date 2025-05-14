import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
	try {
		const query = params.track;

		if (!query) {
			return new Response(
				JSON.stringify({ error: "Query parameter is required" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const apiResponse = await fetch(
			`https://api.deezer.com/search/track?q=${encodeURIComponent(query)}`
		);
		const data = await apiResponse.json();

		const tracks =
			data.data
				?.slice(0, 10)
				.map(
					(track: {
						id: number;
						title: string;
						artist: { name: string; picture_xl: string };
						album: { title: string; cover_xl: string };
						link: string;
						preview: string;
					}) => ({
						id: track.id,
						name: track.title,
						artist: track.artist?.name || "Unknown Artist",
						album: track.album?.title || "Unknown Album",
						link: track.link,
						preview: track.preview,
						cover: track.album?.cover_xl || track.artist?.picture_xl,
					})
				) || [];

		return new Response(JSON.stringify(tracks), {
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error processing request:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
};
