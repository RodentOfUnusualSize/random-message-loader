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

	test('it fetches the message file', async () => {
		const url = 'url';

		document.head.innerHTML = `<script src="${scriptPath}"></script>`;
		document.body.innerHTML = `<p data-saria-random-message-src="${url}" data-saria-random-message-id="id"></p>`;

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text : jest.fn().mockResolvedValue('message content'),
			});

		const completion = new Promise(resolve => document.addEventListener('saria:random-message-loader:done', () => resolve()));
		require(scriptPath);
		await completion;

		expect(fetch.mock.calls).toBeArrayOfSize(1);

		expect(fetch.mock.calls[0]).toBeArrayOfSize(1);
		expect(fetch.mock.calls[0][0]).toBe(url);
	});

	test('the same message is used in every element', async () => {
		const url = 'url';
		const id = 'id';

		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const firstElement = document.createElement('p');
		firstElement.setAttribute('data-saria-random-message-src', url);
		firstElement.setAttribute('data-saria-random-message-id', id);
		document.body.append(firstElement);

		const elements = [];

		for (let i = 0; i < 3; ++i) {
			const p = document.createElement('p');
			p.setAttribute('data-saria-random-message-src', url);
			p.setAttribute('data-saria-random-message-id', id);

			elements.push(p);

			document.body.append(p);
		}

		const list = document.createElement('ul');
		for (let i = 0; i < 3; ++i) {
			const li = document.createElement('li');
			li.setAttribute('data-saria-random-message-src', url);
			li.setAttribute('data-saria-random-message-id', id);
			li.textContent = `list item #${i + 1}`;

			elements.push(li);

			list.append(li);
		}
		document.body.append(list);

		const table = document.createElement('table');
		const tbody = document.createElement('tbody');
		for (let i = 0; i < 3; ++i) {
			const tr = document.createElement('tr');

			const td = document.createElement('td');
			td.setAttribute('data-saria-random-message-src', url);
			td.setAttribute('data-saria-random-message-id', id);
			td.textContent = `table cell #${i + 1}`;

			elements.push(td);

			tr.innerHTML = `<td>${i + 1}</td>`;
			tr.append(td);

			tbody.append(tr);
		}
		table.innerHTML = '<thead><tr><th>Row</th><th>Message</th></tr></thead>';
		table.append(tbody);
		document.body.append(table);

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text : jest.fn().mockResolvedValue(Array.from(Array(10).keys()).map(n => `message <b>${n}</b>`).join('\n')),
			});

		const completion = new Promise(resolve => document.addEventListener('saria:random-message-loader:done', () => resolve()));
		require(scriptPath);
		await completion;

		for (const element of elements)
			expect(element.innerHTML).toBe(firstElement.innerHTML);
	});

	test('whitespace around the ID does not matter', async () => {
		const url = 'url';
		const id = 'id';

		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const whitespace = [' ', '\t', '\n'];
		const randomWhitespace = length => Array.from(Array(length).keys()).map(i => whitespace[Math.floor(Math.random() * whitespace.length)]).join('');
		const elements = Array.from(Array(100).keys())
			.map(i => {
				const prefix = randomWhitespace(Math.floor(Math.random() * 10));
				const suffix = randomWhitespace(Math.floor(Math.random() * 10));

				const element = document.createElement('p');
				element.setAttribute('data-saria-random-message-src', url);
				element.setAttribute('data-saria-random-message-id', prefix + id + suffix);

				document.body.append(element);

				return element;
			})
		;

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text : jest.fn().mockResolvedValue(Array.from(Array(10).keys()).map(n => `message <b>${n}</b>`).join('\n')),
			});

		const completion = new Promise(resolve => document.addEventListener('saria:random-message-loader:done', () => resolve()));
		require(scriptPath);
		await completion;

		elements.forEach(element => 
			expect(element.innerHTML).toBe(elements[0].innerHTML)
		);
	});
});
