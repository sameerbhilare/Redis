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
};
