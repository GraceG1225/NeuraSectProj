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
