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

////////////////////////////////////////////////////////////////////////
// Configuration ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

class srml_Config {
	showStats = true;
	showHistogram = true;
	showPlot = true;
	showExplanation = true;
	dataSrc = 'data.txt';
	dataValues = 100;
	samplesPerValue = 100;
	mainContainer;
	dataContainer;

	constructor(doc) {
		const getBoolAttribute = (name, dfault = undefined) => {
			const val = doc.currentScript?.getAttribute(name);
			if (val === null)
				return dfault;

			switch (val.toLowerCase()) {
				case 'true':
					return true;
				case 'false':
					return false;
			}

			console.log(`Malformed boolean attribute '${name}': ${val}`);
			return undefined;
		};

		const getIntAttribute = (name, dfault = undefined) => {
			const val = doc.currentScript?.getAttribute(name);
			if (val === null)
				return dfault;

			const n = parseInt(val);
			if (!isNaN(n))
				return n;

			console.log(`Malformed integer attribute '${name}': ${val}`);
			return undefined;
		};

		this.showStats = getBoolAttribute('data-show-stats', this.showStats);
		this.showHistogram = getBoolAttribute('data-show-histogram', this.showHistogram);
		this.showPlot = getBoolAttribute('data-show-plot', this.showPlot);
		this.showExplanation = getBoolAttribute('data-show-explanation', this.showExplanation);

		this.dataSrc = doc.currentScript?.getAttribute('data-src') ?? this.dataSrc;
		this.dataValues = getIntAttribute('data-values', this.dataValues);

		this.samplesPerValue = getIntAttribute('data-samples-per-value', this.samplesPerValue);

		this.mainContainer = doc.querySelector(doc.currentScript?.getAttribute('data-main-container-selector') ?? 'main') ?? doc.body;

		this.dataContainer = doc.querySelector(doc.currentScript?.getAttribute('data-data-container-selector') ?? '#srml-data');
		if (this.dataContainer === undefined || this.dataContainer === null) {
			this.dataContainer = doc.createElement('div');
			this.dataContainer.setAttribute('hidden', 'true');
			doc.body.append(this.dataContainer);
		}
	}

	get numberOfSamples() {
		return this.dataValues * this.samplesPerValue;
	}
}


// Initialize the configuration information.
globalThis.srml_config = new srml_Config(document);


////////////////////////////////////////////////////////////////////////
// Statistics //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

class srml_Stats {
	#_fragment;
	#_mean;
	#_stddev;
	#_mode;
	#_min;
	#_max;

	constructor(doc) {
		this.#_fragment = doc.createDocumentFragment();

		const table = doc.createElement('table');
		const tbody = doc.createElement('tbody');

		[
			['Mean', 'mean'],
			['Standard deviation', 'stddev'],
			['Mode', 'mode'],
			['Minimum value', 'min'],
			['Maximum value', 'max'],
		].forEach(([name, field]) => {
			const tr = doc.createElement('tr');
			tr.innerHTML = `<th>${name}</th>`;

			const td = doc.createElement('td');
			td.innerHTML = '<span class="no-data">[no data]</span>';
			tr.append(td);

			tbody.append(tr);

			eval('this.#_' + field + ' = td');
		});

		table.append(tbody);
		this.#_fragment.append(table);
	}

	get fragment() {
		return this.#_fragment;
	}

	get mean() {
		return this.#_mean;
	}

	get stddev() {
		return this.#_stddev;
	}

	get mode() {
		return this.#_mode;
	}

	get min() {
		return this.#_min;
	}

	get max() {
		return this.#_max;
	}

	setIDs() {
		this.#_mean.setAttribute('id', 'stats-mean');
		this.#_stddev.setAttribute('id', 'stats-stddev');
		this.#_mode.setAttribute('id', 'stats-mode');
		this.#_min.setAttribute('id', 'stats-min');
		this.#_max.setAttribute('id', 'stats-max');
	}

	fillInExampleInfo(numberOfValues, vMin = undefined, vMax = undefined) {
		if (vMin === undefined)
			vMin = 0;
		if (vMax === undefined)
			vMax = (numberOfValues - 1) + vMin;

		const mean = Math.round((((vMax - vMin) / 2) + vMin) * 1000) / 1000;
		this.#_mean.innerHTML = `
			<math xmlns="http://www.w3.org/1998/Math/MathML">
				<mrow>
					<mfrac>
						<mrow>
							<msub>
								<mi>v</mi>
								<ms>max</ms>
							</msub>
							<mo>−</mo>
							<msub>
								<mi>v</mi>
								<ms>min</ms>
							</msub>
						</mrow>
						<mn>2</mn>
					</mfrac>
					<mo>+</mo>
					<msub>
						<mi>v</mi>
						<ms>min</ms>
					</msub>
				</mrow>
				<mo>=</mo>
				<mrow>
					<mfrac>
						<mrow>
							<mn>${vMax}</mn>
							<mo>−</mo>
							<mn>${vMin}</mn>
						</mrow>
						<mn>2</mn>
					</mfrac>
					<mo>+</mo>
					<mn>${vMin}</mn>
				</mrow>
				<mo>=</mo>
			</math>
			${mean}`;

		const stddev = Math.round(Math.sqrt(((numberOfValues**2) - 1) / 12) * 1000) / 1000;
		this.#_stddev.innerHTML = `
			<math xmlns="http://www.w3.org/1998/Math/MathML">
				<msqrt>
					<mfrac>
						<mrow>
							<msup>
								<mi>N</mi>
								<mn>2</mn>
							</msup>
							<mo>−</mo>
							<mn>1</mn>
						</mrow>
						<mn>12</mn>
					</mfrac>
				</msqrt>
				<mo>=</mo>
				<msqrt>
					<mfrac>
						<mrow>
							<msup>
								<mn>${numberOfValues}</mn>
								<mn>2</mn>
							</msup>
							<mo>−</mo>
							<mn>1</mn>
						</mrow>
						<mn>12</mn>
					</mfrac>
				</msqrt>
				<mo>≅</mo>
			</math>
			${stddev}`;

		this.#_mode.textContent = 'There should be no mode.';

		this.#_min.textContent = vMin;
		this.#_max.textContent = vMax;
	}
}


////////////////////////////////////////////////////////////////////////
// Histogram ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

class srml_Histogram {
	constructor(doc) {
	}

	setIDs() {
	}
}


////////////////////////////////////////////////////////////////////////
// Plot ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

class srml_Plot {
	#_fragment;
	#_element;
	#_svg;
	#_vMin;
	#_vMax;
	#_samples;

	constructor(doc, numValues, samplesPerValue, vMin = undefined, vMax = undefined) {
		// Determine the range of values for the value axis of the plot.
		if (vMin === undefined)
			vMin = 0;
		if (vMax === undefined)
			vMax = (numValues - 1) + vMin;

		if ((vMax - vMin + 1) !== numValues)
			throw new Error(`incorrect number of values in range [${vMin},${vMax}]: ${vMax - vMin} (expected ${numValues})`);

		this.#_vMin = vMin;
		this.#_vMax = vMax;

		// Create the plot chart.
		this.#_fragment = doc.createDocumentFragment();

		this.#_svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.#_svg.setAttribute('version', '1.1');
		this.#_svg.setAttribute('width', 545);
		this.#_svg.setAttribute('height', 215);
		this.#_svg.setAttribute('viewBox', '0 0 1090 430');

		this.#_svg.innerHTML = `
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

		this.#_fragment.append(this.#_svg);

		// Create the actual plot container element.
		this.#_element = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
		this.#_element.setAttribute('stroke', '#f00');
		this.#_element.setAttribute('stroke-width', '0.25');
		this.#_element.setAttribute('fill', 'none');
		this.#_element.setAttribute('transform', 'translate(40,410) scale(0.1,-4)');
		this.#_element.setAttribute('stroke', '#f00');

		this.#_svg.append(this.#_element);

		// Start with no samples (an empty plot).
		this.samples = null;
	}

	get fragment() {
		return this.#_fragment;
	}

	get element() {
		return this.#_element;
	}

	get vMin() {
		return this.#_vMin;
	}

	get vMax() {
		return this.#_vMax;
	}

	get numberOfValues() {
		return (this.#_vMax - this.#_vMin) + 1;
	}

	get samples() {
		return this.#_samples;
	}

	set samples(data) {
		if (data === undefined || data === null) {
			// The sample data given was nullish, so there is no
			// sample data.

			// Clear out the plot.
			this.#_samples = null;
			this.#_element.replaceChildren();

			// Add the “no data” marker.
			if (!this.#_svg.lastElementChild.classList.contains('no-data')) {
				const e = this.#_fragment.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g');
				e.setAttribute('class', 'no-data');
				e.setAttribute('transform', 'translate(545,215)');

				e.innerHTML = `
					<rect x="-150" y="-50" width="300" height="100" rx="20" ry="20" stroke="#f00" stroke-width="10" fill="#fff"/>
					<text y="18" font-size="50" font-weight="bold" text-anchor="middle">NO DATA</text>'
				`;

				this.#_svg.append(e);
			}
		}
		else {
			if (typeof data === 'number') {
				// The sample data given was a single number, so
				// interpret that as the number of samples to randomly
				// generate.
				this.#_samples = Array.from(Array(data).keys())
					.map(index => [index, Math.floor(Math.random() * (this.#_vMax - this.#_vMin + 1) + this.#_vMin)]);
			}
			else {
				// The sample data given is assumed to be an iterable
				// of some kind.
				//
				// If each element of the iterable is a single number,
				// assume it is a value, and combine it with its index.
				//
				// Otherwise, assume the element is an iterable with at
				// least two elements: an index and a value.
				this.#_samples = Array.from(data)
					.map((value, index) => ((typeof value === 'number') ? [index, value] : [value[0], value[1]]));
			}

			// Create the plot element.
			const e = this.#_element.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			e.setAttribute('vector-effect', 'non-scaling-stroke');

			// Transform the samples to a string of points.
			const points = this.#_samples.map(([index, value]) => index + ',' + value).join(' ');
			e.setAttribute('points', points);

			// Replace any existing plot with this one.
			this.#_element.replaceChildren(e);

			// If there is a “no data” marker, remove it.
			if (this.#_svg.lastElementChild.classList.contains('no-data'))
				this.#_svg.lastElementChild.remove();
		}
	}

	setIDs() {
		this.#_element.setAttribute('id', 'plot-data');
	}
};


////////////////////////////////////////////////////////////////////////
// Information sections ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

[
	[srml_config.showStats, 'statistics', 'Statistics', srml_Stats, []],
	[srml_config.showHistogram, 'histogram', 'Histogram', srml_Histogram, []],
	[srml_config.showPlot, 'plot', 'Plot', srml_Plot, [srml_config.dataValues, srml_config.samplesPerValue]],
].forEach(([flag, id, title, className, args]) => {
	if (flag) {
		const section = document.createElement('section');
		section.setAttribute('id', id);

		section.appendChild(document.createElement('h2'))
			.innerHTML = title;

		const obj = new className(document, ...args);
		obj.setIDs();
		section.append(obj.fragment);

		srml_config.mainContainer.append(section);
	}
});

////////////////////////////////////////////////////////////////////////
// Explanations ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

if (srml_config.showExplanation) {

	// Create explanations container element, if necessary.

	if (document.getElementById('explanation') === null) {
		const section = document.createElement('section');
		section.setAttribute('id', 'explanation');

		section.appendChild(document.createElement('h2'))
			.textContent = 'Explanation';

		const main = document.body.querySelector('main');
		if (main !== null)
			main.append(section);
		else
			document.body.append(section);
	}

	const explanation = document.getElementById('explanation');

	// Create statistics explanation.

	if (srml_config.showStats && (document.getElementById('stats-explanation') === null)) {
		const section = document.createElement('section');
		section.setAttribute('id', 'stats-explanation');

		section.appendChild(document.createElement('h3'))
			.textContent = 'Statistics';

		section.appendChild(document.createElement('p'))
			.textContent =
				'We expect that when messages are selected, '
				+ 'they will be selected randomly, but uniformly. '
				+ 'The expected results below are for a theoretically '
				+ '“perfect” run, where every message in the '
				+ 'data source is used, and each is used exactly the '
				+ 'same number of times.'
			;

		const stats = new srml_Stats(document);
		stats.fillInExampleInfo(srml_config.dataValues);

		section.append(stats.fragment);

		explanation.append(section);
	}

	// Create histogram explanation.

	if (srml_config.showHistogram && (document.getElementById('histogram-explanation') === null)) {
		const section = document.createElement('section');
		section.setAttribute('id', 'histogram-explanation');

		section.appendChild(document.createElement('h3'))
			.textContent = 'Histogram';

		section.appendChild(document.createElement('p'))
			.textContent = 'We expect that when messages are selected, '
				+ 'they will be selected randomly, but uniformly. '
				+ 'If the number of samples is a multiple of the '
				+ 'number of values, then in a theoretically “perfect” '
				+ 'run, there should be an equal number of instances '
				+ 'of each value';

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('version', '1.1');
		svg.setAttribute('width', '500');
		svg.setAttribute('height', '200');
		svg.setAttribute('viewBox', '0 0 500 200');
		svg.innerHTML =
			`<g transform="translate(25,10)">
				<rect width="200" height="160" fill="#fff"/>
				<g stroke="#000" stroke-dasharray="2.5" stroke-dashoffset="2.5" stroke-opacity="0.5">
					<line x1="10" x2="10" y1="-5" y2="160"/>
					<line x1="20" x2="20" y1="-5" y2="160"/>
					<line x1="30" x2="30" y1="-5" y2="160"/>
					<line x1="40" x2="40" y1="-5" y2="160"/>
					<line x1="60" x2="60" y1="-5" y2="160"/>
					<line x1="70" x2="70" y1="-5" y2="160"/>
					<line x1="80" x2="80" y1="-5" y2="160"/>
					<line x1="90" x2="90" y1="-5" y2="160"/>
					<line x1="110" x2="110" y1="-5" y2="160"/>
					<line x1="120" x2="120" y1="-5" y2="160"/>
					<line x1="130" x2="130" y1="-5" y2="160"/>
					<line x1="140" x2="140" y1="-5" y2="160"/>
					<line x1="160" x2="160" y1="-5" y2="160"/>
					<line x1="170" x2="170" y1="-5" y2="160"/>
					<line x1="180" x2="180" y1="-5" y2="160"/>
					<line x1="190" x2="190" y1="-5" y2="160"/>
				</g>
				<g stroke="#000" stroke-dasharray="2.5" stroke-dashoffset="2.5">
					<line x1="50" x2="50" y1="-5" y2="160"/>
					<line x1="100" x2="100" y1="-5" y2="160"/>
					<line x1="150" x2="150" y1="-5" y2="160"/>
					<line x1="200" x2="200" y1="-5" y2="160"/>
				</g>
			</g>
			<g transform="translate(25,10) scale(1,10)" fill-opacity="0.8">
				<rect y="0" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="1" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="2" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="3" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="4" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="5" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="6" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="7" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="8" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="9" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="10" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="11" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="12" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="13" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="14" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
				<rect y="15" width="100" height="1" fill="#00ff00"><title>${srml_config.samplesPerValue}</title></rect>
			</g>
			<g transform="translate(25,15)">
				<use href="#histogram-default-bar" y="0"/>
				<use href="#histogram-default-bar" y="10"/>
				<use href="#histogram-default-bar" y="20"/>
				<use href="#histogram-default-bar" y="30"/>
				<use href="#histogram-default-bar" y="40"/>
				<use href="#histogram-default-bar" y="50"/>
				<use href="#histogram-default-bar" y="60"/>
				<use href="#histogram-default-bar" y="70"/>
				<use href="#histogram-default-bar" y="80"/>
				<use href="#histogram-default-bar" y="90"/>
				<use href="#histogram-default-bar" y="100"/>
				<use href="#histogram-default-bar" y="110"/>
				<use href="#histogram-default-bar" y="120"/>
				<use href="#histogram-default-bar" y="130"/>
				<use href="#histogram-default-bar" y="140"/>
				<use href="#histogram-default-bar" y="150"/>
			</g>
			<g stroke="#000" stroke-linecap="square" transform="translate(25,10)">
				<line x1="0" x2="0" y1="-5" y2="160"/>
			</g>
			<g font-size="8px">
				<g text-anchor="end" transform="translate(20,20)">
					<text y="0">0</text>
					<text y="10">1</text>
					<text y="20">2</text>
					<text y="30">3</text>
					<text y="40">4</text>
					<text y="50">5</text>
					<text y="60">6</text>
					<text y="70">7</text>
					<text y="80">8</text>
					<text y="90">9</text>
					<text y="100">10</text>
					<text y="110">11</text>
					<text y="120">12</text>
					<text y="130">13</text>
					<text y="140">14</text>
					<text y="150">15</text>
				</g>
			</g>
			<g transform="translate(125,185)">
				<circle r="1.5" cy="-7.5"/>
				<circle r="1.5" cy="0"/>
				<circle r="1.5" cy="7.5"/>
			</g>`;

		section.append(svg);

		explanation.append(section);
	}

	// Create plot explanation.

	if (srml_config.showPlot && (document.getElementById('plot-explanation') === null)) {
		const section = document.createElement('section');
		section.setAttribute('id', 'plot-explanation');

		section.appendChild(document.createElement('h3'))
			.textContent = 'Plot';

		// Create example plot of truly random data.

		section.appendChild(document.createElement('p'))
			.textContent = 'The plot of the messages selected should look like noise (specifically: white noise), similar to:';

		const plotRandom = new srml_Plot(document, srml_config.dataValues, srml_config.samplesPerValue);
		plotRandom.samples = srml_config.numberOfSamples;
		section.append(plotRandom.fragment);

		// Create example plot of a constant value.

		section.appendChild(document.createElement('p'))
			.textContent = 'Any sort of pattern in the plot indicates a problem with the random number generation.';

		section.appendChild(document.createElement('p'))
			.textContent = 'For example, the following plot would suggest that only a single message, message #25, is always being selected:';

		const plotConst = new srml_Plot(document, srml_config.dataValues, srml_config.samplesPerValue);
		plotConst.samples = [ [0, 25], [srml_config.numberOfSamples - 1, 25] ];
		section.append(plotConst.fragment);

		// Create example plot of sequentially-selected values.

		section.appendChild(document.createElement('p'))
			.textContent = 'The following plot would suggest that messages are being selected sequentially:';

		const plotSeq = new srml_Plot(document, srml_config.dataValues, srml_config.samplesPerValue);

		const plotSeqSamples = [];
		for (let i = 0; i < srml_config.samplesPerValue; ++i) {
			plotSeqSamples.push([i * plotSeq.numberOfValues, plotSeq.vMin]);
			plotSeqSamples.push([(i + 1) * plotSeq.numberOfValues, plotSeq.vMax]);
		}

		plotSeq.samples = plotSeqSamples;

		section.append(plotSeq.fragment);

		explanation.append(section);
	}
}
