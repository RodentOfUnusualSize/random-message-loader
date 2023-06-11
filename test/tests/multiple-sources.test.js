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

describe('When messages are wanted from multiple sources', () => {
	const scriptPath = '../../src/random-message-loader.js';

	afterEach(() => {
		saria.testing.jsdom.restore();

		jest.restoreAllMocks();
		jest.resetModules();
	});

	test('each element gets content from the correct source', async () => {
		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const sources = Array.from(Array(3).keys())
			.map(n => [`path/to/source-${n}`, `message from source ${n}`, []]);

		for (let i = 0; i < 3; ++i) {
			sources.forEach(([source, messages, elements]) => {
				const element = document.createElement("p");
				element.setAttribute('data-saria-random-message-src', source);
				element.textContent = 'default content';
				document.body.appendChild(element);
				elements.push(element);
			});
		}

		jest.spyOn(globalThis, 'fetch')
			.mockImplementation(url => {
				for (const [source, messages, elements] of sources) {
					if (source === url) {
						return Promise.resolve({
							url        : source,
							ok         : true,
							status     : 200,
							statusText : 'Ok',
							text       : jest.fn().mockResolvedValue(messages),
						});
					}
				}

				return Promise.reolve({
					url        : source,
					ok         : false,
					status     : 404,
					statusText : 'Not Found',
				});
			});

		await require(scriptPath);

		sources.forEach(([source, message, elements]) => {
			elements.forEach(element => {
				expect(element.innerHTML).toBe(message);
			});
		});
	});

	test('each source is fetched once', async () => {
		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const sources = Array.from(Array(3).keys())
			.map(n => [`path/to/source-${n}`, `message from source ${n}`]);

		for (let i = 0; i < 3; ++i) {
			sources.forEach(([source, messages]) => {
				const element = document.createElement("p");
				element.setAttribute('data-saria-random-message-src', source);
				element.textContent = 'default content';
				document.body.appendChild(element);
			});
		}

		jest.spyOn(globalThis, 'fetch')
			.mockImplementation(url => {
				for (const [source, messages] of sources) {
					if (source === url) {
						return Promise.resolve({
							url        : source,
							ok         : true,
							status     : 200,
							statusText : 'Ok',
							text       : jest.fn().mockResolvedValue(messages),
						});
					}
				}

				return Promise.reolve({
					url        : source,
					ok         : false,
					status     : 404,
					statusText : 'Not Found',
				});
			});

		await require(scriptPath);

		expect(fetch.mock.calls).toBeArrayOfSize(sources.length);

		expect(fetch.mock.calls.map(call => call[0]))
			.toIncludeSameMembers(sources.map(source => source[0]));
	});
});
