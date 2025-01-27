import { updateVisualization } from "./visualize.js";

// Default position values
let DEFAULT_CHROMOSOME = localStorage.getItem('DEFAULT_CHROMOSOME') || 'chr8';
let DEFAULT_START = localStorage.getItem('DEFAULT_START') || '127735433';
let DEFAULT_END = localStorage.getItem('DEFAULT_END') || '127742951';

// Function to set up the position input form
export function setupPositionInput(activeVisualizationTracks) {
    const positionInputContainer = document.createElement('div');
    positionInputContainer.className = 'range-row';

    // Chromosome Input
    const chromosomeInput = document.createElement('input');
    chromosomeInput.type = 'text';
    chromosomeInput.className = 'range-input';
    chromosomeInput.placeholder = 'chromosome e.g., chr8';
    chromosomeInput.value = DEFAULT_CHROMOSOME; // Set default value

    // Start Position Input
    const startInput = document.createElement('input');
    startInput.type = 'number';
    startInput.className = 'range-input';
    startInput.placeholder = 'start e.g., 127735433';
    startInput.value = DEFAULT_START; // Set default value

    // End Position Input
    const endInput = document.createElement('input');
    endInput.type = 'number';
    endInput.className = 'range-input';
    endInput.placeholder = 'end e.g., 127742951';
    endInput.value = DEFAULT_END; // Set default value

    // Update Button
    const updateButton = document.createElement('button');
    updateButton.textContent = 'Update Position';
    updateButton.className = 'add-range-btn';
    updateButton.onclick = () => {
        const chromosome = chromosomeInput.value;
        const start = startInput.value;
        const end = endInput.value;

        if (chromosome && start && end) {
            DEFAULT_CHROMOSOME = chromosome;
            DEFAULT_START = start;
            DEFAULT_END = end;

            localStorage.setItem('DEFAULT_CHROMOSOME', DEFAULT_CHROMOSOME);
            localStorage.setItem('DEFAULT_START', DEFAULT_START);
            localStorage.setItem('DEFAULT_END', DEFAULT_END);

            const newPosition = `${chromosome}:${start}-${end}`;
            localStorage.setItem('position', newPosition);
            updateVisualizationWithNewPosition(activeVisualizationTracks, newPosition);
        } else {
            alert('Please fill in all fields (Chromosome, Start Position, End Position).');
        }
    };

    // Append all elements to the container
    positionInputContainer.appendChild(chromosomeInput);
    positionInputContainer.appendChild(startInput);
    positionInputContainer.appendChild(endInput);

    const positionCombine = document.createElement('div');
    positionCombine.className = 'multi-range-highlighter-container'; //to use the same css style
    positionCombine.appendChild(positionInputContainer);
    positionCombine.appendChild(updateButton)

    return positionCombine;
}

// Function to update visualization with a new position
export function updateVisualizationWithNewPosition(activeVisualizationTracks, position) {
    // Assuming `activeVisualizationTracks` is accessible globally or passed as an argument
    updateVisualization(activeVisualizationTracks, position);
}