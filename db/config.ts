import { defineDb, defineTable, column } from "astro:db";

// CREATE TABLE "Suggestions" (
// 	id SERIAL PRIMARY KEY,
// 	track_id INTEGER,
// 	track_title TEXT,
// 	artist_name TEXT,
// 	album_name TEXT,
// 	cover_url TEXT,
// 	link TEXT,
// 	created_at DATE
// )

const Suggestions = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		track_id: column.number(),
		track_title: column.text(),
		artist_name: column.text(),
		album_name: column.text(),
		cover_url: column.text(),
		link: column.text(),
		created_at: column.date(),
	},
});

// CREATE TABLE "Geolocation" (
// 	id SERIAL PRIMARY KEY,
// 	suggestion_id INTEGER REFERENCES "Suggestions" (id),
// 	city TEXT,
// 	country TEXT,
// 	flag TEXT,
// 	latitude TEXT,
// 	longitude TEXT,
// 	recorded_at DATE
// )

const Geolocation = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		suggestion_id: column.number({ references: () => Suggestions.columns.id }),
		city: column.text(),
		country: column.text(),
		flag: column.text(),
		latitude: column.number(),
		longitude: column.number(),
		recorded_at: column.date(),
	},
});

export default defineDb({
	tables: { Suggestions, Geolocation },
});
