/***********************************************************************
 *                                                                     *
 * This program is free software: you can redistribute it and/or       *
 * modify it under the terms of the GNU General Public License as      *
 * published by the Free Software Foundation, either version 3 of      *
 * the License, or (at your option) any later version.                 *
 *                                                                     *
 * This program is distributed in the hope that it will be useful,     *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of      *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.                *
 * See the GNU General Public License for more details.                *
 *                                                                     *
 * You should have received a copy of the GNU General Public License   *
 * along with this program.                                            *
 * If not, see <https://www.gnu.org/licenses/>.                        *
 *                                                                     *
 **********************************************************************/


/**
 * Name of attribute that holds URL of random messages file.
 *
 * @constant
 * @type {string}
 * @default
 */
const ATTRIBUTE_SRC = 'data-saria-random-message-src';


/**
 * Returns a promise that resolves when the document's DOM content is
 * ready.
 *
 * @param {Document} A document that is loading or loaded.
 * @returns {Promise<Document>} A promise that resolves when the
 *                              document's DOM content is ready.
 */
function waitForDocument(document) {
	if (document.readyState === 'loading')
		return new Promise(resolve => document.addEventListener('DOMContentLoaded', event => resolve(document)));
	else
		return Promise.resolve(document);
}


/**
 * Replaces content in marked elements with randomly-selected messages
 * from a URL
 *
 * @param {Document} The document to run the program on.
 * @returns {Promise} A promise for the program's completion.
 */
function doItToIt(document) {
	try {
		const query = `[${ATTRIBUTE_SRC}]`;

		// Collect all elements that want random content, and extract
		// the source URL and other relevant data.
		const taskDataSet = Array.from(document.querySelectorAll(query))
			.filter(isTargetElement)
			.map(element => createTaskData(element))
		;

		// Group all collected elements by source URL.
		const taskGroups = groupTaskData(taskDataSet);

		// Create a promised task for each unique source URL, that 
		// fetches the message data and sets the elements' content to
		// randomly selected messages.
		const tasks = [];
		for (const [url, elementGroups] of taskGroups)
			tasks.push(createTask(url, elementGroups));

		return Promise.all(tasks)
			.finally(() => document.dispatchEvent(new CustomEvent("saria:random-message-loader:done")));
	}
	catch (err) {
		return Promise.reject(err);
	}
}


/**
 * Tests whether the element is a target for a random message
 *
 * @param {Element} The element to test.
 * @return {boolean} Whether the element is a target for a random
 *                   message.
 */
function isTargetElement(element) {
	return element.hasAttribute(ATTRIBUTE_SRC);
}


/**
 * Gets the body of a response as a string.
 *
 * @oaram {Response} The response.
 * @resturns {string} The text content of the response.
 */
function getResponseText(response) {
	if (!response.ok)
		throw new Error(`HTTP error for URL ${response.url}: ${response.status} ${response.statusText}`);

	return response.text();
}


/**
 * Transform an element that wants random content into task data.
 *
 * @param {Element} element - The element to parse.
 * @returns {Object} Task data for the element.
 */
function createTaskData(element) {
	return {
		element : element,
		url     : element.getAttribute(ATTRIBUTE_SRC),
	};
}


/**
 * Group task data by URL.
 *
 * @param {Object} taskDataSet - Collection of task data.
 * @returns {Map<URL, Array<Array<Element>>} Task data elements grouped
 *                                           by URL.
 */
function groupTaskData(taskDataSet) {
	const taskGroups = new Map();

	for (const taskData of taskDataSet) {
		if (!taskGroups.has(taskData.url))
			taskGroups.set(taskData.url, new Map());

		const urlGroup = taskGroups.get(taskData.url);
		if (!urlGroup.has(''))
			urlGroup.set('', []);

		urlGroup.get('').push(taskData.element);
	}

	for (const [url, group] of taskGroups) {
		const elementGroups = [];

		for (const [id, elements] of group)
			elementGroups.push(elements);

		taskGroups.set(url, elementGroups);
	}

	return taskGroups;
}


/**
 * Create a task for a given URL and elements
 *
 * @param {URL} url - The URL of the messages data.
 * @param {Array<Array<Element>>} Element groups.
 * @param {Promise} A promise that resolves when the messages have been
 *                  fetched, and all elements have been given their
 *                  messages.
 */
function createTask(url, elementGroups) {
	return fetch(url)
		.then(response => getResponseText(response))
		.then(content => {
			const messages = content
				.split('\n')
				.filter(message => message.length > 0)
			;

			if (messages.length == 0)
				throw new Error('no messages');

			for (const elementGroup of elementGroups) {
				const index = 0;

				for (const element of elementGroup)
					element.innerHTML = messages[index];
			}
		});
}


/**
 * Replaces content in marked elements with randomly-selected messages
 * from a URL
 *
 * @returns {Promise} A promise for the program's completion.
 */
function run() {
	const result = waitForDocument(document)
		.then(document => doItToIt(document))
		.catch(error => {
			console.error(`Random message loader error: ${error.message}`);
			//return Promise.reject(error);
		})
	;

	if (typeof exports === "object")
		module.exports = result;

	return result;
}


// Run the program.
run();
