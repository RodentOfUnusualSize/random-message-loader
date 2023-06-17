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

function generateStats(samples) {
	const sum = samples.reduce((a, b) => a + b);
	const mean = sum / samples.length;

	const sum_of_square_deviations = samples
		.map(sample => (sample - mean)**2)
		.reduce((a, b) => a + b);
	const variance = sum_of_square_deviations / samples.length;
	const stddev = Math.sqrt(variance);

	const min = Math.min(...samples);
	const max = Math.max(...samples);

	const maxCount = (() => {
		let n = 0;
		for (let i = 0; i < 100; ++i)
			n = Math.max(n, samples.filter(x => x === i).length);
		return n;
	})();

	const modes = [];
	for (let i = 0; i < 100; ++i) {
		if (samples.filter(x => x === i).length === maxCount)
			modes.push(i);
	}

	const mode = (() => {
		if (modes.length > 5)
			return 'no mode';
		return modes.join(', ');
	})();

	document.getElementById('stats-mean').textContent = mean;
	document.getElementById('stats-stddev').textContent = stddev;
	document.getElementById('stats-mode').textContent = mode;
	document.getElementById('stats-min').textContent = min;
	document.getElementById('stats-max').textContent = max;
}


function generateHistogram(samples) {
	const histogram = new Map();
	for (let i = 0; i < 100; ++i)
		histogram.set(i, 0);

	samples.forEach(sample => histogram.set(sample, histogram.get(sample) + 1));

	for (const [value, count] of histogram.entries()) {
		const relativeDeviation = Math.min(1, Math.max(0, Math.abs(count - 100) / 100));
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

	const container = document.getElementById('histogram-data');

	for (let i = 0; i < 100; ++i) {
		const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		rect.setAttribute('y', i);
		rect.setAttribute('width', histogram.get(i)[0]);
		rect.setAttribute('height', 1);
		rect.setAttribute('fill', histogram.get(i)[1]);

		const text = document.createElementNS('http://www.w3.org/2000/svg', 'title');
		text.textContent = histogram.get(i)[0];

		rect.appendChild(text);

		container.appendChild(rect);
	}
}


function generatePlot(samples) {
	const container = document.getElementById('plot-data');

	const plot = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
	plot.setAttribute('vector-effect', 'non-scaling-stroke');

	const points = samples
		.map((value, n) => n + ',' + value)
		.join(' ');

	plot.setAttribute('points', points);

	container.appendChild(plot);
}


document.addEventListener('saria:random-message-loader:done', () => {
	const samples = [];

	// Read sample data.
	const dataDiv = document.getElementById('data');
	for (const element of dataDiv.children) {
		samples.push(parseInt(element.textContent));
	}

	// Delete the data for efficiency; we no longer need it.
	dataDiv.remove();

	generateStats(samples);
	generateHistogram(samples);
	generatePlot(samples);

	// Remove all “no data” markers.
	for (const element of document.querySelectorAll('.no-data'))
		element.remove();
});

import('../random-message-loader.js');
