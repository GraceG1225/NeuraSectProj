import { layout_filter_window } from "./layout/layout_filter_pool.js";
import { layout_pool_expression } from "./layout/layout_expression_pool.js";
import { render_pooling_expression } from "./render/render_expression_pool.js";
import { render_output_filter, render_input_filter } from "./render/render_filter_pool.js";

export function inspect_filters(inputFilter, poolingFilter) {
    const [inRows, inCols] = inputFilter.shape;
    const [outRows, outCols] = poolingFilter.shape;
    const [kRows, kCols] = poolingFilter.poolSize;
    const [sRows, sCols] = poolingFilter.stride;

    // --- Case 5: Kernel larger than input ---
    if (kRows > inRows || kCols > inCols) {
        throw new Error(
            `Invalid pooling configuration: poolSize ${kRows}x${kCols} is larger than input ${inRows}x${inCols}.`
        );
    }


    if (inRows != inCols || outRows != outCols) {
        throw new Error (
            `Invalid filter configurations: Both filters must have respect, identical rows and columns`
        )
    }

    // --- Validate expected output shape ---
    const expectedOutRows = Math.floor((inRows - kRows) / sRows) + 1;
    const expectedOutCols = Math.floor((inCols - kCols) / sCols) + 1;

    if (expectedOutRows !== outRows || expectedOutCols !== outCols) {
        throw new Error(
            `Output shape mismatch: expected ${expectedOutRows}x${expectedOutCols}, got ${outRows}x${outCols}.`
        );
    }

    // --- Validate positive values ---
    if (kRows <= 0 || kCols <= 0 || sRows <= 0 || sCols <= 0) {
        throw new Error(`Invalid poolSize or stride: values must be positive.`);
    }

    // If we reach here, everything is valid
    return true;
}

// Helper function returns values that correspond to horizontal alignment of the three visual elements
function compute_three_panel_layout(svgWidth, leftWidth, centerWidth, rightWidth, gap = 80) {
    const totalWidth = leftWidth + centerWidth + rightWidth + gap * 2;

    const startX = (svgWidth - totalWidth) / 2;

    return {
      inputX: startX, // Input filter
      exprX: startX + leftWidth + gap, // Pooling operation visual
      outputX: startX + leftWidth + gap + centerWidth + gap // Output filter
    };
}

// Helper function returns values that correspond to vertical alignment of the three visual elements
export function compute_vertical_layout(svgHeight, inputHeight, centerHeight, outputHeight) {
    const inputY  = (svgHeight - inputHeight) / 2;
    const exprY = (svgHeight - centerHeight) / 2;
    const outputY = (svgHeight - outputHeight) / 2;

    return { inputY, exprY, outputY };
}

// Takes an input filter and resulting pooling filter to be compared. 
// Start for state 2 of pooling layers
// input: Input filter corresponding to preceding layer
// pooling: Output filter corresponding to the selected pooling layer
/*
    filterIndex: 0,
    type: "conv2d",
    shape: [6, 6],
    stride: [1, 1],
    kernelSize: [2, 2],
    numNeurons: 36,
    values: [
        [0.1, 0.5, 0.2, 0.9, 0.3, 0.7],
        [0.4, 0.8, 0.6, 0.1, 0.2, 0.5],
        [0.9, 0.3, 0.7, 0.4, 0.8, 0.6],
        [0.2, 0.1, 0.5, 0.9, 0.3, 0.4],
        [0.7, 0.6, 0.8, 0.2, 0.1, 0.9],
        [0.3, 0.4, 0.2, 0.5, 0.7, 0.8]
    ]
*/
export function render_pooling_state_2(input, pooling) {
    return new Promise(resolve => {

        const svg = d3.select("svg");
        const svgWidth = +svg.attr("width");
        const svgHeight = +svg.attr("height");        

        inspect_filters(input, pooling);

        const inputPreview = layout_filter_window(input, 300);
        const outputPreview = layout_filter_window(pooling, 300);
        const expressionPreview = layout_pool_expression(pooling.poolSize);

        const horizontalLayout = compute_three_panel_layout(
            svgWidth,
            inputPreview.width,
            expressionPreview.width,
            outputPreview.width
        );

        const verticalLayout = compute_vertical_layout(
            svgHeight,
            inputPreview.height,
            expressionPreview.height,
            outputPreview.height
        );

        const outputRender = render_output_filter(svg, pooling, outputPreview, {
            x: horizontalLayout.outputX,
            y: verticalLayout.outputY,
            maxWidth: 400
        });

        const poolExpression = render_pooling_expression(
            svg,
            expressionPreview,
            horizontalLayout.exprX,
            verticalLayout.exprY
        );

        console.log(input);
        

        const inputRender = render_input_filter(svg, input, inputPreview, {
            x: horizontalLayout.inputX,
            y: verticalLayout.inputY,
            maxWidth: 400,
            poolShape: pooling.poolSize,
            stride: pooling.stride[0],
            outputGroup: outputRender.group,
            poolWindow: poolExpression.poolWindow,
            outputSquare: poolExpression.outputSquare
        });

        resolve();
    });
}
