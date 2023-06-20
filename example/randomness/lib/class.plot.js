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

export class srml_Plot {
	static sectionID = 'plot';
	static sectionName = 'Plot';

	static generateExplanation(parent) {
		const vMin = srml_config.dataValueMinimum;
		const vMax = srml_config.dataValueMaximum;
		const numberOfValues = srml_config.dataValueCount;
		const samplesPerValue = srml_config.samplesPerValue;

		parent.appendChild(parent.ownerDocument.createElement('p'))
			.textContent = [
				'The plot of the messages selected should look like noise (specifically: white noise), similar to:',
			].join(' ');

		const plotRandom = new srml_Plot(parent);
		plotRandom.calculate(Array.from(Array(numberOfValues * samplesPerValue).keys()).map(() => Math.floor((Math.random() * numberOfValues) + vMin)));

		parent.appendChild(parent.ownerDocument.createElement('p'))
			.textContent = [
				'Any sort of pattern in the plot indicates a problem with the random number generation.',
			].join(' ');

		parent.appendChild(parent.ownerDocument.createElement('p'))
			.textContent = [
				'For example, the following plot would suggest that only a single message, message #25, is always being selected:',
			].join(' ');

		const plotConst = new srml_Plot(parent);
		plotConst.calculate([ [0, 25], [(numberOfValues * samplesPerValue) - 1, 25] ]);

		parent.appendChild(parent.ownerDocument.createElement('p'))
			.textContent = [
				'The following plot would suggest that messages are being selected sequentially:',
			].join(' ');

		const plotSeq = new srml_Plot(parent);
		
		const plotSeqSamples = [];
		for (let i = 0; i < samplesPerValue; ++i) {
			plotSeqSamples.push([i * numberOfValues, vMin]);
			plotSeqSamples.push([(i + 1) * numberOfValues, vMax]);
		}

		plotSeq.calculate(plotSeqSamples);
	}

	#_container;
	#_element;

	constructor(parent) {
		const fragment = parent.ownerDocument.createDocumentFragment();

		this.#_container = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.#_container.setAttribute('version', '1.1');
		this.#_container.setAttribute('width', '545');
		this.#_container.setAttribute('height', '215');
		this.#_container.setAttribute('viewBox', '0 0 1090 430');
		this.#_container.innerHTML = `
			<rect x="40" y="10" width="1000" height="400" fill="#fff" class="plot-background"/>
			<g stroke="#000" stroke-linecap="square" transform="translate(40,10)">
				<g>
					<line x1="-5"/>
					<line x1="-5" y1="40" y2="40"/>
					<line x1="-5" y1="80" y2="80"/>
					<line x1="-5" y1="120" y2="120"/>
					<line x1="-5" y1="160" y2="160"/>
					<line x1="-5" y1="200" y2="200"/>
					<line x1="-5" y1="240" y2="240"/>
					<line x1="-5" y1="280" y2="280"/>
					<line x1="-5" y1="320" y2="320"/>
					<line x1="-5" y1="360" y2="360"/>
				</g>
				<line x1="-5" y1="400" y2="400" class="plot-axis"/>
				<line y2="400"/>
			</g>
			<g font-size="14" text-anchor="end" transform="translate(30,15)">
				<text y="0">100</text>
				<text y="40">90</text>
				<text y="80">80</text>
				<text y="120">70</text>
				<text y="160">60</text>
				<text y="200">50</text>
				<text y="240">40</text>
				<text y="280">30</text>
				<text y="320">20</text>
				<text y="360">10</text>
				<text y="400">0</text>
			</g>`;
		fragment.append(this.#_container);

		this.#_element = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		this.#_element.setAttribute('stroke', '#f00');
		this.#_element.setAttribute('stroke-width', '0.25');
		this.#_element.setAttribute('fill', 'none');
		this.#_element.setAttribute('transform', 'translate(40,410) scale(0.1,-4)');
		this.#_element.setAttribute('stroke', '#f00');

		this.#_container.append(this.#_element);

		this.#drawNoDataBox();

		parent.append(fragment);
	}

	calculate(samples) {
		if (samples === undefined || samples === null) {
			this.#drawNoDataBox();
		}
		else {
			// The sample data given is assumed to be an iterable of
			// some kind.
			//
			// If each element of the iterable is a single number,
			// assume it is a value, and combine it with its index.
			//
			// Otherwise, assume the element is an iterable with at
			// least two elements: an index and a value.
			const points = Array.from(samples)
				.map((value, index) => ((typeof value === 'number') ? [index, value] : [value[0], value[1]]))
				.map(([index, value]) => `${index},${value}`)
				.join(' ');

			const polyline = this.#_element.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			polyline.setAttribute('vector-effect', 'non-scaling-stroke');
			polyline.setAttribute('points', points);

			this.#_element.replaceChildren(polyline);

			this.#clearNoDataBox();
		}
	}

	#drawNoDataBox() {
		if (!this.#_container.lastElementChild.classList.contains('no-data')) {
			const g = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
			g.setAttribute('class', 'no-data');
			g.setAttribute('transform', 'translate(545,215)');
			g.innerHTML = `
				<rect x="-150" y="-50" width="300" height="100" rx="20" ry="20" stroke="#f00" stroke-width="10" fill="#fff"/>
				<text y="18" font-size="50" font-weight="bold" text-anchor="middle">NO DATA</text>'
			`;
			this.#_container.append(g);
		}
	}

	#clearNoDataBox() {
		if (this.#_container.lastElementChild.classList.contains('no-data'))
			this.#_container.lastElementChild.remove();
	}
};
