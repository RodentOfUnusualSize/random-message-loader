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

describe('When a message ID is used', () => {
	const scriptPath = '../../src/random-message-loader.js';

	afterEach(() => {
		saria.testing.jsdom.restore();

		jest.restoreAllMocks();
		jest.resetModules();
	});

	test('it changes the content of the target element', async () => {
		const message = 'message';

		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const testElement = document.createElement("p");
		testElement.setAttribute('data-saria-random-message-src', 'url');
		testElement.setAttribute('data-saria-random-message-id', 'id');
		document.body.appendChild(testElement);

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text : jest.fn().mockResolvedValue(message),
			});

		const completion = new Promise(resolve => document.addEventListener('saria:random-message-loader:done', () => resolve()));
		require(scriptPath);
		await completion;

		expect(testElement.innerHTML).toBe(message);
	});

	test.todo('it fetches the message file');

	test.todo('the same message is used in every element');
});
