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

const ATTRIBUTE_SRC = 'data-saria-random-message-src';
const ATTRIBUTE_ID  = 'data-saria-random-message-id';

const DEFAULT_ID = '';

// parseMessages(String) -> Array
//
// Parse a string representing the raw text content of a messages file
// into an array of messages.
function parseMessages(text) {
	const delimiter = '\n';

	return text.split(delimiter).filter(msg => msg.length > 0);
}

// validateMessages(Array) -> null
//
// Make sure the array of messages is acceptable. Throw an error if not.
function validateMessages(messages) {
	if (messages.length == 0)
		throw Error('no messages');
}

// selectRandomItem(Array) -> Any
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
