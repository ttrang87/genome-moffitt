export function openRowVisualizationWindow(track, position) {
    // Create the visualization HTML content
    const visualizationHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>${track.cellLine} Genomic Visualization</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }
        .header {
            background-color: #f4f4f4;
            padding: 10px 20px;
            border-bottom: 1px solid #ddd;
        }

        .first-title {
            display: flex;
            justify-content: space-between;
        }
        .visualization-container {
            width: 90%;
            max-width: 1200px;
            margin: 20px auto;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .controls {
            width: 50%;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .input-section, .highlight-row  {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .input-section input, .input-section button, .highlight-row input, .highlight-row button {
            padding: 5px;
            font-size: 12px;
            border-radius: 4px;
            border: 1px solid #ccc;
            flex: 1;
            margin-bottom: 10px;
        }

        .input-section button {
            border: none;
            background-color: #002D62;
            color: white;
            cursor: pointer;
        }
        .input-section button:hover {
            background-color:rgb(1, 28, 58);;
        }
        .highlight-section {
            display: flex
            flex-direction: column;
            gap: 4px
        }

        .highlight-row button {
            background-color:rgb(181, 54, 49);
            color: white;
        }
        .highlight-row button:hover {
            background-color:rgb(148, 36, 33);
        }
        
        .highlightTitle {
            font-size: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>${track.cellLine}</h2>
        <div class="first-title">
            <div>Tissue: ${track.tissue}</div>
             <!-- Update Position Section -->
            <div class="input-section">
                <input id="chromosomeInput" type="text" placeholder="Chromosome (e.g., chr8)" value="${position.split(':')[0]}" />
                <input id="startInput" type="number" placeholder="Start (e.g., 127735433)" value="${position.split(':')[1].split('-')[0]}" />
                <input id="endInput" type="number" placeholder="End (e.g., 127742951)" value="${position.split(':')[1].split('-')[1]}" />
                <button id="updateButton">Update Position</button>
            </div>
        </div>
    </div>
    <div class="controls">
        <div class="highlightTitle">Highlight Section</div>

        <!-- Highlight Ranges Section -->
        <div class="highlight-section" id="highlightSection">
            <button id="addHighlightButton">+ Add Highlight Range</button>
            <button id="highlightButton">Apply Highlights</button>
        </div>
    </div>
    <div id="visualization" class="visualization-container"></div>
    <script src="https://proteinpaint.stjude.org/bin/proteinpaint.js" charset="utf-8"></script>
    <script>
        let currentTrack = ${JSON.stringify(track)};
        let currentPosition = "${position}";

        // Function to update the visualization
        function updateVisualization() {
            const chromosome = document.getElementById('chromosomeInput').value.trim();
            const start = document.getElementById('startInput').value.trim();
            const end = document.getElementById('endInput').value.trim();

            if (chromosome && start && end) {
                currentPosition = \`\${chromosome}:\${start}-\${end}\`;
                document.getElementById('visualization').innerHTML = ""; // Clear previous visualization
                
                runproteinpaint({
                    host: "https://proteinpaint.stjude.org/",
                    holder: document.getElementById('visualization'),
                    parseurl: true,
                    block: true,
                    nobox: 1,
                    noheader: 1,
                    genome: "hg38",
                    position: currentPosition,
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
                        {
                            type: 'bigwig',
                            url: currentTrack.fileUrl,
                            name: currentTrack.cellLine
                        }
                    ]
                }).then(_ => {
                block = _.block; // Store the block object
            }).catch(error => {
                console.error("Error initializing ProteinPaint:", error);
            });;
            } else {
                alert('Please fill in all fields (Chromosome, Start Position, End Position).');
            }
        }

        // Function to apply highlights
        function applyHighlights() {
            const highlightRows = document.querySelectorAll('.highlight-row');
            if (block.hlregion && block.hlregion.lst) {
                block.hlregion.lst.forEach(hlRegion => {
                    if (hlRegion.rect && hlRegion.rect.remove) {
                        hlRegion.rect.remove();
                }
            });
        
            block.hlregion.lst = [];
            }
            

            highlightRows.forEach(row => {
                const chromosome = row.querySelector('.highlight-chr').value.trim();
                const start = row.querySelector('.highlight-start').value.trim();
                const end = row.querySelector('.highlight-end').value.trim();

                if (chromosome && start && end) {
                    try {
                        block.highlight_1basedcoordinate(\`\${chromosome}:\${start}-\${end}\`);
                    } catch (error) {
                        console.error(\`Error highlighting range \${chromosome}:\${start}-\${end}\`, error);
                    }
                }
            });
        }

        // Function to add a new highlight row
        function addHighlightRow() {
            const highlightSection = document.getElementById('highlightSection');
    
            const row = document.createElement('div');
            row.classList.add('highlight-row');

            const chromosomeInput = document.createElement('input');
            chromosomeInput.classList.add('highlight-chr');
            chromosomeInput.placeholder = 'Chromosome (e.g., chr8)';
            chromosomeInput.type = 'text';

            const startInput = document.createElement('input');
            startInput.classList.add('highlight-start');
            startInput.placeholder = 'Start (e.g., 127735433)';
            startInput.type = 'number';
            
            const endInput = document.createElement('input');
            endInput.classList.add('highlight-end');
            endInput.placeholder = 'End (e.g., 127742951)';
            endInput.type = 'number';

    // Create remove button
            const removeButton = document.createElement('button');
            removeButton.classList.add('remove-highlight-button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = () => {
                row.remove();
            };


    // Append the inputs and button to the row
            row.appendChild(chromosomeInput);
            row.appendChild(startInput);
            row.appendChild(endInput);
            row.appendChild(removeButton);

    // Insert the new row before the "Add Highlight" button
            highlightSection.insertBefore(row, highlightSection.querySelector('#addHighlightButton'));
    }

        // Attach event listeners
        document.getElementById('updateButton').addEventListener('click', updateVisualization);
        document.getElementById('addHighlightButton').addEventListener('click', addHighlightRow);
        document.getElementById('highlightButton').addEventListener('click', applyHighlights);

        // Initialize the visualization
        updateVisualization();
    </script>
</body>
</html>`;

    // Create a blob from the HTML content
    const blob = new Blob([visualizationHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Open the visualization in a new window
    const visualizationWindow = window.open(url, '_blank');

    // Clean up the blob URL when the window is closed
    visualizationWindow.onload = () => {
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 0);
    };
}
