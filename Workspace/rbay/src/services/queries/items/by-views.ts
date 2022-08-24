import { itemsByViewsKey, itemsKey } from '$services/keys';
import { client } from '$services/redis';

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	const results = await client.sort(itemsByViewsKey(), {
		// get id, name and views
		GET: ['#', `${itemsKey('*')}->name`, `${itemsKey('*')}->views`],
		// no sorting required
		BY: 'nosort',
		// direction of the sorting
		DIRECTION: order,
		// to limit the number of records to fetch
		LIMIT: { offset, count }
	});

	console.log(results);
};
