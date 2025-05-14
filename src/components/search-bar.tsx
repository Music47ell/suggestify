interface SearchBarProps {
	query: string;
	setQuery: (query: string) => void;
	searchSongs: () => void;
	isLoading: boolean;
}

export default function SearchBar({
	query,
	setQuery,
	searchSongs,
	isLoading,
}: SearchBarProps) {
	return (
		<div className="relative mb-8">
			<div className="flex gap-2 bg-zinc-800 rounded-lg overflow-hidden border-2 border-red-500 focus-within:ring-2 focus-within:ring-red-400">
				<input
					type="text"
					placeholder="Search for brutal tunes..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && searchSongs()}
					className="flex-1 p-3 bg-transparent text-white placeholder-red-400/70 focus:outline-none"
				/>
				<button
					type="button"
					onClick={searchSongs}
					disabled={isLoading}
					className={`px-4 py-2 bg-red-500 text-white font-medium flex items-center gap-2 transition-colors
            ${
							isLoading
								? "opacity-70 cursor-not-allowed"
								: "hover:bg-red-600 cursor-pointer"
						}`}
				>
					{isLoading ? (
						<>
							<span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
							<span>Searching...</span>
						</>
					) : (
						<span>Search</span>
					)}
				</button>
			</div>
		</div>
	);
}
