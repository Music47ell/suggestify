import type React from "react";

import type { Song } from "../types/song";

interface SongCardProps {
	song: Song;
	isActive: boolean;
	currentTime: number;
	duration: number;
	songTime: number;
	onPlay: () => void;
	onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onAdd: () => void;
	isPlaying: boolean;
}

export default function SongCard({
	song,
	isActive,
	currentTime,
	duration,
	songTime,
	onPlay,
	onSeek,
	onAdd,
	isPlaying,
}: SongCardProps) {
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<div className="bg-zinc-800 rounded-lg overflow-hidden border border-red-500/50 hover:border-red-500 transition-all">
			<div className="p-4 flex flex-col gap-3">
				<div className="flex items-center gap-4">
					<div className="relative min-w-16 h-16 overflow-hidden rounded-md">
						<img
							src={`https://wsrv.nl/?url=${song.cover}` || "/placeholder.svg"}
							alt={song.name}
							className="w-full h-full object-cover"
						/>
					</div>
					<div className="flex-1 min-w-0">
						<a
							href={song.link}
							target="_blank"
							rel="noopener noreferrer"
							className="font-bold text-red-400 hover:text-red-300 hover:underline truncate block"
						>
							{song.name}
						</a>
						<div className="text-sm text-red-300/80 truncate">
							{song.artist}
						</div>
						<div className="text-xs text-red-300/60 truncate">{song.album}</div>
					</div>
				</div>

				<div className="flex flex-col gap-1">
					<div className="relative w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
						<div
							className="absolute top-0 left-0 h-full bg-red-500 transition-all"
							style={{
								width: `${
									((isActive ? currentTime : songTime) /
										(isActive ? duration : 30)) *
									100
								}%`,
							}}
						/>
						<input
							type="range"
							min="0"
							max={isActive ? duration : 30}
							step="0.1"
							value={isActive ? currentTime : songTime}
							onChange={isActive ? onSeek : undefined}
							disabled={!isActive}
							className={`absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer ${
								!isActive ? "pointer-events-none" : ""
							}`}
						/>
					</div>
					<div className="flex justify-between text-xs text-red-400/70">
						<span>{formatTime(isActive ? currentTime : songTime)}</span>
						<span>{formatTime(isActive ? duration : 30)}</span>
					</div>
				</div>

				<div className="flex justify-between items-center">
					<button
						type="button"
						onClick={onPlay}
						className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
					>
						{isPlaying ? "Pause" : "Play"}
					</button>
					<button
						type="button"
						onClick={onAdd}
						className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
					>
						Suggest
					</button>
				</div>
			</div>
		</div>
	);
}
