import type React from "react";
import { useState, useEffect } from "react";
import AllSuggestions from "../components/all-suggestions";
import type { Song } from "../types/song";

export default function Suggestions() {
	const [previousSuggestions, setPreviousSuggestions] = useState<Song[]>([]);
	const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(true);

	useEffect(() => {
		const fetchPreviousSuggestions = async () => {
			try {
				const response = await fetch("/api/suggest");

				if (!response.ok) {
					console.warn("API returned an error status:", response.status);
					return;
				}

				const contentType = response.headers.get("content-type");
				if (!contentType || !contentType.includes("application/json")) {
					console.warn("API did not return JSON, got:", contentType);
					return;
				}

				const suggestions = await response.json();
				setPreviousSuggestions(suggestions);
			} catch (error) {
				console.error("Failed to fetch previous suggestions:", error);
			} finally {
				setIsSuggestionsLoading(false);
			}
		};
		fetchPreviousSuggestions();
	}, []);

	return (
		<div className="min-h-screen bg-zinc-900 text-white flex flex-col">
			<div className="flex-grow max-w-3xl mx-auto p-6 w-full">
				<header className="mb-8 text-center">
					<a href="/" className="text-red-500 hover:text-red-400">
						<h1 className="text-4xl font-bold mb-2 text-red-500 flex items-center justify-center gap-2">
							<span className="text-3xl">🤘</span> Suggestify{" "}
							<span className="text-3xl">🔥</span>
						</h1>
					</a>

					<p className="text-red-400 italic">
						Discover and share the most brutal tunes
					</p>
				</header>

				<AllSuggestions
					suggestions={previousSuggestions.map((song) => ({
						track_title: song.title,
						artist_name: song.artist,
						album_name: song.album,
						...song,
					}))}
					isLoading={isSuggestionsLoading}
				/>
			</div>
		</div>
	);
}
