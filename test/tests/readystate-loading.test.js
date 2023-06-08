/***********************************************************************
 *                                                                     *
 * This file is part of Saria’s random message loader program.         *
 *                                                                     *
 * Saria’s random message loader program is free software: you can     *
 * redistribute it and/or modify it under the terms of the GNU         *
 * General Public License as published by the Free Software            *
 * Foundation, either version 3 of the License, or (at your option)    *
 * any later version.                                                  *
 *                                                                     *
 * Saria’s random message loader program is distributed in the hope    *
 * that it will be useful, but WITHOUT ANY WARRANTY; without even the  *
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR     *
 * PURPOSE. See the GNU General Public License for more details.       *
 *                                                                     *
 * You should have received a copy of the GNU General Public License   *
 * along with Saria’s random message loader program.                   *
 * If not, see <https: *www.gnu.org/licenses/>.                        *
 *                                                                     *
 **********************************************************************/

describe('When document is not ready', () => {
	const scriptPath = '../../src/random-message-loader.js';

	const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

	let testElement;

	beforeEach(() => {
		fetch.mockResponseOnce('message content');

		document.head.innerHTML = ''
			+ '<meta charset="utf-8"/>'
			+ '<title>Title</title>'
			+ `<script src="${scriptPath}"></script>`
		;

		document.body.innerHTML = '';

		testElement = document.createElement("p");
		testElement.setAttribute('data-saria-random-message-src', 'messages');
		testElement.textContent = 'default content';

		document.body.appendChild(testElement);
	});

	afterEach(() => {
		jest.resetModules();
		jest.restoreAllMocks();

		fetch.mockClear();
	});

	test('target element content is unchanged', async () => {
		jest.spyOn(document, 'readyState', 'get').mockImplementation(() => 'loading');

		const result = require(scriptPath);

		await Promise.any([result, pause(2000)]);

		expect(testElement.textContent).toBe('default content');
	});

	test('no fetches have been attempted', async () => {
		jest.spyOn(document, 'readyState', 'get').mockImplementation(() => 'loading');

		const result = require(scriptPath);

		await Promise.any([result, pause(2000)]);

		expect(fetch.mock.calls).toBeArrayOfSize(0);
	});
});
