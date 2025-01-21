// visualize.js
export function openRowVisualizationWindow(track) {
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
        .visualization-container {
            width: 90%;
            max-width: 1200px;
            margin: 20px auto;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .metadata {
            margin: 10px 20px;
            padding: 10px;
            background-color: #f8f8f8;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>${track.cellLine}</h2>
        <div>Tissue: ${track.tissue}</div>
    </div>
    <div id="visualization" class="visualization-container"></div>
    <script src="https://proteinpaint.stjude.org/bin/proteinpaint.js" charset="utf-8"></script>
    <script>
        runproteinpaint({
            host: "https://proteinpaint.stjude.org/",
            holder: document.getElementById('visualization'),
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
                {
                    type: 'bigwig',
                    url: "${track.fileUrl}",
                    name: "${track.cellLine}"
                }
            ]
        });
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