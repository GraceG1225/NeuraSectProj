import { 
    highlight_output_cell,
    clear_kernel_highlight,
    clear_output_highlight,
    highlight_kernel_window
} from "../interactions/interactions_filter_pool.js";

import { 
    update_pool_window,
    update_output_square,
    highlight_max_in_pool
 } from "../interactions/interactions_expression_pool.js";

/*
 * Renders input and output filters
 * svg: Parent node that filter will be appended to
 * filter: Filter object
 * layout: layout data for each cell
 * {}: extra fields
 * 
 * CELL:
          row,
          col,
          value: filter.values[row][col],
          x: col * (cellSize + padding),
          y: row * (cellSize + padding),
          width: cellSize,
          height: cellSize

 * LAYOUT: 
        width: cols * (cellSize + padding), // width of filter element
        height: rows * (cellSize + padding), // height of filter element
        cellSize, // Size of each cell
        padding, // padding
        cells // cell array
 * 
 */
function render_filter(svg, filter, layout, {
    x = 0,
    y = 0,
    className = "filter",
    classCell = "cell",
    fill = "#e0e0e0",
    stroke = "#999",
    poolShape = null,
    stride = null,
    outputGroup = null,
    poolWindow = null,
    outputSquare = null
} = {}) {        

    // Create group
    const g = svg.append("g")
        .attr("class", className)
        .attr("transform", `translate(${x}, ${y})`);

    // Draw cells
    g.selectAll("rect.cell")
      .data(layout.cells)
      .enter()
      .append("rect")
        .attr("class", classCell)
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .attr("fill", fill)
        .attr("stroke", stroke)
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            if (className !== "input-filter") return;

            const [kRows, kCols] = poolShape;
            const strideVal = stride;

            // Compute stride-aligned top-left
            const startRow = Math.floor(d.row / strideVal) * strideVal;
            const startCol = Math.floor(d.col / strideVal) * strideVal;

            // Check if the window fits inside the input
            const windowFits =
                startRow + kRows <= filter.shape[0] &&
                startCol + kCols <= filter.shape[1];

            if (!windowFits) {
                // Hovered cell cannot produce a valid pooling window
                clear_output_highlight(outputGroup);
                clear_kernel_highlight(g);
                return;
            }

            // Compute output cell
            const outRow = Math.floor(startRow / strideVal);
            const outCol = Math.floor(startCol / strideVal);

            // Collect window values
            const windowValues = [];
            for (let r = 0; r < kRows; r++) {
                for (let c = 0; c < kCols; c++) {
                    const raw = filter.values[startRow + r][startCol + c];
                    const rounded = Math.round(raw * 1000) / 1000;
                    windowValues.push(rounded);
                }
            }

            console.log(windowValues);
            

            update_pool_window(poolWindow, windowValues);
            const maxVal = highlight_max_in_pool(poolWindow, windowValues);
            update_output_square(outputSquare, maxVal);

            highlight_kernel_window(g, startRow, startCol, poolShape);
            highlight_output_cell(outputGroup, outRow, outCol);
        })
        .on("mouseout", () => {
        if (className === "input-filter") {
            clear_kernel_highlight(g);
            clear_output_highlight(outputGroup);
        }
        });

    return { group: g, layout };
}

/*
 * Renders an input filter. Calls universal filter renderer
 * svg: Parent selection
 * inputFilter: Input filter object
 * layout: Layout and coordinates of each cell in filter
 * options: Extra fields used for further layout
 */
export function render_input_filter(svg, inputFilter, layout, options = {}) {
  return render_filter(svg, inputFilter, layout, {
    ...options,
    className: "input-filter",
    classCell: "input-cell",
    fill: "#830000",
    stroke: "black"
  });
}

/* 
 * Renders an output (pooling) filter. Calls universal filter renderer
 * svg: Parent selection
 * outputFilter: Output (pooling) filter object
 * layout: Layout and coordinates of each cell in filter
 * options: Extra fields used for further layout
*/
export function render_output_filter(svg, outputFilter, layout, options = {}) {
    // Call universal renderer
    return render_filter(svg, outputFilter, layout, {
        ...options, // Extra fields
        className: "output-filter", // Class name for filter object
        classCell: "output-cell", // Class name for each cell object
        fill: "#e0e0e0", // Cell color (white)
        stroke: "#999" // Cell stroke
    });
}