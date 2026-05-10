import { layout_filter_window } from "./layout/layout_filter_pool.js";
import { layout_pool_expression } from "./layout/layout_expression_pool.js";
import { layout_conv_expression } from "./layout/layout_expression_conv.js"
import { render_pool_expression } from "./render/render_expression_pool.js";
import { render_conv_expression } from "./render/render_expression_conv.js";
import { render_output_filter, render_input_filter, poolHoverHandlers, convHoverHandlers } from "./render/render_filter_pool.js";

function inspect_filters_conv(inputFilter, convFilter) {
    const [inRows, inCols] = inputFilter.shape;
    const [outRows, outCols] = convFilter.shape;
    const [kRows, kCols] = convFilter.kernelSize;
    const [sRows, sCols] = convFilter.stride;
    const padding = convFilter.padding || "valid"; // "valid" or "same"

    // --- Validate positive kernel + stride ---
    if (kRows <= 0 || kCols <= 0 || sRows <= 0 || sCols <= 0) {
        throw new Error(`Invalid kernelSize or stride: values must be positive.`);
    }

    // --- Validate square shapes (your renderer requires it) ---
    if (inRows !== inCols || outRows !== outCols) {
        throw new Error(
            `Invalid filter configurations: Both filters must have identical rows and columns.`
        );
    }

    // --- Compute expected output shape ---
    let expectedOutRows, expectedOutCols;

    if (padding === "valid") {
        expectedOutRows = Math.floor((inRows - kRows) / sRows) + 1;
        expectedOutCols = Math.floor((inCols - kCols) / sCols) + 1;
    }

    else if (padding === "same") {
        expectedOutRows = Math.ceil(inRows / sRows);
        expectedOutCols = Math.ceil(inCols / sCols);
    }

    else {
        throw new Error(`Unsupported padding type: ${padding}`);
    }

    // --- Validate output shape ---
    if (expectedOutRows !== outRows || expectedOutCols !== outCols) {
        throw new Error(
            `Conv output shape mismatch: expected ${expectedOutRows}x${expectedOutCols}, got ${outRows}x${outCols}.`
        );
    }

    // --- Validate kernel fits input for VALID padding ---
    if (padding === "valid" && (kRows > inRows || kCols > inCols)) {
        throw new Error(
            `Invalid conv configuration: kernel ${kRows}x${kCols} is larger than input ${inRows}x${inCols}.`
        );
    }

    return true;
}

function inspect_filters_pool(inputFilter, poolingFilter) {
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

function extractKernelWeights(convLayer, filterIndex) {
    const kernels = convLayer.kernels; // from generator
    const kernel3D = kernels[filterIndex]; // [kh][kw][in_ch]

    const inChannels = kernel3D[0][0].length;

    // Choose input channel:
    // - If filterIndex is within input channels, use it
    // - Otherwise fall back to channel 0
    const inputChannel = filterIndex < inChannels ? filterIndex : 0;

    // Convert 3D → 2D by slicing the chosen input channel
    const kernel2D = kernel3D.map(row =>
        row.map(cell => cell[inputChannel])
    );

    return kernel2D;
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
export function render_interactive_state_2(input, output, outputLayer = null) {
    return new Promise(resolve => {

        const svg = d3.select("svg");
        const svgWidth = +svg.attr("width");
        const svgHeight = +svg.attr("height");

        let expressionPreview = null;
        let expression = null;
        let info = {};

        // --- Branch by layer type ---
        if (output.type === "maxpool2d") {
            inspect_filters_pool(input, output);
            expressionPreview = layout_pool_expression(output.poolSize);
        }

        else if (output.type === "conv2d") {
            inspect_filters_conv(input, output);
            expressionPreview = layout_conv_expression(output.kernelSize);
        }

        // --- Layout ---
        const inputPreview = layout_filter_window(input, 300);
        const outputPreview = layout_filter_window(output, 300);

        console.log(expressionPreview);
        console.log(inputPreview);
        console.log(outputPreview);
        
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
        
        // --- Render output filter ---
        const outputRender = render_output_filter(svg, output, outputPreview, {
            x: horizontalLayout.outputX,
            y: verticalLayout.outputY,
            maxWidth: 400
        });

        // --- Render expression ---
        if (output.type === "maxpool2d") {
            expression = render_pool_expression(
                svg,
                expressionPreview,
                horizontalLayout.exprX,
                verticalLayout.exprY
            );
        }
        else if (output.type === "conv2d") {
            expression = render_conv_expression(
                svg,
                expressionPreview,
                horizontalLayout.exprX,
                verticalLayout.exprY
            );
        }

        const hoverHandlers = output.type === "conv2d"
            ? convHoverHandlers
            : poolHoverHandlers;


        // --- Build unified info object ---
        if (output.type === "maxpool2d") {
            info = {
                type: "maxpool2d",
                stride: output.stride?.[0],
                poolSize: output.poolSize,               // pooling only
                outputGroup: outputRender.group,
                expr: {
                    window: expression.window,       // pooling window group
                    outputSquare: expression.outputSquare
                }
            };
        }

        else if (output.type === "conv2d") {
            info = {
                type: "conv2d",
                stride: output.stride?.[0],
                kernelSize: output.kernelSize,           // conv only
                kernelWeights: extractKernelWeights(outputLayer, output.filterIndex),     // conv only
                outputGroup: outputRender.group,
                expr: {
                    window: expression.window,           // conv window group
                    outputSquare: expression.outputSquare
                }
            };
        }


        console.log(info);
        

        // --- Render input filter ---
        const inputRender = render_input_filter(svg, input, inputPreview, {
            x: horizontalLayout.inputX,
            y: verticalLayout.inputY,
            maxWidth: 400,
            info,
            hoverHandlers   // <-- REQUIRED
        });

        resolve();
    });
}

