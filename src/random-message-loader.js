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


/**
 * Helper function for constructing error objects.
 *
 * A new error class can be created as simply as:
 *
 * ```
 * class MyError extends Error {
 *     constructor(...parans) {
 *         super(...params);
 *         _constructError(this);
 *     }
 * }
 * ```
 *
 * This will ensure the constructor’s name is properly set.
 *
 * You can also optionally provide the error message.
 *
 * @param {Object} object - The error object being constructed.
 * @param {string} [message] - The error message.
 */
function _constructError(object, message = undefined) {
	object.name = obj.constructor.name;

	if (typeof message !== 'undefined')
		object.message = message;
}


/**
 * Base class for all random message loader errors.
 */
class RandomMessageLoaderError extends Error {
	/**
	 * Constructs a general random message loader error.
	 */
	constructor(...params) {
		super(...params);
		_constructError(this);
	}
}


/**
 * Error indicating that an element cannot be used for receiving
 * randomly-selected messages.
 */
class RandomMessageLoaderElementError extends RandomMessageLoaderError {
	#element;

	/**
	 * Constructs an error indicating an element cannot be used for
	 * randomly-selected messages.
	 * 
	 * @param {Element} element - The element that cannot be used.
	 */
	constructor(element, ...params) {
		super(...params);
		_constructError(this, 'Element is not a random message target element');

		this.#element = element;
	}

	/**
	 * The element that triggered the error.
	 *
	 * @type {Element}
	 * @readonly
	 */
	get element() { return this.#element; }
}


/**
 * Error indicating that an element that wants randomly-selected
 * messages has no source URL.
 */
class RandomMessageLoaderElementHasNoSourceError extends RandomMessageLoaderElementError {
	/**
	 * Constructs an error indicating an element cannot be used for
	 * randomly-selected messages.
	 * 
	 * @param {Element} element - The element that cannot be used.
	 */
	constructor(element, ...params) {
		super(element, ...params);
		_constructError(this, 'Element has no random message source URL');
	}
}


/**
 * Random message loader task error.
 */
class RandomMessageLoaderTaskError extends RandomMessageLoaderError {
	/**
	 * Constructs an error indicating something went wrong with a
	 * random message loader task.
	 */
	constructor(...params) {
		super(...params);
		_constructError(this);
	}
}


/**
 * Error indicating that the URL of an element does not match the task
 * URL.
 */
class RandomMessageLoaderTaskURLMismatchError extends RandomMessageLoaderTaskError {
	#element;
	#url;

	/**
	 * Constructs an error indicating an element’s URL does not match
	 * the task’s URL.
	 * 
	 * @param {Element} element - The element with the incorrect URL.
	 * @param {string} url - The task URL.
	 */
	constructor(element, url, ...params) {
		super(...params);
		_constructError(this, 'Element s not a random message target element');

		this.#element = element;
		this.#url     = url;
	}

	/**
	 * The element that triggered the error.
	 *
	 * @type {Element}
	 * @readonly
	 */
	get element() { return this.#element; }

	/**
	 * The task URL.
	 *
	 * @type {string}
	 * @readonly
	 */
	get url() { return this.#url; }
}


/**
 * Error indicating a problem with the messages data in a task.
 */
class RandomMessageLoaderMessagesError extends RandomMessageLoaderTaskError {
	/**
	 * Constructs an error indicating a problem with the messages data
	 * in a task.
	 */
	constructor(...params) {
		super(...params);
		_constructError(this);
	}
}


/**
 * Error indicating the messages data for a task is empty.
 */
class RandomMessageLoaderMessagesEmptyError extends RandomMessageLoaderMessagesError {
	#url;

	/**
	 * Constructs an error indicating there were no messages in the
	 * message source data for a task.
	 * 
	 * @param {string} url - The URL of the messages.
	 */
	constructor(url, ...params) {
		super(...params);
		_constructError(this, `Message source is empty: ${url}`);

		this.#url = url;
	}

	/**
	 * The messages URL.
	 *
	 * @type {string}
	 * @readonly
	 */
	get url() { return this.#url; }
}


/**
 * An element that wants to receive a randomly-selected message.
 */
class RandomMessageLoaderElement {
	static #attributeSrc = 'data-saria-random-message-src';
	static #attributeID  = 'data-saria-random-message-id';

	/**
	 * Tests whether an element is a valid element for receiving a
	 * randomly-selected message.
	 * 
	 * @param {Element} element - The element to check.
	 * @returns {boolean} Whether the element can receive a
	 *                    randomly-selected message.
	 */
	static isValidElement(element) {
		return element.hasAttribute(RandomMessageLoaderElement.#attributeSrc);
	}

	#element;

	/**
	 * Wraps a DOM element that wants to receive a randomly-selected
	 * message.
	 * 
	 * @param {Element} element - The element to wrap.
	 * @throws {RandomMessageLoaderElementError} Will throw an error if
	 *                                           the element is not
	 *                                           valid for receiving a
	 *                                           randomly-selected
	 *                                           message.
	 */
	constructor(element) {
		if (!element.hasAttribute(RandomMessageLoaderElement.#attributeSrc))
			throw new RandomMessageLoaderElementHasNoSourceError(element);

		this.#element = element;
	}

	/**
	 * The wrapped element.
	 *
	 * @type {Element}
	 * @readonly
	 */
	get element() { return this.#element; }

	/**
	 * The messages source URL.
	 *
	 * @type {string}
	 * @readonly
	 */
	get url() {
		return this.#element.getAttribute(RandomMessageLoaderElement.#attributeSrc);
	}

	/**
	 * The message content ID.
	 *
	 * @type {string}
	 * @readonly
	 */
	get id() {
		return (this.#element.getAttribute(RandomMessageLoaderElement.#attributeID) ?? '').trim();
	}
}


/**
 * A random message loading task.
 */
class RandomMessageLoaderTask {
	#elementGroups;

	/**
	 * Constructs a random message loading task.
	 * 
	 * Each element is checked to make sure that it is a valid target
	 * for a randomly-selected message, and that its source URL matches
	 * the task source URL.
	 * 
	 * Then the elements are grouped by ID.
	 * 
	 * @param {string} url - The message source URL.
	 * @param {Array<Element>} elements - An array of elements that want
	 *                                    a randomly-selected message
	 *                                    from the source URL.
	 * @throws {RandomMessageLoaderTaskError} Throws an error if any of
	 *                                        the elements are not
	 *                                        valid for receiving a
	 *                                        randomly-selected message,
	 *                                        or if their source URL
	 *                                        does not match the task
	 *                                        source URL.
	 */
	constructor(url, elements) {
		// Make sure all the elements are valid.
		const elems = Array.from(elements)
			.map(element => {
				const e = (element instanceof RandomMessageLoaderElement) ? element : new RandomMessageLoaderElement(element);

				if (e.url != url)
					throw new RandomMessageLoaderTaskURLMismatchError(e, url);

				return e;
			});

		// Get the element groups for the elements without IDs.
		//
		// Each element without an ID is in its own group.
		const elementsWithoutIDGroups = elems
			.filter(element => element.id === '')
			.map(element => [element])
		;

		// Get the element groups for the elements with IDs.
		const idGroups = new Map();
		elems
			.filter(element => element.id !== '')
			.forEach(element => {
				if (!idGroups.has(element.id))
					idGroups.set(element.id, []);
				idGroups.get(element.id).push(element);
			})
		;
		const elementsWithIDGroups = Array.from(idGroups.values());

		// Combine both sets of element groups into a single array.
		this.#elementGroups = elementsWithoutIDGroups.concat(elementsWithIDGroups);
	}

	/**
	 * Runs the random message loading task.
	 * 
	 * @returns {Promise<Array<Element>>} A promise that resolves to the
	 *                                    set of elements that were
	 *                                    modified, when the task is
	 *                                    complete.
	 */
	run() {
		// This should theoretically never happen, because a task for a
		// source URL wouldn’t even be created if there were no elements
		// with that source URL. But, meh.
		if (this.#elementGroups.length === 0)
			return Promise.resolve([]);

		// Extract the task’s URL. It will be the same for all elements
		// (this was ensured in the constructor), so we can just pull it
		// out of the first one.
		const url = this.#elementGroups[0][0].url;

		return fetch(url)
			.then(response => {
				if (!response.ok)
					throw new Error(`HTTP error for URL ${response.url}: ${response.status} ${response.statusText}`);
				return response.text();
			})
			.then(content => {
				// Split the messages by line, and throw away any empty
				// lines.
				const messages = content
					.split('\n')
					.filter(message => message.length > 0)
				;

				// If there are no messages, then we can hardly be
				// expected to randomly select one.
				if (messages.length == 0)
					throw new RandomMessageLoaderMessagesEmptyError(url);

				return this.#elementGroups
					.map(elementGroup => {
						// Calculate a random index once for the whole
						// element group.
						const index = Math.floor(Math.random() * messages.length);

						// Unwrap the elements and change their content.
						const elements = elementGroup.map(element => element.element);
						elements.forEach(element => { element.innerHTML = messages[index]; });
						return elements;
					})
					.flat()
				;
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
 * 
 * @param {Document} document - The document to run the program with.
 * @returns {Promise<Array<Element>>} A promise that resolves to the
 *                                    list of elements that were
 *                                    updated.
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
