/***********************************************************************
 *                                                                     *
 * This program is free software: you can redistribute it and/or       *
 * modify it under the terms of the GNU General Public License         *
 * as published by the Free Software Foundation, either version 3      *
 * of the License, or (at your option) any later version.              *
 *                                                                     *
 * This program is distributed in the hope that it will be useful,     *
 * but WITHOUT ANY WARRANTY; without even the implied warranty         *
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.             *
 * See the GNU General Public License for more details.                *
 *                                                                     *
 * You should have received a copy of the GNU General Public License   *
 * along with this program.                                            *
 * If not, see <https://www.gnu.org/licenses/>.                        *
 *                                                                     *
 **********************************************************************/

window.addEventListener('load', event => {
	const attribute_src = 'data-saria-random-message-src';
	const attribute_id = 'data-saria-random-message-id';

	const task_groups_TEMPORARY = new Map();
	document.querySelectorAll(`[${attribute_src}]`).forEach((element) => {
		const url = element.getAttribute(attribute_src);
		const id = (element.getAttribute(attribute_id) ?? '').trim();

		if (!task_groups_TEMPORARY.has(url))
			task_groups_TEMPORARY.set(url, new Map());

		const task_group = task_groups_TEMPORARY.get(url);
		if (!task_group.has(id))
			task_group.set(id, []);

		task_group.get(id).push(element);
	});

	for (const [url, id_map] of task_groups_TEMPORARY) {
		const element_groups = new Array();

		if (id_map.has(''))
			id_map.get('').forEach(element => { element_groups.push([element]); });

		Array.from(id_map.keys())
			.filter(key => !!key)
			.forEach(id => { element_groups.push(id_map.get(id)); })
		;

		task_groups_TEMPORARY.set(url, element_groups);
	}

	if (task_groups_TEMPORARY.size != 0) {
		const tasks = new Array();
		for (const [url, element_groups] of task_groups_TEMPORARY) {
			tasks.push(
				fetch(url)
					.then(response => response.text())
					.then(text => {
						const messages = text.split('\n').filter(word => word.length > 0);
						if (messages.length == 0)
							throw Error('no messages');

						for (const element_group of element_groups) {
							const index = Math.floor(Math.random() * messages.length);

							for (const element of element_group)
								element.innerHTML = messages[index];
						}
					})
					.catch((err) => console.error(`Random message loader error with url ${url}: ${err.message}`))
			);
		}

		Promise.all(tasks)
			.catch((err) => console.error(`Random message loader error: ${err.message}`));
	}
});
