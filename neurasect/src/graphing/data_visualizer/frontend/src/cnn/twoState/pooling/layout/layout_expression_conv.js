/*
 * Generates layout and coordinates of cells for a convolution kernel window.
 * kernelSize: [cols, rows]
 * offsetX, offsetY: top-left anchor
 * cellSize: increased to support two lines of text
 * padding: increased spacing between cells
 */
function layout_conv_window(kernelSize, offsetX = 0, offsetY = 0, cellSize = 40, padding = 6) {
    const [cols, rows] = kernelSize;
    const cells = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            cells.push({
                row,
                col,
                x: offsetX + col * (cellSize + padding),
                y: offsetY + row * (cellSize + padding),
                width: cellSize,
                height: cellSize
            });
        }
    }

    return {
        width: cols * (cellSize + padding),
        height: rows * (cellSize + padding),
        cellSize,
        padding,
        cells
    };
}

/*
 * Generates layout for the convolution expression:
 * [ kernel window ] = [ output square ]
 */
export function layout_conv_expression(kernelSize) {
    const equalsWidth = 6;
    const outputSquareWidth = 30;

    const gapBeforeEquals = 15;
    const gapBeforeOutput = 20;

    // Kernel window starts at x = 0
    const kernelX = 0;

    // Build kernel window layout
    const kernelWindow = layout_conv_window(kernelSize, kernelX, 0);

    // Equal sign position
    const equalsX = kernelX + kernelWindow.width + gapBeforeEquals;

    // Output square position
    const outputX = equalsX + equalsWidth + gapBeforeOutput;

    // Total expression dimensions
    const exprWidth = outputX + outputSquareWidth;
    const exprHeight = kernelWindow.height;

    return {
        width: exprWidth,
        height: exprHeight,

        kernelWindow, // contains cell coordinates

        equals: {
            x: equalsX,
            y: exprHeight / 2
        },

        outputSquare: {
            x: outputX,
            y: exprHeight / 2,
            size: outputSquareWidth
        }
    };
}
