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
 * Configuration for randomness demonstrations.
 *
 * On construction, the given document will be scanned. There must be a
 * `<meta>` element` with `name` attribute `srml.name`, and `content`
 * attribute containing the name of the demonstration.
 *
 * The demonstration name will be used to determine the name of a script
 * to run, which must populate `srml_config.dataContainer` with
 * `srml_config.numberOfSamples` elements, each of which must have an
 * attribute `data-saria-random-message-src`  with the value
 * `srml_config.dataSrc`.
 *
 * Then the actual random message loader script will be run, and the
 * results will be analyzed and displayed.
 */
export class srml_Config {
	static #configDefaults = new Map([
		// [name,                          [type,       default]       ]
		['main-container-selector',        ['selector', 'main']        ],
		['data-container-selector',        ['selector', null]          ],
		['show-stats',                     ['boolean',  true]          ],
		['show-histogram',                 ['boolean',  true]          ],
		['show-plot',                      ['boolean',  true]          ],
		['show-explanation',               ['boolean',  true]          ],
		['explanation-container-selector', ['selector', '#explanation']],
	]);

	static #extractMetadata(doc) {
		const meta = new Map(
			Array.from(srml_Config.#configDefaults.entries())
				.map(([name, [type, dfault]]) => [name, dfault])
		);

		doc.querySelectorAll(`meta[name^='srml.']`)
			.forEach(e => meta.set(...srml_Config.#parseMetadata(e.getAttribute('name').substring('srml.'.length), e.getAttribute('content'))));

		return meta;
	}

	static #parseMetadata(name, value) {
		if (srml_Config.#configDefaults.has(name)) {
			const type = srml_Config.#configDefaults.get(name)[0];
			switch (type) {
				case 'boolean':
					return [name, srml_Config.#parseMetadataBoolean(value, name)];
			}
		}

		return [name, value];
	}

	static #parseMetadataBoolean(value, name = undefined) {
		if (value !== null) {
			switch (typeof value) {
				case 'boolean':
					return value;
				case 'string':
					switch (value.toLowerCase()) {
						case 'true':
							return true;
						case 'false':
							return false;
						default:
							console.error(`malformed boolean value '${name}': ${value}`);
					}
					break;
				default:
					console.error(`not sure how to convert '${name}', which is a ${typeof value}, to boolean`);
			}
		}

		return null;
	}

	#name;

	#dataSrc = 'lib/data.txt';
	#dataValueMin = 0;
	#dataValueMax = 99;

	#samplesPerValue = 100;

	#mainContainer;
	#dataContainer;

	#showStats     = true;
	#showHistogram = true;
	#showPlot      = true;

	#showExplanation = true;
	#explanationContainer;

	/**
	 * @param {!Document} doc The demonstration document.
	 */
	constructor(doc) {
		const config = srml_Config.#extractMetadata(doc);

		// Configure demonstration name.
		if (!config.has('name'))
			throw new Error(`Required meta element 'srml.name' with the test name is missing.`);
		this.#name = config.get('name');

		// Configure demonstration output containers.
		this.#mainContainer = doc.querySelector(config.get('main-container-selector') ?? 'main') ?? document.body;

		this.#dataContainer = doc.querySelector(config.get('data-container-selector') ?? '#data');
		if (this.#dataContainer === null) {
			this.#dataContainer = doc.createElement('div');
			this.#dataContainer.setAttribute('hidden', 'true');
			doc.body.append(this.#dataContainer);
		}

		// Configure desired output flags.
		this.#showStats     = config.get('show-stats');
		this.#showHistogram = config.get('show-histogram');
		this.#showPlot      = config.get('show-plot');

		// Configure optional explanation generation.
		this.#showExplanation = config.get('show-explanation');
		if (this.#showExplanation)
			this.#explanationContainer = doc.querySelector(config.get('explanation-container-selector') ?? '#explanation');
	}

	/**
	 * The name of this demonstration.
	 *
	 * This is also the stem of the script that generates the sample
	 * data. For example, if `srml_config.name<` is `foo`, then the file
	 * `../foo.js` will be run.
	 * 
	 * This must be set by the `content` of a `<meta>` element in the
	 * document with `name` set to `srml.name`.
	 *
	 * @type {string}
	 * @readonly
	 */
	get name() { return this.#name; }

	/**
	 * The URL of the sample messages data that must be used.
	 *
	 * The data file contains numeric messages. The range of the numbers
	 * is [`srml_config.dataValueMinimum`,
	 * `srml_config.dataValueMaximum`].
	 *
	 * @type {string}
	 * @default 'lib/data.txt'
	 * @readonly
	 */
	get dataSrc() { return this.#dataSrc; }

	/**
	 * The minimum value of the sample values.
	 *
	 * @type {number}
	 * @default 0
	 * @readonly
	 */
	get dataValueMinimum() { return this.#dataValueMin; }
	/**
	 * The maximum value of the sample values.
	 *
	 * @type {number}
	 * @default 99
	 * @readonly
	 */
	get dataValueMaximum() { return this.#dataValueMax; }
	/**
	 * The number of different sample values.
	 *
	 * This will always be equal to
	 * “(`srml_config.dataValueMaximum` −
	 * `srml_config.dataValueMinimum`) + 1”.
	 *
	 * @type {number}
	 * @default 100
	 * @readonly
	 */
	get dataValueCount() { return (this.dataValueMaximum - this.dataValueMinimum) + 1; }

	/**
	 * The number of samples per sample value that should be generated.
	 *
	 * @type {number}
	 * @default 100
	 * @readonly
	 */
	get samplesPerValue() { return this.#samplesPerValue; }
	/**
	 * The total number of samples that should be generated.
	 *
	 * This will always be equal to
	 * “`srml_config.dataValueCount` ×
	 * `srml_config.samplesPerValue`”
	 *
	 * @type {number}
	 * @default 10000
	 * @readonly
	 */
	get sampleCount() { return this.dataValueCount * this.samplesPerValue; }

	/**
	 * A flag indicating whether to show the statistics of the generated
	 * sample data.
	 * 
	 * This can be set by a `<meta>` element with name
	 * `srml.show-stats`.
	 *
	 * @type {boolean}
	 * @default true
	 * @readonly
	 */
	get showStats()     { return this.#showStats; }
	/**
	 * A flag indicating whether to show the histogram of the generated
	 * sample data.
	 * 
	 * This can be set by a `<meta>` element with name
	 * `srml.show-histogram`.
	 *
	 * @type {boolean}
	 * @default true
	 * @readonly
	 */
	get showHistogram() { return this.#showHistogram; }
	/**
	 * A flag indicating whether to show the plot of the generated
	 * sample data.
	 * 
	 * This can be set by a `<meta>` element with name
	 * `srml.show-plot`.
	 *
	 * @type {boolean}
	 * @default true
	 * @readonly
	 */
	get showPlot()      { return this.#showPlot; }

	/**
	 * The demonstration page element that should contain the analysis
	 * information.
	 *
	 * If there is a `<meta>` element with name
	 * `srml.main-container-selector`, it should contain a CSS selector.
	 * It will be used on the document, and the first result will be
	 * selected.
	 *
	 * Otherwise (or if nothing matches the selector), the first
	 * `<main>` element will be used. If there is no `<main>` element,
	 * then the `<body>` element will be used.
	 *
	 * @type {!Element}
	 * @readonly
	 */
	get mainContainer() { return this.#mainContainer; }

	/**
	 * The demonstration page element that should contain the generated
	 * sample data.
	 *
	 * If there is a `<meta>` element with name
	 * `srml.data-container-selector`, it should contain a CSS selector.
	 * It will be used on the document, and the first result will be
	 * selected. If no selector was given, `#data` will be used.
	 * 
	 * If no matching element was found, then a new hidden `<div>` will
	 * be created in the `<body>`.
	 *
	 * @type {!Element}
	 * @readonly
	 */
	get dataContainer() { return this.#dataContainer; }

	/**
	 * A flag indicating whether to show explanations of the analyses
	 * generated.
	 * 
	 * This can be set by a `<meta>` element with name
	 * `srml.show-explanation`.
	 *
	 * @type {boolean}
	 * @default true
	 * @readonly
	 */
	get showExplanation() { return this.#showExplanation; }
	/**
	 * The demonstration page element that should contain the
	 * explanations.
	 * 
	 * If there is a `<meta>` element with name
	 * `explanation-container-selector`, it should contain a CSS
	 * selector. It will be used on the document, and the first result
	 * will be selected. If no selector was given, `#explanation` will
	 * be used.
	 * 
	 * If no matching element was found, this property will be
	 * `null`. In that case, if `srml_config.show_explanation` is
	 * `true`, a `<section>` element will be created, and appended to
	 * `srml_config.mainContainer`.
	 *
	 * @type {Element}
	 * @readonly
	 */
	get explanationContainer() { return this.#explanationContainer; }
};
