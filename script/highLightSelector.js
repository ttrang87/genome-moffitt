export function setupMultiRangeHighlighter(proteinpaintInstance) {
    // Container for the entire range selector
    const highlighterContainer = document.createElement('div');
    highlighterContainer.className = 'multi-range-highlighter-container';

    // Container for range rows
    const rangesContainer = document.createElement('div');
    rangesContainer.className = 'ranges-input-container';

    // Function to create a single range input row
    function createRangeRow(chr = 'chr8', start = '', end = '') {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'range-row';

        const chrInput = document.createElement('input');
        chrInput.type = 'text';
        chrInput.placeholder = 'Chr';
        chrInput.className = 'range-input';
        chrInput.value = chr;

        // Start position input
        const startInput = document.createElement('input');
        startInput.type = 'number';
        startInput.placeholder = 'Start';
        startInput.className = 'range-input';
        startInput.value = start;

        // End position input
        const endInput = document.createElement('input');
        endInput.type = 'number';
        endInput.placeholder = 'End';
        endInput.className = 'range-input';
        endInput.value = end;

        // Remove row button
        const removeButton = document.createElement('button');
        removeButton.textContent = '×';
        removeButton.className = 'remove-range-btn';
        removeButton.onclick = () => {
            rowContainer.remove();
            saveRangesToLocalStorage(); // Update localStorage when a row is removed
        };

        // Append inputs and remove button to row
        rowContainer.appendChild(chrInput);
        rowContainer.appendChild(startInput);
        rowContainer.appendChild(endInput);
        rowContainer.appendChild(removeButton);

        // Add event listeners to inputs to save to localStorage when changed
        chrInput.addEventListener('input', saveRangesToLocalStorage);
        startInput.addEventListener('input', saveRangesToLocalStorage);
        endInput.addEventListener('input', saveRangesToLocalStorage);

        return rowContainer;
    }

    // Function to save ranges to localStorage
    function saveRangesToLocalStorage() {
        const ranges = [];
        rangesContainer.querySelectorAll('.range-row').forEach(row => {
            const chrInput = row.children[0];
            const startInput = row.children[1];
            const endInput = row.children[2];

            ranges.push({
                chr: chrInput.value.trim(),
                start: startInput.value.trim(),
                end: endInput.value.trim(),
            });
        });

        localStorage.setItem('highlightRanges', JSON.stringify(ranges));
    }

    // Function to load ranges from localStorage
    function loadRangesFromLocalStorage() {
        const storedRanges = JSON.parse(localStorage.getItem('highlightRanges')) || [];
        storedRanges.forEach(range => {
            rangesContainer.appendChild(createRangeRow(range.chr, range.start, range.end));
        });
    }

    // Load initial ranges from localStorage if available
    loadRangesFromLocalStorage();

    // Add Range button
    const addRangeButton = document.createElement('button');
    addRangeButton.textContent = '+ Add Range';
    addRangeButton.className = 'add-range-btn';
    addRangeButton.onclick = () => {
        rangesContainer.appendChild(createRangeRow());
    };

    // Button container for add range and highlight
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'range-button-container';
    buttonContainer.appendChild(addRangeButton);

    // Highlight Ranges button
    const highlightButton = document.createElement('button');
    highlightButton.textContent = 'Highlight Ranges';
    highlightButton.className = 'highlight-ranges-btn';
    highlightButton.onclick = () => {
        // Clear previous highlights
        if (proteinpaintInstance.block.hlregion && proteinpaintInstance.block.hlregion.lst) {
            proteinpaintInstance.block.hlregion.lst.forEach(hlRegion => {
                if (hlRegion.rect && hlRegion.rect.remove) {
                    hlRegion.rect.remove();
            }
        });
    
        proteinpaintInstance.block.hlregion.lst = [];
        }
        rangesContainer.querySelectorAll('.range-row').forEach(row => {
            const chrInput = row.children[0];
            const startInput = row.children[1];
            const endInput = row.children[2];

            const chr = chrInput.value.trim();
            const start = startInput.value.trim();
            const end = endInput.value.trim();

            if (chr && start && end) {
                try {
                    // Use the .then() style highlighting
                    proteinpaintInstance.block.highlight_1basedcoordinate(`${chr}:${start}-${end}`);
                } catch (error) {
                    console.error(`Could not highlight range ${chr}:${start}-${end}:`, error);
                }
            }
        });

        // Save updated ranges to localStorage after highlighting
        saveRangesToLocalStorage();
    };

    buttonContainer.appendChild(highlightButton);

    // Assemble the highlighter
    highlighterContainer.appendChild(rangesContainer);
    highlighterContainer.appendChild(buttonContainer);

    // Add to visualization container
    const highlightSection = document.createElement('div');
    highlightSection.className = 'highlightSection';
    highlightSection.appendChild(highlighterContainer);

    const combineSection = document.querySelector('.combineSection');
    combineSection.appendChild(highlightSection);

    return {
        getHighlightRanges: () => {
            const ranges = [];
            rangesContainer.querySelectorAll('.range-row').forEach(row => {
                const chrInput = row.children[0];
                const startInput = row.children[1];
                const endInput = row.children[2];

                ranges.push({
                    chr: chrInput.value.trim(),
                    start: startInput.value.trim(),
                    end: endInput.value.trim(),
                });
            });
            return ranges;
        }
    };
}
