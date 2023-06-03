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
	return Promise.resolve();
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
	;

	if (typeof exports === "object")
		module.exports = result;

	return result;
}


// Run the program.
run();
