import type React from "react";

import { useState, useEffect } from "react";
import SearchBar from "./search-bar";
import SongCard from "./song-card";
import SuggestionModal from "./suggestion-modal";
import PreviousSuggestions from "./previous-suggestions";
import type { Song } from "../types/song";

export default function PublicPlaylist() {
	const [query, setQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [results, setResults] = useState<Song[]>([]);
	const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
	const [currentSong, setCurrentSong] = useState<Song | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(30);
	const [seekPositions, setSeekPositions] = useState<Map<number, number>>(
		new Map()
	);
	const [showModal, setShowModal] = useState(false);
	const [suggestedSong, setSuggestedSong] = useState<Song | null>(null);
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

	const searchSongs = async () => {
		if (!query) return;
		setIsLoading(true);
		try {
			const response = await fetch(`/api/search/${query}`);
			const songs: Song[] = await response.json();
			setResults(songs);
		} catch (error) {
			console.error("Search failed:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSuggestSong = (song: Song) => {
		setSuggestedSong(song);
		setShowModal(true);
	};

	const handleSuggestionSubmitted = async () => {
		const response = await fetch("/api/suggest");
		const suggestions = await response.json();
		setPreviousSuggestions(suggestions);

		setQuery("");
		setResults([]);

		closeModal();
	};

	const closeModal = () => {
		setShowModal(false);
		setSuggestedSong(null);
	};

	const playPreview = (song: Song) => {
		if (currentSong?.id === song.id && audio) {
			audio.paused ? audio.play() : audio.pause();
			return;
		}

		if (audio) {
			audio.pause();
			audio.removeAttribute("src");
			audio.load();
			if (currentSong) {
				setSeekPositions(
					(prev) => new Map(prev.set(currentSong.id, audio.currentTime))
				);
			}
		}

		const newAudio = new Audio(song.preview);
		const seekTime = seekPositions.get(song.id) || 0;
		newAudio.currentTime = seekTime;
		setAudio(newAudio);
		setCurrentSong(song);
		setCurrentTime(seekTime);

		newAudio.play();
		newAudio.addEventListener("loadedmetadata", () => {
			setDuration(newAudio.duration || 30);
		});
		newAudio.addEventListener("ended", () => {
			setCurrentTime(0);
			setCurrentSong(null);
			setAudio(null);
		});
	};

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (audio && currentSong) {
			const time = Number.parseFloat(e.target.value);
			audio.currentTime = time;
			setCurrentTime(time);
			setSeekPositions((prev) => {
				const updated = new Map(prev);
				updated.set(currentSong.id, time);
				return updated;
			});
		}
	};

	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;

		if (audio && currentSong) {
			intervalId = setInterval(() => {
				setCurrentTime(audio.currentTime);
				setSeekPositions((prev) => {
					const updated = new Map(prev);
					updated.set(currentSong.id, audio.currentTime);
					return updated;
				});
			}, 500);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [audio, currentSong]);

	const resetSearch = () => {
		setQuery("");
		setResults([]);
		setIsLoading(false);
		if (audio) {
			audio.pause();
			setAudio(null);
			setCurrentSong(null);
		}
	};

	return (
		<div className="min-h-screen bg-zinc-900 text-white flex flex-col">
			<div className="flex-grow max-w-3xl mx-auto p-6 w-full">
				<header className="mb-8 text-center">
					<a
						href="/"
						className="text-red-500 hover:text-red-400"
						onClick={(e) => {
							e.preventDefault();
							resetSearch();
						}}
					>
						<h1 className="text-4xl font-bold mb-2 text-red-500 flex items-center justify-center gap-2">
							<span className="text-3xl">🤘</span> Suggestify{" "}
							<span className="text-3xl">🔥</span>
						</h1>
					</a>

					<p className="text-red-400 italic">
						Discover and share the most brutal tunes
					</p>
				</header>
				<SearchBar
					query={query}
					setQuery={setQuery}
					searchSongs={searchSongs}
					isLoading={isLoading}
				/>

				{results.length > 0 && (
					<div className="space-y-4 mb-8">
						<h2 className="text-xl font-bold text-red-500 border-b border-red-500 pb-2 mb-4">
							Search Results
						</h2>
						{results.map((song) => (
							<SongCard
								key={song.id}
								song={song}
								isActive={currentSong?.id === song.id}
								currentTime={currentTime}
								duration={duration}
								songTime={seekPositions.get(song.id) || 0}
								onPlay={() => playPreview(song)}
								onSeek={handleSeek}
								onAdd={() => handleSuggestSong(song)}
								isPlaying={
									!!(currentSong?.id === song.id && audio && !audio.paused)
								}
							/>
						))}
					</div>
				)}

				<PreviousSuggestions
					suggestions={previousSuggestions.map((song) => ({
						track_title: song.title,
						artist_name: song.artist,
						album_name: song.album,
						...song,
					}))}
					isLoading={isSuggestionsLoading}
				/>

				{showModal && suggestedSong && (
					<SuggestionModal
						song={suggestedSong}
						onClose={closeModal}
						onSubmitted={handleSuggestionSubmitted}
					/>
				)}
			</div>

			<footer className="bg-zinc-800 py-4 mt-auto">
				<div className="max-w-3xl mx-auto px-6 flex justify-center space-x-6">
					<a
						href="https://pages.cloudflare.com/"
						target="_blank"
						className="text-gray-400 hover:text-white"
					>
						<svg
							className="h-6 w-6"
							role="img"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Cloudflare Pages</title>
							<path
								fill="#F38020"
								d="M10.715 14.32H5.442l-.64-1.203L13.673 0l1.397.579-1.752 9.112h5.24l.648 1.192L10.719 24l-1.412-.54ZM4.091 5.448a.5787.5787 0 1 1 0-1.1574.5787.5787 0 0 1 0 1.1574zm1.543 0a.5787.5787 0 1 1 0-1.1574.5787.5787 0 0 1 0 1.1574zm1.544 0a.5787.5787 0 1 1 0-1.1574.5787.5787 0 0 1 0 1.1574zm8.657-2.7h5.424l.772.771v16.975l-.772.772h-7.392l.374-.579h6.779l.432-.432V3.758l-.432-.432h-4.676l-.552 2.85h-.59l.529-2.877.108-.552ZM2.74 21.265l-.772-.772V3.518l.772-.771h7.677l-.386.579H2.98l-.432.432v16.496l.432.432h5.586l-.092.579zm1.157-1.93h3.28l-.116.58h-3.55l-.192-.193v-3.473l.578 1.158zm13.117 0 .579.58H14.7l.385-.58z"
							/>
						</svg>
					</a>

					<a
						href="https://astro.build/"
						target="_blank"
						className="text-gray-400 hover:text-white"
					>
						<svg
							className="h-6 w-6"
							role="img"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Astro</title>
							<path
								fill="#FFFFFF"
								d="M8.358 20.162c-1.186-1.07-1.532-3.316-1.038-4.944.856 1.026 2.043 1.352 3.272 1.535 1.897.283 3.76.177 5.522-.678.202-.098.388-.229.608-.36.166.473.209.95.151 1.437-.14 1.185-.738 2.1-1.688 2.794-.38.277-.782.525-1.175.787-1.205.804-1.531 1.747-1.078 3.119l.044.148a3.158 3.158 0 0 1-1.407-1.188 3.31 3.31 0 0 1-.544-1.815c-.004-.32-.004-.642-.048-.958-.106-.769-.472-1.113-1.161-1.133-.707-.02-1.267.411-1.415 1.09-.012.053-.028.104-.045.165h.002zm-5.961-4.445s3.24-1.575 6.49-1.575l2.451-7.565c.092-.366.36-.614.662-.614.302 0 .57.248.662.614l2.45 7.565c3.85 0 6.491 1.575 6.491 1.575L16.088.727C15.93.285 15.663 0 15.303 0H8.697c-.36 0-.615.285-.784.727l-5.516 14.99z"
							/>
						</svg>
					</a>

					<a
						href="https://www.deezer.com/us/"
						target="_blank"
						className="text-gray-400 hover:text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							viewBox="0 0 48 48"
							fill="none"
						>
							<title>Deezer</title>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M41.0955 7.32313C41.5396 4.74914 42.1912 3.13054 42.913 3.12744H42.9146C44.2606 3.13208 45.3517 8.7454 45.3517 15.6759C45.3517 22.6063 44.259 28.2243 42.9115 28.2243C42.3591 28.2243 41.8494 27.2704 41.4389 25.6719C40.7903 31.5233 39.4443 35.5459 37.8862 35.5459C36.6806 35.5459 35.5986 33.1296 34.8722 29.3188C34.3762 36.5662 33.1279 41.708 31.6689 41.708C30.7533 41.708 29.9185 39.6705 29.3005 36.3529C28.5573 43.2014 26.8405 48 24.8382 48C22.836 48 21.1162 43.2029 20.376 36.3529C19.7625 39.6705 18.9278 41.708 18.0075 41.708C16.5486 41.708 15.3033 36.5662 14.8043 29.3188C14.0779 33.1296 12.999 35.5459 11.7903 35.5459C10.2337 35.5459 8.88621 31.5249 8.23763 25.6719C7.83017 27.2751 7.31741 28.2243 6.76497 28.2243C5.41745 28.2243 4.32478 22.6063 4.32478 15.6759C4.32478 8.7454 5.41745 3.12744 6.76497 3.12744C7.48833 3.12744 8.13538 4.75068 8.58405 7.32313C9.30283 2.88473 10.4703 0 11.7903 0C13.3576 0 14.7158 4.07975 15.3583 10.0038C15.987 5.69216 16.9408 2.94348 18.0091 2.94348C19.5061 2.94348 20.7789 8.34964 21.2505 15.8908C22.1371 12.0243 23.4205 9.59876 24.8413 9.59876C26.2621 9.59876 27.5455 12.0259 28.4306 15.8908C28.9037 8.34964 30.1749 2.94348 31.672 2.94348C32.7387 2.94348 33.691 5.69216 34.3228 10.0038C34.9637 4.07975 36.3219 0 37.8892 0C39.2047 0 40.3767 2.88628 41.0955 7.32313ZM0.837891 14.4417C0.837891 11.3436 1.45748 8.83142 2.22204 8.83142C2.9866 8.83142 3.60619 11.3436 3.60619 14.4417C3.60619 17.5397 2.9866 20.0519 2.22204 20.0519C1.45748 20.0519 0.837891 17.5397 0.837891 14.4417ZM46.0693 14.4417C46.0693 11.3436 46.6888 8.83142 47.4534 8.83142C48.218 8.83142 48.8376 11.3436 48.8376 14.4417C48.8376 17.5397 48.218 20.0519 47.4534 20.0519C46.6888 20.0519 46.0693 17.5397 46.0693 14.4417Z"
								fill="#A238FF"
							/>
						</svg>
					</a>

					<a
						href="https://turso.tech/"
						target="_blank"
						className="text-gray-400 hover:text-white"
					>
						<svg
							className="h-6 w-6"
							role="img"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Turso</title>
							<path
								fill="#4FF8D2"
								d="m23.31.803-.563-.42-1.11 1.189-.891-1.286-.512.235.704 1.798-.326.35L18.082 0l-.574.284 2.25 4.836-2.108.741h-.05l-1.143-1.359-1.144 1.36H8.687l-1.144-1.36-1.146 1.363H6.36l-2.12-.745L6.491.284 5.919 0l-2.53 2.668-.327-.349.705-1.798-.512-.236-.89 1.287L1.253.382.69.804 2.42 3.69l-.89.939.311 2.375 2.061.787L3.9 8.817H1.947v.444l.755 1.078 1.197.433v6.971l3.057 4.55L7.657 24l1.101-1.606L9.9 24l.999-1.606L12 24l1.102-1.606L14.1 24l1.141-1.606L16.343 24l.701-1.706 3.058-4.55v-6.972l1.196-.433.756-1.078v-.444h-1.952l.003-1.03 2.054-.784.311-2.375-.89-.939zm-8.93 18.718H8.033l.793-1.615.794 1.615.793-1.083.793 1.083.794-1.083.793 1.083.794-1.083.793 1.083.793-1.615.794 1.615zm3.886-7.39-3.3 1.084-.143 3.061-2.827.627-2.826-.627-.142-3.06-3.3-1.085v-1.635l4.266 1.21-.052 4.126h4.109l-.052-4.127 4.266-1.209z"
							/>
						</svg>
					</a>
				</div>
				<div className="mt-2 text-center text-xs text-white">
					&copy; 2025 Suggestify, by:{" "}
					<a className="text-red-500" href="https://ahmetalmaz.com/">
						Ahmet ALMAZ
					</a>
					. All rights reserved.
				</div>
			</footer>
		</div>
	);
}
