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

/**
 * Randomness demonstration statistical analysis module.
 */
export class srml_Stats {
	/**
	 * The ID to use for the section.
	 * @readonly
	 */
	static sectionID = 'statistics';
	/**
	 * The title to use for the section.
	 * @readonly
	 */
	static sectionName = 'Statistics';

	static #noDataContent = '<span class="no-data">[no data]</span>';

	/**
	 * Generates the explanation for this analysis module.
	 *
	 * @param {!Element} parent The element that will contain the
	 *                          generated analysis data.
	 */
	static generateExplanation(parent) {
		parent.appendChild(parent.ownerDocument.createElement('p'))
			.textContent = [
				'We expect that when messages are selected, they will be selected randomly, but uniformly.',
				'The expected results below are for a theoretically “perfect” run, where every message in the data source is used, and each is used exactly the same number of times.',
			].join(' ');

		const vMin = srml_config.dataValueMinimum;
		const vMax = srml_config.dataValueMaximum;

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

	#container;

	#meanElement;
	#stddevElement;
	#modeElement;
	#minElement;
	#maxElement;

	#mean;
	#stddev;
	#mode;
	#min;
	#max;

	/**
	 * Generates a statistical analysis.
	 *
	 * The analysis is generated in the `parent` element.
	 *
	 * The analysis is empty until `calculate()` is called with a set of
	 * sample data.
	 *
	 * @param {!Element} parent The element to generate the analysis in.
	 */
	constructor(parent) {
		const fragment = parent.ownerDocument.createDocumentFragment();

		this.#container = parent.ownerDocument.createElement('table');
		fragment.append(this.#container);

		const tbody = parent.ownerDocument.createElement('tbody');
		this.#container.append(tbody);

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

			eval('this.#' + field + 'Element = td');
		});

		parent.append(fragment);
	}

	/**
	 * Calculates a statistical analysis on the sample data, and outputs
	 * the results.
	 *
	 * Any previously calculated statistical analysis is cleared.
	 *
	 * If the sample data is empty (or `null` or `undefined`), no
	 * analysis is performed, and the output is populated with “no data”
	 * markers.
	 *
	 * @param {!Array<number>} samples The samples to perform the
	 *                                 analysis on.
	 */
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

	/**
	 * The mean of the calculated sample data, or `null` if there was no
	 * sample data.
	 * @type {?number}
	 */
	get mean()   { return this.#mean; }
	/**
	 * The standard deviation of the calculated sample data, or `null`
	 * if there was no sample data.
	 * @type {?number}
	 */
	get stddev() { return this.#stddev; }
	/**
	 * The mode or modes of the calculated sample data, or `null` if
	 * there was no sample data.
	 *
	 * The mode is returned as a string, with up to 5 modes separated by
	 * commas. If there were more than 5 modes in the sample data, or no
	 * mode at all, then the string `'no mode'` is returned.
	 *
	 * @type {?string}
	 */
	get mode()   { return this.#mode; }
	/**
	 * The minimum value of the sample data, or `null` if there was no
	 * sample data.
	 * @type {?number}
	 */
	get min()    { return this.#max; }
	/**
	 * The maximum value of the sample data, or `null` if there was no
	 * sample data.
	 * @type {?number}
	 */
	get max()    { return this.#min; }

	set mean(value)   { this.#setStat('mean', value); }
	set stddev(value) { this.#setStat('stddev', value); }
	set mode(value)   { this.#setStat('mode', value); }
	set min(value)    { this.#setStat('min', value); }
	set max(value)    { this.#setStat('max', value); }

	#setStat(name, value) {
		if (value === null || value === undefined)
			eval(`this.#${name}Element.innerHTML = srml_Stats.#noDataContent;`);
		else
			eval(`this.#${name}Element.innerHTML = value;`);

		eval(`this.#${name} = value;`);
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
