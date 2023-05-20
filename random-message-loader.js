/***********************************************************************
 *                                                                     *
 * This program is free software: you can redistribute it and/or       *
 * modify it under the terms of the GNU General Public License         *
 * as published by the Free Software Foundation, either version 3      *
 * of the License, or (at your option) any later version.              *
 *                                                                     *
 * This program is distributed in the hope that it will be useful,     *
 * but WITHOUT ANY WARRANTY; without even the implied warranty         *
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.             *
 * See the GNU General Public License for more details.                *
 *                                                                     *
 * You should have received a copy of the GNU General Public License   *
 * along with this program.                                            *
 * If not, see <https://www.gnu.org/licenses/>.                        *
 *                                                                     *
 **********************************************************************/

// Configuration ///////////////////////////////////////////////////////

const ATTRIBUTE_SRC = 'data-saria-random-message-src';
const ATTRIBUTE_ID  = 'data-saria-random-message-id';

const DEFAULT_ID = '';

// Random message loader ///////////////////////////////////////////////

// loadRandomMessages(Document) -> null
//
// Scans document for elements that want to be filled with randomly-
// selected content, then loads that content from URLs, and applies it
// to the elements.
function loadRandomMessages(document) {
	const task_groups = createTaskGroups(document);

	const tasks = createTasks(task_groups);

	Promise.all(tasks)
		.catch(err => console.error(`Random message loader error: ${err.message}`));
}

// Task functions //////////////////////////////////////////////////////

// createTaskGroups(Document) -> Map(Url, Array(Array(Element)))
//
// Scans document for elements with random message source attributes,
// and organizes them into task groups by URL and message ID.
function createTaskGroups(doc) {
	const task_groups = new Map();

	// Scan document for all marked elements, and store them in a
	//   Map(url: Map(id: [element...]))
	// structure.
	doc.querySelectorAll(`[${ATTRIBUTE_SRC}]`).forEach(element => {
		const url = element.getAttribute(ATTRIBUTE_SRC);
		const id = (element.getAttribute(ATTRIBUTE_ID) ?? DEFAULT_ID).trim();

		if (!task_groups.has(url))
			task_groups.set(url, new Map());

		const task_group = task_groups.get(url);
		if (!task_group.has(id))
			task_group.set(id, []);

		task_group.get(id).push(element);
	});

	// Partially flatten the task group structure, to
	//   Map(url: [[element...]...])
	// where each element array is the group of all elements with the
	// same ID (and URL).
	//
	// Special-case the default ID, splitting the elements of its array
	// each into their own, single-element array.
	for (const [url, id_map] of task_groups) {
		const element_groups = new Array();

		if (id_map.has(DEFAULT_ID))
			id_map.get(DEFAULT_ID).forEach(element => { element_groups.push([element]); });

		Array.from(id_map.keys())
			.filter(key => key != '')
			.forEach(id => { element_groups.push(id_map.get(id)); })
		;

		task_groups.set(url, element_groups);
	}

	return task_groups;
}

// createTasks(Map(Url, Array(Array(Element)))) -> Array(Promise)
//
// Creates a promise for a task out of each URL and group of element
// groups, and returns the collection of all the tasks.
function createTasks(task_groups) {
	const tasks = new Array();

	for (const [url, element_groups] of task_groups)
		tasks.push(createTask(url, element_groups));

	return tasks;
}

// createTask(String, Array(Array(Element))) -> Promise
//
// Creates a promise for a task tha asynchronously fetches a URL
// containing messages, parses what it receives, then selects messages
// randomly from that and applies them to the element groups.
function createTask(url, element_groups) {
	return fetch(url)
		.then(response => response.text())
		.then(text => doRandomMessages(text, element_groups))
		.catch((err) => console.error(`Random message loader error with URL ${url}: ${err.message}`))
	;
}

// Messages functions //////////////////////////////////////////////////

// parseMessages(String) -> Array(String)
//
// Parse a string representing the raw text content of a messages file
// into an array of messages.
function parseMessages(text) {
	const delimiter = '\n';

	return text.split(delimiter).filter(msg => msg.length > 0);
}

// validateMessages(Array(String)) -> null
//
// Make sure the array of messages is acceptable. Throw an error if not.
function validateMessages(messages) {
	if (messages.length == 0)
		throw Error('no messages');
}

// applyRandomMessageToElements(Array(String), Array(Element)) -> null
//
// Selects a random message from the collection, then applies it to all
// the elements.
function applyRandomMessageToElements(messages, elements) {
	const message = selectRandomItem(messages);

	elements.forEach(element => element.innerHTML = message);
}

// doRandomMessages(String, Array(Array(Element))) -> null
//
// Parses the string to get a set of messages, then uses them to pick a
// random message for each element group.
function doRandomMessages(text, element_groups) {
	const messages = parseMessages(text);
	validateMessages(messages);

	element_groups.forEach(elements => applyRandomMessageToElements(messages, elements));
}

// Helper functions ////////////////////////////////////////////////////

// selectRandomItem(Array(Any)) -> Any
//
// Randomly select an item from the array.
//
// If the array is empty, throw an error.
function selectRandomItem(items) {
	if (items.length == 0)
		throw Error('no items to select');

	const index = Math.floor(Math.random() * items.length);
	return items[index];
}

// Program /////////////////////////////////////////////////////////////

window.addEventListener('load', event => {
	// Scan document for all marked elements, and store them in a
	//   Map(url: Map(id: [element...]))
	// structure.
	const task_groups = new Map();
	document.querySelectorAll(`[${ATTRIBUTE_SRC}]`).forEach((element) => {
		const url = element.getAttribute(ATTRIBUTE_SRC);
		const id = (element.getAttribute(ATTRIBUTE_ID) ?? '').trim();

		if (!task_groups.has(url))
			task_groups.set(url, new Map());

		const task_group = task_groups.get(url);
		if (!task_group.has(id))
			task_group.set(id, []);

		task_group.get(id).push(element);
	});

	// Partially flatten the task group structure, to
	//   Map(url: [[element...]...])
	// where each element array is the group of all elements with the
	// same ID (and URL).
	//
	// Special-case the default ID, splitting the elements of its array
	// each into their own, single-element array.
	for (const [url, id_map] of task_groups) {
		const element_groups = new Array();

		if (id_map.has(''))
			id_map.get('').forEach(element => { element_groups.push([element]); });

		Array.from(id_map.keys())
			.filter(key => key != '')
			.forEach(id => { element_groups.push(id_map.get(id)); })
		;

		task_groups.set(url, element_groups);
	}

	if (task_groups.size != 0) {
		const tasks = new Array();
		for (const [url, element_groups] of task_groups) {
			tasks.push(
				fetch(url)
					.then(response => response.text())
					.then(text => {
						const messages = text.split('\n').filter(word => word.length > 0);
						if (messages.length == 0)
							throw Error('no messages');

						for (const element_group of element_groups) {
							const index = Math.floor(Math.random() * messages.length);

							for (const element of element_group)
								element.innerHTML = messages[index];
						}
					})
					.catch((err) => console.error(`Random message loader error with url ${url}: ${err.message}`))
			);
		}

		Promise.all(tasks)
			.catch((err) => console.error(`Random message loader error: ${err.message}`));
	}
});
