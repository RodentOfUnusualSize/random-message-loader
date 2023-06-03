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
	// TODO: Check document.readyState.
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

		const elements = Array.from(document.querySelectorAll(query))
			.filter(isTargetElement)
		;

		const tasks = elements.map(element => {
			const src = element.getAttribute(ATTRIBUTE_SRC);

			const task = fetch(src)
				.then(response => response.text())
				.then(content => { element.innerHTML = content; });
			;

			return task;
		});

		return Promise.all(tasks);
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
