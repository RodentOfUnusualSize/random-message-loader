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

export class srml_Stats {
	static sectionID = 'statistics';
	static sectionName = 'Statistics';

	static #noDataContent = '<span class="no-data">[no data]</span>';

	static generateExplanation(parent) {
		parent.appendChild(parent.ownerDocument.createElement('p'))
			.textContent = [
				'We expect that when messages are selected, they will be selected randomly, but uniformly.',
				'The expected results below are for a theoretically “perfect” run, where every message in the data source is used, and each is used exactly the same number of times.',
			].join(' ');

		const vMin = srml_config.valueMinimum;
		const vMax = srml_config.valueMaximum;

		const round = value => Math.round(value * 1000) / 1000;

		const stats = new srml_Stats(parent);
		stats.mean   = `${srml_Stats.#generateMeanEquation()} = ${srml_Stats.#generateMeanEquation(vMin, vMax)} = ${round(((vMax - vMin) / 2) + vMin)}`;
		stats.stddev = `${srml_Stats.#generateStddevEquation()} = ${srml_Stats.#generateStddevEquation(vMin, vMax)} = ${round(Math.sqrt((((vMax - vMin + 1)**2) - 1) / 12))}`;
		stats.mode   = 'There should be no mode.';
		stats.min    = vMin;
		stats.max    = vMax;
	}

	static #generateMeanEquation(vMin = undefined, vMax = undefined) {
		if (vMin === undefined || vMin === null)
			vMin = '<msub><mi>v</mi><mi>min</mi></msub>';
		else if (typeof vMin === 'number')
			vMin = `<mn>${vMin}</mn>`;

		if (vMax === undefined || vMax === null)
			vMax = '<msub><mi>v</mi><mi>max</mi></msub>';
		else if (typeof vMax === 'number')
			vMax = `<mn>${vMax}</mn>`;

		return `
			<math xmlns="http://www.w3.org/1998/Math/MathML">
				<mfrac>
					<mrow>${vMax}<mo>−</mo>${vMin}</mrow>
					<mn>2</mn>
				</mfrac>
				<mo>+</mo>
				${vMin}
			</math>
		`;
	}

	static #generateStddevEquation(vMin = undefined, vMax = undefined) {
		let n = `<mi>N</mi>`;
		if (vMin !== undefined && vMin !== null && vMax !== undefined && vMax !== null)
			n = `<mn>${vMax - vMin + 1}</mn>`;

		return `
			<math xmlns="http://www.w3.org/1998/Math/MathML">
				<msqrt>
					<mfrac>
						<mrow>
							<msup>
								${n}
								<mn>2</mn>
							</msup>
							<mo>−</mo>
							<mn>1</mn>
						</mrow>
						<mn>12</mn>
					</mfrac>
				</msqrt>
			</math>
		`;
	}

	#_mean;
	#_stddev;
	#_mode;
	#_min;
	#_max;
	#_container;
	#_meanElement;
	#_stddevElement;
	#_modeElement;
	#_minElement;
	#_maxElement;

	constructor(parent) {
		const fragment = parent.ownerDocument.createDocumentFragment();

		this.#_container = parent.ownerDocument.createElement('table');
		fragment.append(this.#_container);

		const tbody = parent.ownerDocument.createElement('tbody');
		this.#_container.append(tbody);

		[
			['Mean', 'mean'],
			['Standard deviation', 'stddev'],
			['Mode', 'mode'],
			['Minimum value', 'min'],
			['Maximum value', 'max'],
		].forEach(([name, field]) => {
			const tr = parent.ownerDocument.createElement('tr');
			tr.innerHTML = `<th>${name}</th>`;

			const td = parent.ownerDocument.createElement('td');
			td.innerHTML = srml_Stats.#noDataContent;
			tr.append(td);

			tbody.append(tr);

			eval('this.#_' + field + 'Element = td');
		});

		parent.append(fragment);
	}

	calculate(samples) {
		if (samples === undefined || samples === null || samples.length == 0) {
			this.mean.innerHTML = srml_Stats.#noDataContent;
			this.stddev.innerHTML = srml_Stats.#noDataContent;
			this.mode.innerHTML = srml_Stats.#noDataContent;
			this.min.innerHTML = srml_Stats.#noDataContent;
			this.max.innerHTML = srml_Stats.#noDataContent;
		}
		else {
			const sum = samples.reduce((a, b) => a + b);
			const mean = sum / samples.length;

			const sum_of_square_deviations = samples
				.map(sample => (sample - mean)**2)
				.reduce((a, b) => a + b);
			const variance = sum_of_square_deviations / samples.length;
			const stddev = Math.sqrt(variance);

			const min = Math.min(...samples);
			const max = Math.max(...samples);

			const modes = this.#calculateModes(samples, min, max);

			this.mean   = Math.round(mean * 1000) / 1000;
			this.stddev = Math.round(stddev * 1000) / 1000;
			this.mode   = (modes === null || modes.length === 0) ? 'no mode' : modes.join(', ');
			this.min    = min;
			this.max    = max;
		}
	}

	get mean()   { return this.#_mean; }
	get stddev() { return this.#_stddev; }
	get mode()   { return this.#_mode; }
	get min()    { return this.#_max; }
	get max()    { return this.#_min; }

	set mean(value)   { this.#setStat('mean', value); }
	set stddev(value) { this.#setStat('stddev', value); }
	set mode(value)   { this.#setStat('mode', value); }
	set min(value)    { this.#setStat('min', value); }
	set max(value)    { this.#setStat('max', value); }

	#setStat(name, value) {
		if (value === null || value === undefined)
			eval(`this.#_${name}Element.innerHTML = srml_Stats.#noDataContent;`);
		else
			eval(`this.#_${name}Element.innerHTML = value;`);

		eval(`this.#_${name} = value;`);
	}

	#calculateModes(samples, min, max) {
		// For each value from min to max, count the number of times it
		// appears in the sample data, then save the maximum count.
		const maxCount = (() => {
			let n = 0;
			for (let i = min; i <= max; ++i)
				n = Math.max(n, samples.filter(x => x === i).length);
			return n;
		})();

		// Find all the values in the sample data that appear maxCount
		// times.
		const modes = [];
		for (let i = min; i <= max; ++i) {
			if (samples.filter(x => x === i).length === maxCount) {
				// If there are too many modes, bail.
				if (modes.length >= 5)
					return null;

				modes.push(i);
			}
		}

		return modes;
	}
};
