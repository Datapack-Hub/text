import { openDB } from "idb";

export async function openDataStore() {
	const db = await openDB("dph_data-store", 1, {
		upgrade(db, _old, _new, _) {
			db.createObjectStore("fonts", {
				keyPath: "alias",
			});
		},
	});

	return db;
}
