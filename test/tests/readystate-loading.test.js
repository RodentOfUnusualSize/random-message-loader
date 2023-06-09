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

	const millisecondsBeforeTimeout = 1000;

	afterEach(() => {
		saria.testing.jsdom.restore();

		jest.restoreAllMocks();
		jest.resetModules();
	});

	test('target element content is unchanged', async () => {
		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const testElement = document.createElement("p");
		testElement.setAttribute('data-saria-random-message-src', 'messages');
		testElement.textContent = 'default content';
		document.body.appendChild(testElement);

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text : jest.fn().mockResolvedValue('message content'),
			});

		jest.spyOn(document, 'readyState', 'get')
			.mockReturnValue('loading');

		const completion = new Promise(resolve => document.addEventListener('saria:random-message-loader:done', () => resolve()));
		const timeout = new Promise(resolve => setTimeout(resolve, millisecondsBeforeTimeout));
		require(scriptPath);
		await Promise.any([completion, timeout]);

		expect(testElement.textContent).toBe('default content');
	});

	test('no fetches have been attempted', async () => {
		document.head.innerHTML = `<script src="${scriptPath}"></script>`;
		document.body.innerHTML = '<p data-saria-random-message-src="messages">default content</p>';

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text : jest.fn().mockResolvedValue('message content'),
			});

		jest.spyOn(document, 'readyState', 'get')
			.mockReturnValue('loading');

		const completion = new Promise(resolve => document.addEventListener('saria:random-message-loader:done', () => resolve()));
		const timeout = new Promise(resolve => setTimeout(resolve, millisecondsBeforeTimeout));
		require(scriptPath);
		await Promise.any([completion, timeout]);

		expect(fetch.mock.calls).toBeArrayOfSize(0);
	});
});
