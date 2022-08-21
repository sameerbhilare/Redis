import { itemsKey, userLikesKey } from '$services/keys';
import { client } from '$services/redis';
import { getItems } from './items';

export const userLikesItem = async (itemId: string, userId: string) => {
	await client.sIsMember(userLikesKey(userId), itemId);
};

export const likedItems = async (userId: string) => {
	// fetch all item ids from this user's liked set
	const ids = await client.sMembers(userLikesKey(userId));

	// fetch all item hashes with those ids
	return getItems(ids);
};

export const likeItem = async (itemId: string, userId: string) => {
	const inserted = await client.sAdd(userLikesKey(userId), itemId);
	if (inserted) {
		return await client.hIncrBy(itemsKey(itemId), 'likes', 1);
	}
};

export const unlikeItem = async (itemId: string, userId: string) => {
	const removed = await client.sRem(userLikesKey(userId), itemId);
	if (removed) {
		return await client.hIncrBy(itemsKey(itemId), 'likes', -1);
	}
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
	const ids = await client.sInter([userLikesKey(userOneId), userLikesKey(userTwoId)]);

	return getItems(ids);
};
