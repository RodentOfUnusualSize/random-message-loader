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

describe('When multiple message sources and IDs are used', () => {
	const scriptPath = '../../src/random-message-loader.js';

	afterEach(() => {
		saria.testing.jsdom.restore();

		jest.restoreAllMocks();
		jest.resetModules();
	});

	test('each source and ID pair gets the same message', async () => {
		const urls = ['url-1', 'url-2', 'url-3'];
		const ids = ['id-1', 'id-2', 'id-3'];

		const sources = new Map(
			urls.map(url => [url, Array.from(Array(10).keys()).map(i => `${url}: #${i}`)])
		);

		const cartesian = (...a) => a.reduce((b, c) => b.flatMap(d => c.map(e => [...d, e])), [[]]);
		const pairs = cartesian(urls, ids);

		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const groups = pairs
			.map(([url, id]) => {
				const group = {
					'url'      : url,
					'id'       : id,
					'message'  : null,
					'elements' : [],
				};

				const ul = document.createElement('ul');
				document.body.append(ul);

				for (let i = 0; i < 3; ++i) {
					const li = document.createElement('li');
					li.setAttribute('data-saria-random-message-src', group.url);
					li.setAttribute('data-saria-random-message-id', group.id);
					ul.append(li);
					group.elements.push(li);
				}

				return group;
		});

		jest.spyOn(globalThis, 'fetch')
			.mockImplementation(url => {
				if (sources.has(url)) {
					return Promise.resolve({
						'url'        : url,
						'ok'         : true,
						'status'     : 200,
						'statusText' : 'Ok',
						'text'       : jest.fn().mockResolvedValue(sources.get(url).join('\n')),
					});
				}
				else {
					return Promise.reolve({
						'url'        : url,
						'ok'         : false,
						'status'     : 404,
						'statusText' : 'Not Found',
					});
				}
			});

		const completion = new Promise(resolve => document.addEventListener('saria:random-message-loader:done', () => resolve()));
		require(scriptPath);
		await completion;

		groups.forEach(group => group.message = group.elements[0].innerHTML);

		groups.forEach(group => {
			group.elements.forEach(element => {
				expect(element.innerHTML).toBe(group.message);
			});
		});
	});

	test('each element gets content from the correct source', async () => {
		const urls = ['url-1', 'url-2', 'url-3'];

		const sources = new Map(
			urls.map(url => [url, Array.from(Array(10).keys()).map(i => `${url}: #${i}`)])
		);

		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const cartesian = (...a) => a.reduce((b, c) => b.flatMap(d => c.map(e => [...d, e])), [[]]);
		const elements = cartesian(urls, ['id-1', 'id-2', 'id-3'])
			.map(([url, id]) =>
				Array.from(Array(3).keys())
					.map(i => {
						const elem = document.createElement('p');
						elem.setAttribute('data-saria-random-message-src', url);
						elem.setAttribute('data-saria-random-message-id', id);
						document.body.append(elem);
						return elem;
					})
			)
			.flat()
		;

		jest.spyOn(globalThis, 'fetch')
			.mockImplementation(url => {
				if (sources.has(url)) {
					return Promise.resolve({
						'url'        : url,
						'ok'         : true,
						'status'     : 200,
						'statusText' : 'Ok',
						'text'       : jest.fn().mockResolvedValue(sources.get(url).join('\n')),
					});
				}
				else {
					return Promise.reolve({
						'url'        : url,
						'ok'         : false,
						'status'     : 404,
						'statusText' : 'Not Found',
					});
				}
			});

		const completion = new Promise(resolve => document.addEventListener('saria:random-message-loader:done', () => resolve()));
		require(scriptPath);
		await completion;

		elements.forEach(element => {
			const url = element.getAttribute('data-saria-random-message-src');
			expect(element.innerHTML).toStartWith(url + ': ');
		});
	});

	test.todo('only a single fetch is made for each URL');
});
