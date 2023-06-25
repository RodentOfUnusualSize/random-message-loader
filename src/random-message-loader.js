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

// Use strict mode.
"use strict";


/**
 * Name of attribute that holds URL of random messages file.
 *
 * @constant
 * @type {string}
 * @default
 */
const ATTRIBUTE_SRC = 'data-saria-random-message-src';


function _constructError(obj, message = undefined) {
	obj.name = obj.constructor.name;

	if (typeof message !== 'undefined')
		obj.message = message;
}


class RandomMessageLoaderError extends Error {
	constructor(...params) {
		super(...params);
		_constructError(this);
	}
}


class RandomMessageLoaderElementError extends RandomMessageLoaderError {
	#element;

	constructor(element, ...params) {
		super(...params);
		_constructError(this, 'Element is not a random message target element');

		this.#element = element;
	}

	get element() { return this.#element; }
}


class RandomMessageLoaderTaskError extends RandomMessageLoaderError {
	constructor(...params) {
		super(...params);
		_constructError(this);
	}
}


class RandomMessageLoaderTaskURLError extends RandomMessageLoaderTaskError {
	#element;
	#url;

	constructor(element, url, ...params) {
		super(...params);
		_constructError(this, 'Element s not a random message target element');

		this.#element = element;
		this.#url     = url;
	}

	get element() { return this.#element; }

	get url() { return this.#url; }
}


class RandomMessageLoaderMessagesError extends RandomMessageLoaderError {
	constructor(...params) {
		super(...params);
		_constructError(this);
	}
}


class RandomMessageLoaderMessagesEmptyError extends RandomMessageLoaderMessagesError {
	#url;

	constructor(url, ...params) {
		super(...params);
		_constructError(this, `Message source is empty: ${url}`);

		this.#url = url;
	}

	get url() { return this.#url; }
}


class RandomMessageLoaderElement {
	static #attributeSrc = 'data-saria-random-message-src';
	static #attributeID  = 'data-saria-random-message-id';

	static isValidElement(element) {
		return element.hasAttribute(RandomMessageLoaderElement.#attributeSrc);
	}

	#element;

	constructor(element) {
		if (!RandomMessageLoaderElement.isValidElement(element))
			throw new RandomMessageElementError(element);

		this.#element = element;
	}

	get element() { return this.#element; }

	get url() {
		return this.#element.getAttribute(RandomMessageLoaderElement.#attributeSrc);
	}

	get id() {
		return (this.#element.getAttribute(RandomMessageLoaderElement.#attributeID) ?? '').trim();
	}
}


class RandomMessageLoaderTask {
	#elementGroups;

	constructor(url, elements) {
		// Make sure all the elements are valid.
		elements.forEach(element => {
			if (element.url != url)
				throw new RandomMessageLoaderTaskURLError(element, url);
		});

		// Get all the elements without IDs.
		const elementsWithoutID = elements.filter(element => element.id === '');

		// Get all the elements with IDs, grouped by ID.
		const elementsWithID = new Map();
		elements
			.filter(element => element.id !== '')
			.forEach(element => {
				if (!elementsWithID.has(element.id))
					elementsWithID.set(element.id, []);
				elementsWithID.get(element.id).push(element);
			});

		// Combine both sets of elements into a single array of element
		// groups.
		this.#elementGroups = elementsWithoutID
			.map(element => [element])
			.concat(Array.from(elementsWithID.values()))
		;
	}

	run() {
		if (this.#elementGroups.length === 0)
			return Promise.resolve([]);

		const url = this.#elementGroups[0][0].url;

		return fetch(url)
			.then(response => {
				if (!response.ok)
					throw new Error(`HTTP error for URL ${response.url}: ${response.status} ${response.statusText}`);
				return response.text();
			})
			.then(content => {
				const messages = content
					.split('\n')
					.filter(message => message.length > 0)
				;

				if (messages.length == 0)
					throw new RandomMessageLoaderMessagesEmptyError(url);

				const elementsUpdated = [];

				for (const elementGroup of this.#elementGroups) {
					const index = Math.floor(Math.random() * messages.length);

					const elements = elementGroup.map(element => element.element);

					elements.forEach(element => { element.innerHTML = messages[index]; });

					elementsUpdated.concat(elements);
				}

				return elementsUpdated;
			});
	}
}


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
 * from a URL.
 */
function run(document) {
	return waitForDocument(document)
		.then(document => {
			const query = `[${ATTRIBUTE_SRC}]`;

			const elements = Array.from(document.querySelectorAll(query))
				.filter(RandomMessageLoaderElement.isValidElement)
				.map(element => new RandomMessageLoaderElement(element))
			;

			const sources = Array.from((new Set(elements.map(element => element.url))).values());

			const tasks = sources.map(source =>
				new RandomMessageLoaderTask(
					source,
					elements.filter(element => element.url === source)
				)
			);

			return Promise.all(tasks.map(task => task.run()));
		})
		.catch(error => {
			console.error(`Random message loader error: ${error.message}`);
		})
		.finally(() => {
			document.dispatchEvent(new Event("saria:random-message-loader:done"));
		})
	;
}


// Run the program.
run(document);
