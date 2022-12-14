import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { usenamesKey, usernameUniqueKey, usersKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
	// use the username to look up the person's userid with usernames sorted set
	const decimalId = await client.zScore(usenamesKey(), username);

	// make sure we actually got an id from the lookup
	if (!decimalId) {
		throw new Error('User does not exist.');
	}

	// take the id and convert it back to hex
	const id = decimalId.toString(16);

	// use the id to look up the user's hash
	const user = await client.hGetAll(usersKey(id));

	// deserialize and return the hash
	return deserialize(id, user);
};

export const getUserById = async (id: string) => {
	const user = await client.hGetAll(usersKey(id));
	return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	const id = genId();

	// see if username already exists
	const exists = await client.sIsMember(usernameUniqueKey(), attrs.username);
	if (exists) {
		throw new Error('Username is taken');
	}

	await client.hSet(usersKey(id), serialize(attrs));
	// add the created username to unique usernames
	await client.sAdd(usernameUniqueKey(), attrs.username);
	await client.zAdd(usenamesKey(), {
		value: attrs.username,
		score: parseInt(id, 16) // convert hex to integer
	});

	return id;
};

const serialize = (user: CreateUserAttrs) => {
	return {
		username: user.username,
		password: user.password
	};
};

const deserialize = (id: string, user: { [key: string]: string }) => {
	return {
		id,
		username: user.username,
		password: user.password
	};
};
