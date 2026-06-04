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
