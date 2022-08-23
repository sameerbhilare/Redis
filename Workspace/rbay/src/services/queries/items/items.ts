import { client } from '$services/redis';
import { genId } from '$services/utils';
import type { CreateItemAttrs } from '$services/types';
import { itemsKey, itemsByViewsKey } from '$services/keys';
import { serialize } from './serialize';
import { deserialize } from './deserialize';

export const getItem = async (id: string) => {
	const item = await client.hGetAll(itemsKey(id));

	if (Object.keys(item).length === 0) {
		return null;
	}

	return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
	const commands = ids.map((id) => {
		return client.hGetAll(itemsKey(id));
	});

	const results = await Promise.all(commands);

	return results.map((result, index) => {
		if (Object.keys(result).length === 0) {
			return null;
		}

		return deserialize(ids[index], result);
	});
};

export const createItem = async (attrs: CreateItemAttrs) => {
	const id = genId();
	const serialized = serialize(attrs);

	// using pipeline
	await Promise.all([
		client.hSet(itemsKey(id), serialized),
		client.zAdd(itemsByViewsKey(), {
			value: id,
			score: 0
		})
	]);
	return id;
};
