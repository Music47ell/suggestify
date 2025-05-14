interface SongData {
	track_title: string;
	artist_name: string;
	link?: string;
}

export default async function sendNtfyNotification(songData: SongData) {
	const ntfyUrl = import.meta.env.NTFY_URL;
	const ntfyTopic = import.meta.env.NTFY_TOPIC;
	const ntfyToken = import.meta.env.NTFY_TOKEN;

	if (!ntfyTopic || !ntfyToken) {
		console.error("NTFY configuration missing");
		return;
	}

	const message = `
🤘 ${songData.track_title}
👨‍🎤 ${songData.artist_name}
🔗 ${songData.link || "No URL provided"}`;

	try {
		const response = await fetch(`${ntfyUrl}/${ntfyTopic}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${ntfyToken}`,
				Title: "New Song Submission",
				Priority: "default",
				Tags: "musical_note",
			},
			body: message,
		});

		if (!response.ok) {
			console.error("Failed to send ntfy notification", {
				status: response.status,
				statusText: response.statusText,
			});
		}
	} catch (error) {
		console.error("Error sending ntfy notification:", error);
	}
}
