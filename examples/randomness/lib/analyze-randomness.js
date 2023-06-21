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
// Initialize                                                         //
////////////////////////////////////////////////////////////////////////

import { srml_Config } from './class.config.js';

globalThis.srml_config = new srml_Config(document);

import { srml_Stats }     from './class.stats.js';
import { srml_Histogram } from './class.histogram.js';
import { srml_Plot }      from './class.plot.js';

const analysisModules = [
	['showStats',     srml_Stats,     'srml_stats'],
	['showHistogram', srml_Histogram, 'srml_histogram'],
	['showPlot',      srml_Plot,      'srml_plot'],
]
	.filter(([flag, className, configName]) => (flag in srml_config && srml_config[flag]))
	.map(([flag, className, configName]) => [className, configName]);


////////////////////////////////////////////////////////////////////////
// Create information sections                                        //
////////////////////////////////////////////////////////////////////////

analysisModules.forEach(([className, configName]) => {
	const section = srml_config.mainContainer.ownerDocument.createElement('section');
	section.setAttribute('id', className.sectionID);
	section.innerHTML = `<h2>${className.sectionName}</h2>`;

	globalThis[configName] = new className(section);

	srml_config.mainContainer.append(section);
});


////////////////////////////////////////////////////////////////////////
// Create explanation sections                                        //
////////////////////////////////////////////////////////////////////////

if (srml_config.showExplanation) {
	let container = srml_config.explanationContainer;
	if (container === null) {
		container = document.createElement('section');
		container.setAttribute('id', 'explanation');
		container.innerHTML = '<h2>Explanation</h2>';
		srml_config.mainContainer.append(container);
	}

	analysisModules.forEach(([className, configName]) => {
		const section = document.createElement('section');
		section.setAttribute('id', className.sectionID + '-explanation');
		section.innerHTML = `<h3>${className.sectionName}</h3>`;

		className.generateExplanation(section);

		container.append(section);
	});
}


////////////////////////////////////////////////////////////////////////
// Create analysis                                                    //
////////////////////////////////////////////////////////////////////////

document.addEventListener('saria:random-message-loader:done', () => {
	const samples = Array.from(srml_config.dataContainer.children)
		.map(element => parseInt(element.textContent));

	// Delete the data for efficiency; we no longer need it.
	srml_config.dataContainer.replaceChildren();

	analysisModules.forEach(([className, configName]) => {
		globalThis[configName].calculate(samples);
	});
});


////////////////////////////////////////////////////////////////////////
// Create sample data                                                 //
////////////////////////////////////////////////////////////////////////

import(`../${srml_config.name}.js`)
	.then(() => import('../../random-message-loader.js'));

