import { openRowVisualizationWindow } from "./eachRowVisualize.js";
let currentData = [];
const ROWS_PER_PAGE = 25;
let visibleRows = ROWS_PER_PAGE;
let activeVisualizationTracks = [];

function shortenUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname + '...';
    } catch (e) {
        return url.substring(0, 30) + '...';
    }
}

function setupSearch() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'searchInput';
    searchInput.placeholder = 'Search by cell line...';
    searchInput.className = 'search-input';

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        const filteredData = currentData.filter((row, index) => {
            if (index === 0) return true;
            return row[0].toLowerCase().includes(searchTerm); // Search in first column (cell line)
        });
        createTable(filteredData, Math.min(filteredData.length, visibleRows));
    });

    searchContainer.appendChild(searchInput);
    document.querySelector('.upload-section').appendChild(searchContainer);
}

function loadData() {
    fetch('./data.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load file: ${response.status}`);
            }
            return response.text();
        })
        .then(content => {
            try {
                currentData = parseCSV(content);
                visibleRows = ROWS_PER_PAGE;
                createTable(currentData, visibleRows);
                setupSearch(); // Add search functionality
                activeVisualizationTracks = []; // Reset tracks
                updateVisualization(); // Clear visualization
            } catch (error) {
                console.error('Error occurred:', error);
                document.getElementById('tableContainer').innerHTML = 'Error: ' + error.message;
            }
        })
        .catch(error => {
            console.error('Error fetching the data file:', error);
            document.getElementById('tableContainer').innerHTML = 'Error: Could not load data file.';
        });
}

function parseCSV(content) {
    const lines = content.split('\n');
    return lines.map((line) =>
        line.split(',').map((cell) =>
            cell.replace(/^"|"$/g, '').trim()
        )
    );
}

// Call the function to load data from the CSV file
loadData();


function updateVisualization() {
    const visualizationContainer = document.getElementById('visualizationContainer');
    visualizationContainer.innerHTML = '';

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
                openRowVisualizationWindow(track);
            });


            const removeButton = document.createElement('button');
            removeButton.textContent = '×';
            removeButton.className = 'remove-track';
            removeButton.onclick = () => {
                const index = activeVisualizationTracks.indexOf(track);
                activeVisualizationTracks.splice(index, 1);
                updateVisualization(); // Refresh the entire visualization
            };

            trackItem.appendChild(trackName);
            trackItem.appendChild(removeButton);
            trackListContainer.appendChild(trackItem);
        });

        const ppContainer = document.createElement('div');

        visualizationContainer.appendChild(trackListContainer);
        visualizationContainer.appendChild(ppContainer);

        runproteinpaint({
            host: "https://proteinpaint.stjude.org/",
            holder: ppContainer,
            parseurl: true,
            block: true,
            nobox: 1,
            noheader: 1,
            genome: "hg38",
            position: "chr8:127735433-127742951",
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
        });
    }
}

function createTable(data, visibleRows) {
    if (!data || data.length === 0) return;

    const table = document.createElement('table');
    const headers = data[0];

    // Create header row
    const headerRow = document.createElement('tr');
    headers.forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Create data rows
    const tbody = document.createElement('tbody');
    const endIndex = Math.min(visibleRows, data.length - 1);

    for (let i = 1; i <= endIndex; i++) {
        if (data[i].length === 0) continue;

        const row = document.createElement('tr');
        const cellLine = data[i][0]; // First column is cell line
        const tissue = data[i][1]
        const bigwigLink = data[i][headers.length - 1];

        row.addEventListener('click', function () {
            // Add new track to visualization
            const newTrack = {
                cellLine: cellLine,
                tissue: tissue,
                fileUrl: bigwigLink
            };

            // Check if track already exists
            if (!activeVisualizationTracks.some(track => track.fileUrl === newTrack.fileUrl)) {
                activeVisualizationTracks.push(newTrack);
                updateVisualization();
            }
        });

        data[i].forEach((cell, cellIndex) => {
            const td = document.createElement('td');

            if (cellIndex === data[i].length - 1) {
                const linkContainer = document.createElement('div');
                linkContainer.className = 'link-container';

                const linkText = document.createElement('span');
                linkText.className = 'shortened-link';
                linkText.textContent = shortenUrl(cell);

                const linkIcon = document.createElement('span');
                linkIcon.className = 'external-link-icon';
                linkIcon.innerHTML = '🔗';
                linkIcon.title = 'Open in new tab';
                linkIcon.onclick = function (e) {
                    e.stopPropagation();
                    window.open(cell.replace(/['"]+/g, ''), '_blank');
                };

                linkContainer.appendChild(linkText);
                linkContainer.appendChild(linkIcon);
                td.appendChild(linkContainer);
            } else {
                td.textContent = cell;
            }

            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    const container = document.getElementById('tableContainer');
    container.innerHTML = '';
    container.appendChild(table);

    const buttonContainer = document.getElementById('buttonContainer');
    buttonContainer.innerHTML = '';

    if (visibleRows < data.length - 1) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.textContent = 'Show More';
        showMoreBtn.className = 'button';
        showMoreBtn.onclick = function () {
            visibleRows += ROWS_PER_PAGE;
            createTable(data, visibleRows);
        };
        buttonContainer.appendChild(showMoreBtn);
    }

    if (visibleRows > ROWS_PER_PAGE) {
        const hiddenBtn = document.createElement('button');
        hiddenBtn.textContent = 'Show Less';
        hiddenBtn.className = 'button';
        hiddenBtn.onclick = function () {
            visibleRows = Math.max(ROWS_PER_PAGE, visibleRows - ROWS_PER_PAGE);
            createTable(data, visibleRows);
        };
        buttonContainer.appendChild(hiddenBtn);
    }
}