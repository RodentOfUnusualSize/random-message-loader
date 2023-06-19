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
 * On construction, the given document will be scanned. There must be an
 * attribute named <code>data-name</code> on the
 * <code>&lt;body&gt;</code> element containing the name of the
 * demonstration.
 *
 * The demonstration name will be used to determine the name of a script
 * to run, which must populate <code>srml_config.dataContainer</code>
 * with <code>srml_config.numberOfSamples</code> elements, each of which
 * must have an attribute <code>data-saria-random-message-src</code>
 * with the value <code>srml_config.dataSrc</code>.
 *
 * Then the actual random message loader script will be run, and the
 * results will be analyzed and displayed.
 */
export class srml_Config {
	static #_scriptName = 'analyze-randomness.js';

	static #_getCurrentScript(doc) {
		const candidates = Array.from(doc.querySelectorAll(`script[type=module][src$='${srml_Config.#_scriptName}']`))
			.filter(e => {
				const src = e.getAttribute('src');
				if (src.length === srml_Config.#_scriptName.length)
					return true;
				return ['/', '\\'].includes(src.at(-srml_Config.#_scriptName.length - 1));
			});

		if (candidates.length === 1)
			return candidates[0];

		throw new Error('Could not determine current script element.');
	}

	// Helper function to extract boolean-valued data attributes.
	static #_getBoolAttribute(element, name, dfault = undefined) {
		const value = element.getAttribute(name);
		if (value === null)
			return dfault;

		switch (value.toLowerCase()) {
			case 'true':
				return true;
			case 'false':
				return false;
		}

		console.error(`malformed boolean attribute '${name}': ${value}`);
		return undefined;
	}

	#_name;

	#_src = 'lib/data.txt';

	#_vMin = 0;
	#_vMax = 99;
	#_samplesPerValue = 100;

	#_showStats     = true;
	#_showHistogram = true;
	#_showPlot      = true;

	#_showExplanation = true;
	#_explanationContainer;

	#_mainContainer;

	#_dataContainer;

	/**
	 * @param {!Document} doc The demonstration document.
	 */
	constructor(doc) {
		const currentScript = srml_Config.#_getCurrentScript(doc);

		this.#_name = currentScript.getAttribute('data-name');
		if (this.#_name === undefined || this.#_name === null)
			throw new Error(`Required attribute 'data-name' with the test name is missing.`);

		this.#_showStats     = srml_Config.#_getBoolAttribute(currentScript, 'data-show-stats',     this.#_showStats);
		this.#_showHistogram = srml_Config.#_getBoolAttribute(currentScript, 'data-show-histogram', this.#_showHistogram);
		this.#_showPlot      = srml_Config.#_getBoolAttribute(currentScript, 'data-show-plot',      this.#_showPlot);

		this.#_mainContainer = doc.querySelector(currentScript.getAttribute('data-main-container-selector') ?? 'main') ?? document.body;

		this.#_dataContainer = doc.querySelector(currentScript.getAttribute('data-data-container-selector') ?? '#data');
		if (this.#_dataContainer === undefined || this.#_dataContainer === null) {
			this.#_dataContainer = doc.createElement('div');
			this.#_dataContainer.setAttribute('hidden', 'true');
			doc.body.append(this.#_dataContainer);
		}

		this.#_showExplanation = srml_Config.#_getBoolAttribute(currentScript, 'data-show-explanation', this.#_showExplanation);
		if (this.#_showExplanation)
			this.#_explanationContainer = doc.querySelector(currentScript.getAttribute('data-explanation-container-selector') ?? '#explanation');
	}

	/**
	 * The name of this demonstration.
	 *
	 * This is also the stem of the script that generates the sample
	 * data. For example, if <code>srml_config.name</code> is
	 * <code>'foo'</code>, then the file <code>'../foo.js'</code> will
	 * be run.
	 * 
	 * This must be set by the data attribute <code>'data-name'</code>
	 * on the <code>&lt;body&gt;</code> element.
	 *
	 * @type {string}
	 * @readonly
	 */
	get name() { return this.#_name; }

	/**
	 * The URL of the sample messages data that must be used.
	 *
	 * The data file contains numeric messages. The range of the numbers
	 * is [<code>srml_config.valueMinimum</code>,
	 * <code>srml_config.valueMaximum</code>].
	 *
	 * @type {string}
	 * @default 'lib/data.txt'
	 * @readonly
	 */
	get dataSrc() { return this.#_src; }

	/**
	 * The minimum value of the sample values.
	 *
	 * @type {number}
	 * @default 0
	 * @readonly
	 */
	get valueMinimum() { return this.#_vMin; }
	/**
	 * The maximum value of the sample values.
	 *
	 * @type {number}
	 * @default 99
	 * @readonly
	 */
	get valueMaximum() { return this.#_vMax; }
	/**
	 * The number of different sample values.
	 *
	 * This will always be equal to
	 * “(<code>srml_config.valueMaximum</code> −
	 * <code>srml_config.valueMinimum</code>) + 1”.
	 *
	 * @type {number}
	 * @default 100
	 * @readonly
	 */
	get numberOfValues() { return (this.#_vMax - this.#_vMin) + 1; }

	/**
	 * The number of samples per sample value that should be generated.
	 *
	 * @type {number}
	 * @default 100
	 * @readonly
	 */
	get samplesPerValue() { return this.#_samplesPerValue; }
	/**
	 * The total number of samples that should be generated.
	 *
	 * This will always be equal to
	 * “<code>srml_config.numberOfValues</code> ×
	 * <code>srml_config.samplesPerValue</code>”
	 *
	 * @type {number}
	 * @default 10000
	 * @readonly
	 */
	get numberOfSamples() { return this.numberOfValues * this.#_samplesPerValue; }

	/**
	 * A flag indicating whether to show the statistics of the generated
	 * sample data.
	 * 
	 * This can be set by the <code>'data-show-stats'</code> attribute
	 * on the <code>&lt;body&gt;</code> element.
	 *
	 * @type {boolean}
	 * @default true
	 * @readonly
	 */
	get showStats()     { return this.#_showStats; }
	/**
	 * A flag indicating whether to show the histogram of the generated
	 * sample data.
	 * 
	 * This can be set by the <code>'data-show-histogram'</code>
	 * attribute on the <code>&lt;body&gt;</code> element.
	 *
	 * @type {boolean}
	 * @default true
	 * @readonly
	 */
	get showHistogram() { return this.#_showHistogram; }
	/**
	 * A flag indicating whether to show the plot of the generated
	 * sample data.
	 * 
	 * This can be set by the <code>'data-show-plot'</code>
	 * attribute on the <code>&lt;body&gt;</code> element.
	 *
	 * @type {boolean}
	 * @default true
	 * @readonly
	 */
	get showPlot()      { return this.#_showPlot; }

	/**
	 * The demonstration page element that should contain the analysis
	 * information.
	 *
	 * If there is a data attribute
	 * <code>data-main-container-selector</code> on the
	 * <code>&lt;body&gt;</code> element, it should contain a CSS
	 * selector. It will be used on the document, and the first result
	 * will be selected.
	 *
	 * Otherwise (or if nothing matches the selector), the first
	 * <code>&lt;main&gt;</code> element will be used. If there is no
	 * <code>&lt;main&gt;</code> element, then the
	 * <code>&lt;body&gt;</code> element will be used.
	 *
	 * @type {!Element}
	 * @readonly
	 */
	get mainContainer() { return this.#_mainContainer; }

	/**
	 * The demonstration page element that should contain the generated
	 * sample data.
	 *
	 * If there is a data attribute
	 * <code>data-data-container-selector</code> on the
	 * <code>&lt;body&gt;</code> element, it should contain a CSS
	 * selector. It will be used on the document, and the first result
	 * will be selected. If no selector was given,
	 * <code>'#data'</code> will be used.
	 * 
	 * If no matching element was found, then a new hidden
	 * <code>&lt;div&gt;</code> will be created in the
	 * <code>&lt;body&gt;</code>.
	 *
	 * @type {!Element}
	 * @readonly
	 */
	get dataContainer() { return this.#_dataContainer; }

	/**
	 * A flag indicating whether to show explanations of the analyses
	 * generated.
	 * 
	 * This can be set by the <code>'data-show-explanation'</code>
	 * attribute on the <code>&lt;body&gt;</code> element.
	 *
	 * @type {boolean}
	 * @default true
	 * @readonly
	 */
	get showExplanation() { return this.#_showExplanation; }
	/**
	 * The demonstration page element that should contain the
	 * explanations.
	 *
	 * If there is a data attribute
	 * <code>data-explanation-container-selector</code> on the
	 * <code>&lt;body&gt;</code> element, it should contain a CSS
	 * selector. It will be used on the document, and the first result
	 * will be selected. If no selector was given,
	 * <code>'#explanation'</code> will be used.
	 * 
	 * If no matching element was found, this property will be
	 * <code>null</code>. In that case, if
	 * <code>srml_config.show_explanation</code> is <code>true</code>,
	 * a <code>&lt;section&gt;</code> element will be created, and
	 * appended to <code>srml_config.mainContainer</code>.
	 *
	 * @type {Element}
	 * @readonly
	 */
	get explanationContainer() { return this.#_explanationContainer; }
};
