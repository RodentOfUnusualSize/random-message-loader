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

function getBoolAttribute(script, name, dfault = undefined) {
	const value = script.getAttribute(name) ?? null;
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

	constructor(doc) {
		const currentScript = srml_Config.#_getCurrentScript(doc);

		this.#_name = currentScript.getAttribute('data-name');
		if (this.#_name === undefined || this.#_name === null)
			throw new Error(`Required attribute 'data-name' with the test name is missing.`);

		this.#_showStats     = getBoolAttribute(currentScript, 'data-show-stats',     this.#_showStats);
		this.#_showHistogram = getBoolAttribute(currentScript, 'data-show-histogram', this.#_showHistogram);
		this.#_showPlot      = getBoolAttribute(currentScript, 'data-show-plot',      this.#_showPlot);

		this.#_mainContainer = doc.querySelector(currentScript.getAttribute('data-main-container-selector') ?? 'main') ?? document.body;

		this.#_dataContainer = doc.querySelector(currentScript.getAttribute('data-data-container-selector') ?? '#data');
		if (this.#_dataContainer === undefined || this.#_dataContainer === null) {
			this.#_dataContainer = doc.createElement('div');
			this.#_dataContainer.setAttribute('hidden', 'true');
			doc.body.append(this.#_dataContainer);
		}

		this.#_showExplanation = getBoolAttribute(currentScript, 'data-show-explanation', this.#_showExplanation);
		if (this.#_showExplanation)
			this.#_explanationContainer = doc.querySelector(currentScript.getAttribute('data-explanation-container-selector') ?? '#explanation');
	}

	get name() { return this.#_name; }

	get dataSrc() { return this.#_src; }

	get valueMinimum() { return this.#_vMin; }
	get valueMaximum() { return this.#_vMax; }
	get numberOfValues() { return (this.#_vMax - this.#_vMin) + 1; }

	get samplesPerValue() { return this.#_samplesPerValue; }
	get numberOfSamples() { return this.numberOfValues * this.#_samplesPerValue; }

	get showStats()     { return this.#_showStats; }
	get showHistogram() { return this.#_showHistogram; }
	get showPlot()      { return this.#_showPlot; }

	get mainContainer() { return this.#_mainContainer; }

	get dataContainer() { return this.#_dataContainer; }

	get showExplanation() { return this.#_showExplanation; }
	get explanationContainer() { return this.#_explanationContainer; }
};
