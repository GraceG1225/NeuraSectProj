// Helper function computes size of cell considering number of columns, and max width of filter.
function compute_cell_size(numCols, maxWidth, padding = 1, minSize = 4, maxSize = 20) {
    const raw = (maxWidth - (numCols - 1) * padding) / numCols;
    return Math.max(minSize, Math.min(maxSize, Math.floor(raw)));
}

// Generates the layout and coordinates for the filter and its cells (neurons)
// filter: A filter object
// maxWidth: Maximum possible width of the filter visual element
// padding: Space between cells.
export function layout_filter_window(filter, maxWidth = 400, padding = 1) {
    // Num of columns and rows needed to represent each neuron
    const [cols, rows] = filter.shape; // e.g., [28, 28]
    // Computes cell size for each neuron
    const cellSize = compute_cell_size(cols, maxWidth, padding); 

    const cells = []; // Cell array

    // Nested for loop calculates position of each cell and saves information regarding each cell
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cells.push({
          row,
          col,
          value: filter.values[row][col],
          x: col * (cellSize + padding),
          y: row * (cellSize + padding),
          width: cellSize,
          height: cellSize
        });
      }
    }

    return {
      width: cols * (cellSize + padding), // width of filter element
      height: rows * (cellSize + padding), // height of filter element
      cellSize, // Size of each cell
      padding, // padding
      cells // cell array
    };
}