/*
 * Generates layout and coordinates of cells pertaining to the pool window.
 * poolSize: Number of rows and columns pertaining to pool window
 * cellSize: Size of each cell
 * padding: space between each cell
 */
export function layout_pool_window(poolSize, offsetX = 0, offsetY = 0, cellSize = 30, padding = 4) {
    const [cols, rows] = poolSize;
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
 * Generates layout for the pooling expression and all related elements
 */
export function layout_pool_expression(poolSize) {
    const maxLabelWidth = 40;
    const closeParenWidth = 6;
    const equalsWidth = 6;
    const outputSquareWidth = 30;

    const gapAfterMax = 5;
    const gapBeforeEquals = 15;
    const gapBeforeOutput = 20;

    const maxX = 0;
    const poolX = maxLabelWidth + gapAfterMax;

    // Now the pool window is generated AT THE CORRECT X
    const pool = layout_pool_window(poolSize, poolX, 0);

    const closeParenX = poolX + pool.width;
    const equalsX = closeParenX + closeParenWidth + gapBeforeEquals;
    const outputX = equalsX + equalsWidth + gapBeforeOutput;

    const exprWidth = outputX + outputSquareWidth;
    const exprHeight = pool.height;

    return {
        width: exprWidth,
        height: exprHeight,

        maxLabel: { x: maxX, y: exprHeight / 2 },
        poolWindow: pool, // already has correct cell coordinates
        closeParen: { x: closeParenX, y: exprHeight / 2 },
        equals: { x: equalsX, y: exprHeight / 2 },
        outputSquare: { x: outputX, y: exprHeight / 2, size: outputSquareWidth }
    };
}

