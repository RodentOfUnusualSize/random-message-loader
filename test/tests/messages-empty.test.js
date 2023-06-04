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

describe('When messages data is empty', () => {
	const scriptPath = '../../src/random-message-loader.js';

	const url = 'messages';

	const defaultContent = '[default content]';

	let testElement;

	beforeEach(() => {
		jest.resetModules();

		fetch.mockClear();
		fetch.mockResponse('');

		document.head.innerHTML = ''
			+ '<meta charset="utf-8"/>'
			+ '<title>Title</title>'
			+ `<script src="${scriptPath}"></script>`
		;

		document.body.innerHTML = '';

		testElement = document.createElement("p");
		testElement.setAttribute('data-saria-random-message-src', url);
		testElement.textContent = defaultContent;

		document.body.appendChild(testElement);
	});

	test('the default content is not changed', async () => {
		await require(scriptPath);

		expect(testElement.innerHTML).toBe(defaultContent);
	});

	test('it tries to fetch the message file', async () => {
		await require(scriptPath);

		expect(fetch.mock.calls).toBeArrayOfSize(1);

		expect(fetch.mock.calls[0]).toBeArrayOfSize(1);
		expect(fetch.mock.calls[0][0]).toBe(url);
	});
});
