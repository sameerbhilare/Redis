import { itemsByViewsKey, itemsKey } from '$services/keys';
import { client } from '$services/redis';

export const incrementView = async (itemId: string, userId: string) => {
	return Promise.all([
		client.hIncrBy(itemsKey(itemId), 'view', 1),
		client.zIncrBy(itemsByViewsKey(), 1, itemId)
	]);
};
