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

	const numberOfMessages = 10;
	const numberOfElements = 100;

	const messages = Array.from(Array(numberOfMessages).keys())
		.map(n => `message #${n}`)
	;

	const elements = [];

	beforeEach(() => {
		jest.resetModules();

		fetch.mockClear();
		fetch.mockResponse(messages.join('\n'));

		document.head.innerHTML = ''
			+ '<meta charset="utf-8"/>'
			+ '<title>Title</title>'
			+ `<script src="${scriptPath}"></script>`
		;

		document.body.innerHTML = '';

		elements.length = 0;

		for (let i = 0; i < (numberOfElements / 2); ++i) {
			const element = document.createElement("p");
			element.setAttribute('data-saria-random-message-src', url);
			element.textContent = '[default content]';

			document.body.appendChild(element);

			elements.push(element);
		}

		const list = document.createElement('ol');
		for (let i = 0; i < (numberOfElements - (numberOfElements / 2)); ++i) {
			const li = document.createElement('li');
			li.setAttribute('data-saria-random-message-src', url);
			li.textContent = `list item #${i}`;

			list.appendChild(li);

			elements.push(li);
		}
		document.body.appendChild(list);
	});

	test('content of all target elements is changed', async () => {
		await require(scriptPath);

		for (const element of elements) {
			expect(element.innerHTML).toMatch(/^message #[0-9]+$/);
		}
	});

	test('only one fetch request is made', async () => {
		await require(scriptPath);

		expect(fetch.mock.calls).toBeArrayOfSize(1);

		expect(fetch.mock.calls[0]).toBeArrayOfSize(1);
		expect(fetch.mock.calls[0][0]).toBe(url);
	});

	describe('content of all target elements is randomly selected', () => {
		const expected = {};
		const actual = {};

		beforeAll(async () => {
			await require(scriptPath);

			expected.mean = (messages.length - 1) / 2;

			actual.values = elements
				.map(element => element.innerHTML)
				.map(message => message.replace('message #', ''))
				.map(id => parseInt(id))
			;

			actual.sum = actual.values.reduce((x, sum) => x + sum);
			actual.mean = actual.sum / actual.values.length;
		});

		test('mean is within expected range', () => {
			// For uniformly distributed indices, the mean should be
			// the halfway point.
			//
			// I don't expect the relative error to exceed ~35%, but
			// let's call it 40% to be generous.

			const relativeError = Math.abs(actual.mean - expected.mean) / expected.mean;

			expect(relativeError).toBeLessThan(0.4);
		});
	});
});
