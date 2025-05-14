import type React from "react";
import { useState } from "react";
import type { Song } from "../types/song";

interface SuggestionModalProps {
	song: Song;
	onClose: () => void;
	onSubmitted: () => void;
}

function generateMathProblem() {
	const num1 = Math.floor(Math.random() * 10) + 1;
	const num2 = Math.floor(Math.random() * 10) + 1;
	const operators = ["+"];
	const operator = operators[Math.floor(Math.random() * operators.length)];

	let result;
	switch (operator) {
		case "+":
			result = num1 + num2;
			break;
		default:
			result = num1 + num2;
	}

	return {
		text: `${num1} ${operator} ${num2} = ?`,
		answer: result.toString(),
	};
}

export default function SuggestionModal({
	song,
	onClose,
	onSubmitted,
}: SuggestionModalProps) {
	const [answer, setAnswer] = useState("");
	const [mathProblem, setMathProblem] = useState(generateMathProblem());
	const [error, setError] = useState("");

	const checkAnswer = () => {
		const correct = answer === mathProblem.answer;
		if (!correct) {
			setError("Incorrect answer. Please try again.");
			setMathProblem(generateMathProblem());
			setAnswer("");
		}
		return correct;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!checkAnswer()) {
			return;
		}

		try {
			const response = await fetch("/api/suggest", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					track_id: song.id,
					track_title: song.name,
					artist_name: song.artist,
					album_name: song.album,
					cover_url: song.cover,
					link: song.link,
					captchaToken: mathProblem.answer,
				}),
			});

			if (!response.ok) {
				throw new Error(`API returned status: ${response.status}`);
			}

			alert("Thanks for your suggestion!");
			onSubmitted();
		} catch (err) {
			console.error("Error submitting suggestion:", err);
			setError("Something went wrong. Please try again.");
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
			<div className="bg-zinc-800 rounded-lg w-full max-w-md border-2 border-red-500 shadow-lg shadow-red-500/20 overflow-hidden">
				<div className="flex justify-between items-center p-4 border-b border-red-500/30">
					<h2 className="text-xl text-red-400 font-bold">Suggest This Track</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
					>
						Close
					</button>
				</div>

				<div className="p-4">
					<div className="flex items-center gap-3 mb-4">
						<img
							src={`https://wsrv.nl/?url=${song.cover}` || "/placeholder.svg"}
							alt={song.name}
							className="w-16 h-16 object-cover rounded-md"
						/>
						<div>
							<div className="font-semibold text-red-400">{song.name}</div>
							<div className="text-sm text-red-300/80">{song.artist}</div>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="bg-zinc-700/50 p-3 rounded-md">
							<div className="space-y-2">
								<label className="block text-sm font-medium text-red-300">
									Solve this math problem to prove you're human:
								</label>
								<div className="text-xl font-bold text-white mb-2">
									{mathProblem.text}
								</div>
								<input
									type="text"
									value={answer}
									onChange={(e) => {
										setAnswer(e.target.value);
										setError("");
									}}
									className="w-full px-3 py-2 bg-zinc-600 text-white rounded-md border border-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500"
									placeholder="Your answer"
								/>
								{error && (
									<div className="text-red-400 text-sm mt-1">{error}</div>
								)}
							</div>
						</div>

						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={!answer}
								className={`px-4 py-2 bg-red-500 text-white rounded-md transition-colors
                  ${
										answer
											? "hover:bg-red-600 cursor-pointer"
											: "opacity-50 cursor-not-allowed"
									}`}
							>
								Submit Suggestion
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
