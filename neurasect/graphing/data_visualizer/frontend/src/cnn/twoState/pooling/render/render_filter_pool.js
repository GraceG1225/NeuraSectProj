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

 import { update_conv_window } from "../interactions/interactions_conv.js";

// Pooling hover logic extracted from render_filter
export const poolHoverHandlers = {
    mouseover(event, d, ctx) {
        const {
            filter,
            g,
            outputGroup,
            poolWindow,
            outputSquare,
            stride,
            poolShape
        } = ctx;

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

        // Update expression window
        update_pool_window(poolWindow, windowValues);

        // Highlight max
        const maxVal = highlight_max_in_pool(poolWindow, windowValues);

        // Update output square
        update_output_square(outputSquare, maxVal);

        // Highlight kernel window + output cell
        highlight_kernel_window(g, startRow, startCol, poolShape);
        highlight_output_cell(outputGroup, outRow, outCol);
    },

    mouseout(event, d, ctx) {
        const { g, outputGroup } = ctx;
        clear_kernel_highlight(g);
        clear_output_highlight(outputGroup);
    }
};

export const convHoverHandlers = {
    mouseover(event, d, ctx) {
        const {
            filter,            // input filter
            g,                 // input filter group
            outputGroup,       // output filter group
            exprWindow,        // conv expression window group
            outputSquare,      // conv expression output square
            stride,            // stride value
            kernelSize,        // [kRows, kCols]
            kernelWeights      // 2D array of kernel weights
        } = ctx;

        const [kRows, kCols] = kernelSize;
        const strideVal = stride;

        // Compute stride-aligned top-left of kernel window
        const startRow = Math.floor(d.row / strideVal) * strideVal;
        const startCol = Math.floor(d.col / strideVal) * strideVal;

        // Check if the kernel window fits inside the input
        const windowFits =
            startRow + kRows <= filter.shape[0] &&
            startCol + kCols <= filter.shape[1];

        if (!windowFits) {
            clear_kernel_highlight(g);
            clear_output_highlight(outputGroup);
            update_conv_window(exprWindow, [], [], []); // clear expression
            update_output_square(outputSquare, "");
            return;
        }

        // Compute output cell coordinates
        const outRow = Math.floor(startRow / strideVal);
        const outCol = Math.floor(startCol / strideVal);

        // Extract activation window + compute products
        const activations = [];
        const weights = [];
        const products = [];

        let sum = 0;

        for (let r = 0; r < kRows; r++) {
            for (let c = 0; c < kCols; c++) {
                const act = filter.values[startRow + r][startCol + c];
                const w = kernelWeights[r][c];
                const prod = act * w;

                activations.push(Math.round(act * 1000) / 1000);
                weights.push(Math.round(w * 1000) / 1000);
                products.push(Math.round(prod * 1000) / 1000);

                sum += prod;
            }
        }

        sum = Math.round(sum * 1000) / 1000;

        // Update expression window
        update_conv_window(exprWindow, activations, weights, products);

        // Update output square
        update_output_square(outputSquare, sum);

        // Highlight kernel window + output cell
        highlight_kernel_window(g, startRow, startCol, kernelSize);
        highlight_output_cell(outputGroup, outRow, outCol);
    },

    mouseout(event, d, ctx) {
        const { g, outputGroup, exprWindow, outputSquare } = ctx;

        clear_kernel_highlight(g);
        clear_output_highlight(outputGroup);

        // Clear expression window
        update_conv_window(exprWindow, [], [], []);
        update_output_square(outputSquare, "");
    }
};



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

    // pooling
    poolShape = null,
    stride = null,
    outputGroup = null,
    poolWindow = null,
    outputSquare = null,

    // conv + hover
    hoverHandlers = null,
    kernelSize = null,
    kernelWeights = null,
    exprWindow = null,

    // NEW
    info = null
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
        .attr("stroke-width", 0.5);

    // Build context object for hover handlers
    const context = {
        filter,
        g,
        layout,

        // pooling
        outputGroup,
        poolWindow,
        outputSquare,
        stride,
        poolShape,

        // conv
        kernelSize,
        kernelWeights,
        exprWindow
    };

    console.log("ATTACHING:", hoverHandlers);


    // If info object exists, override fields
    if (info) {
        if (info.poolSize) context.poolShape = info.poolSize;
        if (info.kernelSize) context.kernelSize = info.kernelSize;
        if (info.kernelWeights) context.kernelWeights = info.kernelWeights;
        if (info.stride) context.stride = info.stride;

        // pooling
        if (info.expr?.window && info.type === "maxpool2d")
            context.poolWindow = info.expr.window;

        // convolution
        if (info.expr?.window && info.type === "conv2d")
            context.exprWindow = info.expr.window;

        if (info.expr?.outputSquare)
            context.outputSquare = info.expr.outputSquare;

        if (info.outputGroup)
            context.outputGroup = info.outputGroup;
    }

    console.log("CONTEXT exprWindow:", context.exprWindow);


    // Attach hover handlers if provided
    if (hoverHandlers && className === "input-filter") {
        g.selectAll("rect." + classCell)
            .on("mouseover", (event, d) => hoverHandlers.mouseover(event, d, context))
            .on("mouseout", (event, d) => hoverHandlers.mouseout(event, d, context));
    }

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