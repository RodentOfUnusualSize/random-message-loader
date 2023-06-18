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

// Defaults.
const DEFAULT_SHOW_STATS = true;
const DEFAULT_SHOW_HISTOGRAM = true;
const DEFAULT_SHOW_PLOT = true;
const DEFAULT_SHOW_EXPLANATION = true;
const DEFAULT_DATA_SRC = 'data.txt';
const DEFAULT_DATA_VALUES = 100;
const DEFAULT_SAMPLES_PER_VALUE = 100;


class srml_Stats {
	#_fragment;
	#_mean;
	#_stddev;
	#_mode;
	#_min;
	#_max;

	constructor(doc = undefined) {
		if (doc === undefined)
			doc = document;

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

			const th = doc.createElement('th');
			th.textContent = name;

			const td = doc.createElement('td');

			const span = doc.createElement('span');
			span.setAttribute('class', 'no-data');
			td.append(span);

			tr.append(th, td);

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

		const mean = Math.round(((vMax - vMin) / 2) * 1000) / 1000;
		this.#_mean.innerHTML = `
			<math xmlns="http://www.w3.org/1998/Math/MathML">
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
				<mo>=</mo>
				<mfrac>
					<mrow>
						<mn>${vMax}</mn>
						<mo>−</mo>
						<mn>${vMin}</mn>
					</mrow>
					<mn>2</mn>
				</mfrac>
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


class srml_Histogram {
}


class srml_Plot {
	#_fragment;
	#_element;
	#_svg;
	#_vMin;
	#_vMax;
	#_samples;

	constructor(doc, numValues, samplesPerValue, vMin = undefined, vMax = undefined) {
		if (vMin === undefined)
			vMin = 0;
		if (vMax === undefined)
			vMax = (numValues - 1) + vMin;

		if ((vMax - vMin + 1) !== numValues)
			throw new Error(`incorrect number of values in range [${vMin},${vMax}]: ${vMax - vMin} (expected ${numValues})`);

		this.#_vMin = vMin;
		this.#_vMax = vMax;

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

		this.#_element = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
		this.#_element.setAttribute('stroke', '#f00');
		this.#_element.setAttribute('stroke-width', '0.25');
		this.#_element.setAttribute('fill', 'none');
		this.#_element.setAttribute('transform', 'translate(40,410) scale(0.1,-4)');
		this.#_element.setAttribute('stroke', '#f00');

		this.#_svg.append(this.#_element);

		this.#_fragment.append(this.#_svg);

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
			this.#_samples = null;
			this.#_element.replaceChildren();

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
				this.#_samples = Array.from(Array(data).keys())
					.map(index => [index, Math.floor(Math.random() * (this.#_vMax - this.#_vMin + 1) + this.#_vMin)]);
			}
			else {
				this.#_samples = data
					.map((value, index) => ((typeof value === 'number') ? [index, value] : [value[0], value[1]]));
			}

			const e = this.#_element.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			e.setAttribute('vector-effect', 'non-scaling-stroke');

			const points = this.#_samples.map(([index, value]) => index + ',' + value).join(' ');
			e.setAttribute('points', points);

			this.#_element.replaceChildren(e);

			if (this.#_svg.lastElementChild.classList.contains('no-data'))
				this.#_svg.lastElementChild.remove();
		}
	}
};


// Determine whether the required properties already exist.
[
	'srml_src',
	'srml_values',
	'srml_samples',
	'srml_dataContainer',
	'srml_statsMeanElement',
	'srml_statsStddevElement',
	'srml_statsModeElement',
	'srml_statsMinElement',
	'srml_statsMaxElement',
	'srml_histogramElement',
	'srml_plotElement',
].forEach(prop => {
	if (prop in globalThis)
		throw new Error(`property ${prop} already exists`);
});

// Get the configuration.
const getConfiguration = (name, type) => {
	if (('currentScript' in document) && (document.currentScript !== null)) {
		const value = document.currentScript.getAttribute(`data-${name}`);
		if (value !== null) {
			switch (type) {
				case 'int':
					return parseInt(value);
				case 'boolean':
					return (value === 'true');
				case undefined:
					return value;
			}
		}
	}
};

const showStats = getConfiguration('show-stats', 'boolean') ?? DEFAULT_SHOW_STATS;
const showHistogram = getConfiguration('show-histogram', 'boolean') ?? DEFAULT_SHOW_HISTOGRAM;
const showPlot = getConfiguration('show-plot', 'boolean') ?? DEFAULT_SHOW_PLOT;
const showExplanation = getConfiguration('show-plot', 'boolean') ?? DEFAULT_SHOW_PLOT;
const dataSrc = getConfiguration('data-src') ?? DEFAULT_DATA_SRC;
const dataValues = getConfiguration('data-values', 'int') ?? DEFAULT_DATA_VALUES;
const samplesPerValue = getConfiguration('samples-per-value', 'int') ?? DEFAULT_SAMPLES_PER_VALUE;
const numberOfSamples = samplesPerValue * dataValues;

// Validate configuration.

// Initialize info about data.
Object.defineProperty(globalThis, 'srml_src', () => 'data.txt', 'get');
Object.defineProperty(globalThis, 'srml_values', () => 100, 'get');


// Create explanations /////////////////////////////////////////////////
if (showExplanation) {
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

	if (showStats && (document.getElementById('stats-explanation') === null)) {
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

		const stats = new srml_Stats();
		stats.fillInExampleInfo(dataValues);

		section.append(stats.fragment);

		explanation.append(section);
	}

	if (showHistogram && (document.getElementById('histogram-explanation') === null)) {
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
				<rect y="0" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="1" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="2" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="3" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="4" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="5" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="6" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="7" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="8" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="9" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="10" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="11" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="12" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="13" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="14" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
				<rect y="15" width="100" height="1" fill="#00ff00"><title>${samplesPerValue}</title></rect>
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

	if (showPlot && (document.getElementById('plot-explanation') === null)) {
		const section = document.createElement('section');
		section.setAttribute('id', 'plot-explanation');

		section.appendChild(document.createElement('h3'))
			.textContent = 'Plot';

		section.appendChild(document.createElement('p'))
			.textContent = 'The plot of the messages selected should look like noise (specifically: white noise), similar to:';

		const plotRandom = new srml_Plot(document, dataValues, samplesPerValue);
		plotRandom.samples = dataValues * samplesPerValue;
		section.append(plotRandom.fragment);

		section.appendChild(document.createElement('p'))
			.textContent = 'Any sort of pattern in the plot indicates a problem with the random number generation.';

		section.appendChild(document.createElement('p'))
			.textContent = 'For example, the following plot would suggest that only a single message, message #25, is always being selected:';

		const plotConst = new srml_Plot(document, dataValues, samplesPerValue);
		plotConst.samples = [ [0, 25], [dataValues * samplesPerValue, 25] ];
		section.append(plotConst.fragment);

		section.appendChild(document.createElement('p'))
			.textContent = 'The following plot would suggest that messages are being selected sequentially:';

		const plotSeq = new srml_Plot(document, dataValues, samplesPerValue);

		const plotSeqSamples = [];
		for (let i = 0; i < samplesPerValue; ++i) {
			plotSeqSamples.push([i * dataValues, plotSeq.vMin]);
			plotSeqSamples.push([(i + 1) * dataValues, plotSeq.vMax]);
		}

		plotSeq.samples = plotSeqSamples;

		section.append(plotSeq.fragment);

		explanation.append(section);
	}
}
