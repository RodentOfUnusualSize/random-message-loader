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

	const task_groups = new Map();
	document.querySelectorAll(`[${attribute_src}]`).forEach((element) => {
		const url = element.getAttribute(attribute_src);

		if (task_groups.has(url))
			task_groups.get(url).push(element);
		else
			task_groups.set(url, new Array(element));
	});

	if (task_groups.size != 0) {
		const tasks = new Array();

		Promise.all(tasks)
			.catch((err) => console.error(`Random message loader error: ${err.message}`));
	}
});
