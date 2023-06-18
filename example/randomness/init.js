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
const DEFAULT_NUMBER_OF_SAMPLES = 10000;

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
	if (('currentScript' in document) && (currentScript !== null)) {
		const value = currentScript.getAttribute(`data-${name}`);
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
const numberOfSamples = getConfiguration('number-of-samples', 'int') ?? DEFAULT_NUMBER_OF_SAMPLES;

// Initialize info about data.
Object.defineProperty(globalThis, 'srml_src', () => 'data.txt', 'get');
Object.defineProperty(globalThis, 'srml_values', () => 100, 'get');
