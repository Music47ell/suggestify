interface Suggestion {
	track_title: string;
	artist_name: string;
	album_name: string;
	link: string;
	cover_url?: string;
	geolocation?: {
		flag: string;
		city: string;
		country: string;
	};
}

interface AllSuggestionsProps {
	suggestions: Suggestion[] | undefined;
	isLoading: boolean;
}

export const Spinner = () => (
	<div className="animate-spin border-t-2 border-red-500 border-solid rounded-full w-12 h-12 mx-auto" />
);

export default function AllSuggestions({
	suggestions = [],
	isLoading,
}: AllSuggestionsProps) {
	const suggestionArray = Array.isArray(suggestions)
		? suggestions.reverse()
		: [];

	return (
		<div className="bg-zinc-800 rounded-lg border border-red-500/50 p-5">
			<h2 className="text-xl font-bold mb-4 text-red-500 flex items-center gap-2">
				All Suggestions
			</h2>

			{isLoading ? (
				<div className="text-center py-8">
					<Spinner />
				</div>
			) : suggestionArray.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-red-400/70 italic">
						No suggestions yet. Be the first to suggest a track!
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{suggestionArray.map((song, idx) => (
						<div
							key={`${idx}-${song.track_title}-${song.artist_name}`}
							className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-red-500/20 pb-3"
						>
							<div className="flex items-start flex-1 w-full">
								<img
									src={
										`https://wsrv.nl/?url=${song.cover_url}` ||
										"/placeholder.svg"
									}
									alt={song.track_title}
									className="w-16 h-16 rounded-md object-cover mr-3 flex-shrink-0 self-center"
								/>
								<div className="flex-1 min-w-0">
									<a
										href={song.link}
										target="_blank"
										rel="noopener noreferrer"
										className="font-medium text-red-400 hover:text-red-300 hover:underline flex items-start gap-1 break-words"
									>
										{song.track_title}
									</a>
									<div className="text-sm text-red-300/70 break-words">
										{song.artist_name}
									</div>
									<div className="text-sm text-red-300/70 break-words">
										{song.album_name}
									</div>
									{song.geolocation && (
										<div className="flex items-center gap-2 text-sm text-red-300/70 break-words">
											{song.geolocation.flag && (
												<span>{song.geolocation.flag}</span>
											)}
											{song.geolocation.city && song.geolocation.country && (
												<span>
													{song.geolocation.city}, {song.geolocation.country}
												</span>
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
			<div className="text-center mt-4">
				<a href="/" className="text-red-400 hover:text-red-300 hover:underline">
					Go back
				</a>
			</div>
		</div>
	);
}
