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

describe('When document is becoming ready', () => {
	const scriptPath = '../../src/random-message-loader.js';

	afterEach(() => {
		saria.testing.jsdom.restore();

		jest.restoreAllMocks();
		jest.resetModules();
	});

	test('listener for DOMContentLoaded event is added', async () => {
		document.head.innerHTML = `<script src="${scriptPath}"></script>`;
		document.body.innerHTML = '<p data-saria-random-message-src="url"></p>';

		jest.spyOn(document, 'addEventListener');

		jest.spyOn(document, 'readyState', 'get')
			.mockReturnValue('loading');

		saria.testing.partiallyAwait(require(scriptPath));

		expect(document.addEventListener.mock.calls).toBeArrayOfSize(1);

		expect(document.addEventListener.mock.calls[0][0]).toBe('DOMContentLoaded');
	});

	test('content is changed after DOMContentLoaded event', async () => {
		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const testElement = document.createElement("p");
		testElement.setAttribute('data-saria-random-message-src', 'url');
		testElement.textContent = 'default content';
		document.body.appendChild(testElement);

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text : jest.fn().mockResolvedValue('message content'),
			});

		jest.spyOn(document, 'readyState', 'get')
			.mockReturnValue('loading');

		const result = require(scriptPath);
		saria.testing.partiallyAwait(result);

		jest.spyOn(document, 'readyState', 'get')
			.mockReturnValue('interactive');

		document.dispatchEvent(new Event('DOMContentLoaded', { bubbles : true }));

		await result;

		expect(testElement.innerHTML).toBe('message content');
	});

	test('messages are fetched after DOMContentLoaded event', async () => {
		document.head.innerHTML = `<script src="${scriptPath}"></script>`;
		document.body.innerHTML = '<p data-saria-random-message-src="url"></p>';

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text : jest.fn().mockResolvedValue('message content'),
			});

		jest.spyOn(document, 'readyState', 'get')
			.mockReturnValue('loading');

		const result = require(scriptPath);
		saria.testing.partiallyAwait(result);

		jest.spyOn(document, 'readyState', 'get')
			.mockReturnValue('interactive');

		document.dispatchEvent(new Event('DOMContentLoaded', { bubbles : true }));

		await result;

		expect(fetch.mock.calls).toBeArrayOfSize(1);

		expect(fetch.mock.calls[0][0]).toBe('url');
	});
});
