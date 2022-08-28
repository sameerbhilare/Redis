import { itemsByViewsKey, itemsKey, itemsViewsKey } from '$services/keys';
import { client } from '$services/redis';

export const incrementView = async (itemId: string, userId: string) => {
	// using Lua script
	return client.incrementView(itemId, userId);

	// without Lua script
	/*
	const inserted = await client.pfAdd(itemsViewsKey(itemId), userId);

	if (inserted) {
		return Promise.all([
			client.hIncrBy(itemsKey(itemId), 'view', 1),
			client.zIncrBy(itemsByViewsKey(), 1, itemId)
		]);
	} */
};
