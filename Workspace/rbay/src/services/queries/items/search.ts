import { client } from '$services/redis';
import { deserialize } from './deserialize';
import { itemsIndexKey } from '$services/keys';

export const searchItems = async (term: string, size: number = 5) => {
	// pre-processing user entered input for fuzzy searching
	const cleaned = term
		.replaceAll(/[^a-zA-Z0-9 ]/g, '') // replace alpha numberic characters
		.trim()
		.split(' ')
		.map((word) => (word ? `%${word}%` : ''))
		.join(' ');

	// Look at cleaned and make sure it is valid
	if (cleaned === '') {
		return [];
	}

	// applying weight
	const query = `(@name:(${cleaned}) => { $weight: 5.0 }) | (@description:(${cleaned}))`;

	// Use the client to do an actual search
	const results = await client.ft.search(itemsIndexKey(), query, {
		LIMIT: {
			from: 0,
			size
		}
	});

	// Deserialize and return the search results
	return results.documents.map(({ id, value }) => deserialize(id, value as any));
};
