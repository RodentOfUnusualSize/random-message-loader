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

describe('In the script\'s most basic synchronous operation', () => {
	const scriptPath = '../../src/random-message-loader.js';

	afterEach(() => {
		saria.testing.jsdom.restore();

		fetch.mockClear();
		jest.resetModules();
	});

	test('it changes the content of the target element', async () => {
		const message = 'message';

		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const testElement = document.createElement("p");
		testElement.setAttribute('data-saria-random-message-src', 'url');
		document.body.appendChild(testElement);

		fetch.mockResponse(message);

		await require(scriptPath);

		expect(testElement.innerHTML).toBe(message);
	});

	test('it fetches the message file', async () => {
		const url = 'url';

		document.head.innerHTML = `<script src="${scriptPath}"></script>`;
		document.body.innerHTML = `<p data-saria-random-message-src="${url}"></p>`;

		await require(scriptPath);

		expect(fetch.mock.calls).toBeArrayOfSize(1);

		expect(fetch.mock.calls[0]).toBeArrayOfSize(1);
		expect(fetch.mock.calls[0][0]).toBe(url);
	});
});
