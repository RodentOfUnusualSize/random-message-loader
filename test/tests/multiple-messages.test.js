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

describe('When multiple messages are wanted from a single source', () => {
	const scriptPath = '../../src/random-message-loader.js';

	const url = 'messages';

	const messages = Array.from(Array(3).keys())
		.map(n => `message #${n}`)
	;

	const elements = [];

	beforeEach(() => {
		jest.resetModules();

		fetch.mockClear();
		fetch.mockResponse(messages.join('\n'));
	});

	test('content of all target elements is changed', async () => {
		await require(scriptPath);

		for (const element of elements) {
			expect(element.innerHTML).toMatch(/^message #[0-9]+$/);
		}
	});

	test('content of all target elements is randomly selected', async () => {
		await require(scriptPath);
	});

	test('only one fetch request is made', async () => {
		await require(scriptPath);

		expect(fetch.mock.calls).toBeArrayOfSize(1);

		expect(fetch.mock.calls[0]).toBeArrayOfSize(1);
		expect(fetch.mock.calls[0][0]).toBe(url);
	});
});
