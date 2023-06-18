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

export class srml_Histogram {
	static sectionID = 'histogram';
	static sectionName = 'Histogram';

	static generateExplanation(parent) {
		parent.appendChild(parent.ownerDocument.createElement('p'))
			.textContent = [
				'We expect that when messages are selected, they will be selected randomly, but uniformly.',
				'If the number of samples is a multiple of the number of values, then in a theoretically “perfect” run, there should be an equal number of instances of each value',
			].join(' ');

		const samplesPerValue = srml_config.samplesPerValue;

		const svg = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('version', '1.1');
		svg.setAttribute('width', '500');
		svg.setAttribute('height', '200');
		svg.setAttribute('viewBox', '0 0 500 200');

		const field = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		field.setAttribute('transform', 'translate(25,10)');
		field.innerHTML = '<rect width="200" height="160" fill="#fff"/>';
		svg.append(field);

		const minorGrid = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		minorGrid.setAttribute('stroke', '#000');
		minorGrid.setAttribute('stroke-dasharray', '2.5');
		minorGrid.setAttribute('stroke-dashoffset', '2.5');
		minorGrid.setAttribute('stroke-opacity', '0.5');
		field.append(minorGrid);

		Array.from(Array(20).keys())
			.filter(n => (n % 5) != 0)
			.map(n => n * 10)
			.forEach(n => {
				const line = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', n);
				line.setAttribute('x2', n);
				line.setAttribute('y1', '-5');
				line.setAttribute('y2', '160');
				minorGrid.append(line);
			});

		const majorGrid = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		majorGrid.setAttribute('stroke', '#000');
		majorGrid.setAttribute('stroke-dasharray', '2.5');
		majorGrid.setAttribute('stroke-dashoffset', '2.5');
		field.append(majorGrid);

		Array.from(Array(4).keys())
			.map(n => (n + 1) * 50)
			.forEach(n => {
				const line = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', n);
				line.setAttribute('x2', n);
				line.setAttribute('y1', '-5');
				line.setAttribute('y2', '160');
				majorGrid.append(line);
			});

		const bars = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		bars.setAttribute('fill', '#0f0');
		bars.setAttribute('fill-opacity', '0.8');
		bars.setAttribute('transform', 'translate(25,10) scale(1,10)');
		svg.append(bars);

		Array.from(Array(16).keys())
			.forEach(n => {
				const bar = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'rect');
				bar.setAttribute('y', n);
				bar.setAttribute('width', 100);
				bar.setAttribute('height', 1);
				bar.innerHTML = `<title>${samplesPerValue}</title>`;
				bars.append(bar);
			});

		const targetBars = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		targetBars.setAttribute('fill', '#00f');
		targetBars.setAttribute('fill-opacity', '0.5');
		targetBars.setAttribute('transform', 'translate(25,17.5)');
		svg.append(targetBars);

		Array.from(Array(16).keys())
			.map(n => n * 10)
			.forEach(n => {
				const bar = svg.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'rect');
				bar.setAttribute('y', n);
				bar.setAttribute('width', 100);
				bar.setAttribute('height', 2.5);
				targetBars.append(bar);
			});

		const axis = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
		axis.setAttribute('x1', '25');
		axis.setAttribute('x2', '25');
		axis.setAttribute('y1', '5');
		axis.setAttribute('y2', '170');
		axis.setAttribute('stroke', '#000');
		axis.setAttribute('stroke-linecap', 'square');
		svg.append(axis);

		const labels = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		labels.setAttribute('font-size', '8px');
		labels.setAttribute('text-anchor', 'end');
		labels.setAttribute('transform', 'translate(20,20)');
		Array.from(Array(16).keys())
			.forEach(n => {
				const label = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'text');
				label.setAttribute('y', n * 10);
				label.textContent = n;
				labels.append(label);
			});
		svg.append(labels);

		const ellipsis = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		ellipsis.setAttribute('transform', 'translate(125,185)');
		ellipsis.innerHTML = `
			<circle r="1.5" cy="-7.5"/>
			<circle r="1.5" cy="0"/>
			<circle r="1.5" cy="7.5"/>
		`;
		svg.append(ellipsis);

		parent.append(svg);
	}

	#_container;
	#_element;

	constructor(parent) {
		const fragment = parent.ownerDocument.createDocumentFragment();

		this.#_container = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.#_container.setAttribute('version', '1.1');
		this.#_container.setAttribute('width', '500');
		this.#_container.setAttribute('height', '1030');
		this.#_container.setAttribute('viewBox', '0 0 500 1030');
		fragment.append(this.#_container);

		this.#drawChartField();

		this.#_element = parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		this.#_element.setAttribute('fill-opacity', '0.8');
		this.#_element.setAttribute('transform', 'translate(25,10) scale(1,10)');
		this.#_container.append(this.#_element);

		this.#drawTargetBars();
		this.#drawAxes();
		this.#drawLabels();

		this.#drawNoDataBox();

		parent.append(fragment);
	}

	calculate(samples) {
		if (samples === undefined || samples === null) {
			this.#_element.replaceChildren();
			this.#drawNoDataBox();
		}
		else {
			const histogram = new Map();
			for (let i = srml_config.valueMinimum; i <= srml_config.valueMaximum; ++i)
				histogram.set(i, 0);

			samples.forEach(sample => histogram.set(sample, histogram.get(sample) + 1));

			for (const [value, count] of histogram.entries()) {
				const relativeDeviation = Math.min(1, Math.max(0, Math.abs(count - srml_config.samplesPerValue) / srml_config.samplesPerValue));
				const scaledDeviation = Math.round(255 * relativeDeviation);

				let r = '88';
				let g = '88';
				const b = '00';
				if (relativeDeviation > 0.5) {
					r = 'ff';
					g = ('00' + (255 - Math.min(255, Math.max(0, ((scaledDeviation - 127) * 2)))).toString(16)).slice(-2);
				}
				else {
					g = 'ff';
					r = ('00' + Math.min(255, Math.max(0, scaledDeviation * 2)).toString(16)).slice(-2);
				}

				histogram.set(value, [count, '#' + r + g + b]);
			}

			const bars = Array.from(histogram.entries())
				.map(([value, [count, colour]]) => {
					const bar = this.#_element.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'rect');
					bar.setAttribute('y', value - srml_config.valueMinimum);
					bar.setAttribute('width', count * (100 / srml_config.numberOfValues));
					bar.setAttribute('height', 1);
					bar.setAttribute('fill', colour);
					bar.innerHTML = `<title>${count}</title>`;
					return bar;
				});

			this.#_element.replaceChildren(...bars);

			this.#clearNoDataBox();
		}
	}

	#drawChartField() {
		const field = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		field.setAttribute('transform', 'translate(25,10)');
		this.#_container.append(field);

		field.innerHTML = '<rect width="200" height="1000" fill="#fff"/>';

		const gridMinor = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		gridMinor.setAttribute('stroke', '#000');
		gridMinor.setAttribute('stroke-dasharray', '2.5');
		gridMinor.setAttribute('stroke-dashoffset', '2.5');
		gridMinor.setAttribute('stroke-opacity', '0.5');

		Array.from(Array(20).keys())
			.filter(n => (n % 5) != 0)
			.map(n => n * 10)
			.forEach(n => {
				const line = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', n);
				line.setAttribute('x2', n);
				line.setAttribute('y1', '-5');
				line.setAttribute('y2', '1000');
				gridMinor.append(line);
			});

		const gridMajor = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		gridMajor.setAttribute('stroke', '#000');
		gridMajor.setAttribute('stroke-dasharray', '2.5');
		gridMajor.setAttribute('stroke-dashoffset', '2.5');

		Array.from(Array(4).keys())
			.map(n => (n + 1) * 50)
			.forEach(n => {
				const line = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', n);
				line.setAttribute('x2', n);
				line.setAttribute('y1', '-5');
				line.setAttribute('y2', '1000');
				gridMajor.append(line);
			});

		const ticks = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		ticks.setAttribute('stroke', '#000');
		ticks.setAttribute('stroke-linecap', 'square');

		Array.from(Array(4).keys())
			.map(n => (n + 1) * 50)
			.forEach(n => {
				const line = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', n);
				line.setAttribute('x2', n);
				line.setAttribute('y1', '1000');
				line.setAttribute('y2', '1005');
				ticks.append(line);
			});

		field.append(gridMinor, gridMajor, ticks);
	}

	#drawTargetBars() {
		const g = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		g.setAttribute('fill', '#00f');
		g.setAttribute('fill-opacity', '0.5');
		g.setAttribute('transform', 'translate(25,17.5)');
		this.#_container.append(g);

		Array.from(Array(100).keys())
			.map(n => n * 10)
			.forEach(n => {
				const bar = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'rect');
				bar.setAttribute('y', n);
				bar.setAttribute('width', 100);
				bar.setAttribute('height', 2.5);
				g.append(bar);
			});
	}

	#drawAxes() {
		const g = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		g.setAttribute('stroke', '#000');
		g.setAttribute('stroke-linecap', 'square');
		g.setAttribute('transform', 'translate(25,10)');
		g.innerHTML = `
			<line x1="0" x2="0" y1="-5" y2="1005"/>
			<line x1="0" x2="200" y1="1000" y2="1000"/>
		`;
		this.#_container.append(g);
	}

	#drawLabels() {
		const g = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		g.setAttribute('font-size', '8px');
		this.#_container.append(g);

		const hLabels = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		hLabels.setAttribute('text-anchor', 'middle');
		hLabels.setAttribute('transform', 'translate(25,1025)');
		const vLabels = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
		vLabels.setAttribute('text-anchor', 'end');
		vLabels.setAttribute('transform', 'translate(20, 20)');

		g.append(hLabels, vLabels);

		Array.from(Array(5).keys())
			.map(n => n * 50)
			.forEach(n => {
				const text = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'text');
				text.setAttribute('x', n);
				text.textContent = n;
				hLabels.append(text);
			});

		Array.from(Array(100).keys())
			.forEach(n => {
				const text = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'text');
				text.setAttribute('y', n * 10);
				text.textContent = n;
				vLabels.append(text);
			});
	}

	#drawNoDataBox() {
		if (!this.#_container.lastElementChild.classList.contains('no-data')) {
			const g = this.#_container.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
			g.setAttribute('class', 'no-data');
			g.setAttribute('transform', 'translate(125,515)');
			g.innerHTML = `
				<rect x="-75" y="-25" width="150" height="50" rx="10" ry="10" stroke="#f00" stroke-width="5" fill="#fff"/>
				<text y="9" font-size="25" font-weight="bold" text-anchor="middle">NO DATA</text>
			`;
			this.#_container.append(g);
		}
	}

	#clearNoDataBox() {
		if (this.#_container.lastElementChild.classList.contains('no-data'))
			this.#_container.lastElementChild.remove();
	}
};
