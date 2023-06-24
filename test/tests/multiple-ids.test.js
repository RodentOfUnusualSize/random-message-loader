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

describe('When multiple message IDs are used', () => {
	const scriptPath = '../../src/random-message-loader.js';

	afterEach(() => {
		saria.testing.jsdom.restore();

		jest.restoreAllMocks();
		jest.resetModules();
	});

	test('elements with each ID have the same message', async () => {
		const url = 'url';

		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const ids = ['id-1', 'id-2', 'id-3'];

		const idGroups = ids.map(id => {
			return {
				'id'       : id,
				'message'  : null,
				'elements' : [],
			};
		});

		const table = document.createElement('table');
		document.body.append(table);
		table.innerHTML = '<thead><tr>'
			+ idGroups.map(idGroup => `<th>${idGroup.id}</th>`).join('')
			+ '</tr></thead>'
		;

		const tbody = document.createElement('tbody');
		table.append(tbody);
		for (let i = 0; i < 3; ++i) {
			const tr = document.createElement('tr');
			tbody.append(tr);

			idGroups.forEach(idGroup => {
				const td = document.createElement('td');
				td.setAttribute('data-saria-random-message-src', url);
				td.setAttribute('data-saria-random-message-id', idGroup.id);
				tr.append(td);
				idGroup.elements.push(td);
			});
		}

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text : jest.fn().mockResolvedValue(Array.from(Array(10).keys()).map(n => `message <b>${n}</b>`).join('\n')),
			});

		const completion = new Promise(resolve => document.addEventListener('saria:random-message-loader:done', () => resolve()));
		require(scriptPath);
		await completion;

		idGroups.forEach(idGroup => idGroup.message = idGroup.elements[0].innerHTML);

		idGroups.forEach(idGroup => {
			idGroup.elements.forEach(element => {
				expect(element.innerHTML).toBe(idGroup.message);
			});
		});
	});

	test.todo('only one fetch is done');
});
