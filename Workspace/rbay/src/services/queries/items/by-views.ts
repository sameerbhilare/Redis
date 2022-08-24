import { itemsByViewsKey, itemsKey } from '$services/keys';
import { client } from '$services/redis';
import { deserialize } from './deserialize';

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	let results: any = await client.sort(itemsByViewsKey(), {
		// get id, name and views
		GET: [
			'#',
			`${itemsKey('*')}->name`,
			`${itemsKey('*')}->views`,
			`${itemsKey('*')}->endingAt`,
			`${itemsKey('*')}->imageUrl`,
			`${itemsKey('*')}->price`
		],
		// no sorting required
		BY: 'nosort',
		// direction of the sorting
		DIRECTION: order,
		// to limit the number of records to fetch
		LIMIT: { offset, count }
	});

	// above command returns plain array of strings in the form of
	// id1, name1, views1, endingAt1, imageUrl1, price1, id2, name2, views2, endingAt2, imageUrl2, price2, ....
	// we need to convert this array of unstructured strings to item object
	const items = [];
	while (results.length) {
		const [id, name, views, endingAt, imageUrl, price, ...rest] = results;
		const item = deserialize(id, { name, views, endingAt, imageUrl, price });
		items.push(item);
		results = rest;
	}
};
