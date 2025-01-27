import { setupMultiRangeHighlighter } from "./highLightSelector.js";
import { setupPositionInput } from "./positionInput.js";
import { openRowVisualizationWindow } from "./eachRowVisualize.js";

// Function to update the visualization
export function updateVisualization(activeVisualizationTracks, position) {
    const visualizationContainer = document.getElementById('visualizationContainer');
    visualizationContainer.innerHTML = '';

    const combineSection = document.createElement('div');
    combineSection.className = 'combineSection';
    const positionCombine = setupPositionInput(activeVisualizationTracks); // Create the position input form

    if (activeVisualizationTracks.length > 0) {
        const trackListContainer = document.createElement('div');
        trackListContainer.className = 'track-list';

        // Add track names
        activeVisualizationTracks.forEach(track => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';

            const trackName = document.createElement('span');
            trackName.textContent = `${track.cellLine}`;
            trackName.className = 'track-name'; // Add this line
            trackName.addEventListener('click', function () {
                const newPosition = localStorage.getItem('position');
                openRowVisualizationWindow(track, newPosition);
            });

            const removeButton = document.createElement('button');
            removeButton.textContent = '×';
            removeButton.className = 'remove-track';
            removeButton.onclick = () => {
                const index = activeVisualizationTracks.indexOf(track);
                activeVisualizationTracks.splice(index, 1);
                const newPosition = localStorage.getItem('position');
                updateVisualization(activeVisualizationTracks, newPosition); // Pass highlightState when refreshing
            };

            trackItem.appendChild(trackName);
            trackItem.appendChild(removeButton);
            trackListContainer.appendChild(trackItem);
        });

        const ppContainer = document.createElement('div');
        combineSection.appendChild(trackListContainer);
        combineSection.appendChild(positionCombine);
        visualizationContainer.appendChild(combineSection);
        visualizationContainer.appendChild(ppContainer);

        runproteinpaint({
            host: "https://proteinpaint.stjude.org/",
            holder: ppContainer,
            parseurl: true,
            block: true,
            nobox: 1,
            noheader: 1,
            genome: "hg38",
            position: position, // Use the provided position
            nativetracks: "RefGene",
            tracks: [
                {
                    __isgene: true,
                    translatecoding: true,
                    categories: {
                        coding: { color: '#004D99', label: 'Coding gene' },
                        nonCoding: { color: '#009933', label: 'Noncoding gene' },
                        problem: { color: '#FF3300', label: 'Problem' },
                        pseudo: { color: '#FF00CC', label: 'Pseudogene' }
                    },
                    type: 'bedj',
                    name: 'GENCODE v34',
                    stackheight: 16,
                    stackspace: 1,
                    vpad: 4,
                    file: 'anno/gencode.v34.hg38.gz'
                },
                ...activeVisualizationTracks.map(track => ({
                    type: 'bigwig',
                    url: track.fileUrl,
                    name: `${track.cellLine}`
                }))
            ],
        }).then((instance) => {
            // Setup multi-range highlighter with highlightState
                setupMultiRangeHighlighter(instance);
        });
    }
}
