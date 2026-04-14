// import { layout_filter_window } from "./layout/layout_filter_pool.js";
// import { layout_pool_expression } from "./layout/layout_expression_pool.js";
// import { render_pooling_expression } from "./render/render_expression_pool.js";
// import { render_output_filter, render_input_filter } from "./render/render_filter_pool.js";

// export function inspect_filters(inputFilter, poolingFilter) {
//     const [inRows, inCols] = inputFilter.shape;
//     const [outRows, outCols] = poolingFilter.shape;
//     const [kRows, kCols] = poolingFilter.poolSize;
//     const [sRows, sCols] = poolingFilter.stride;

//     // --- Case 5: Kernel larger than input ---
//     if (kRows > inRows || kCols > inCols) {
//         throw new Error(
//             `Invalid pooling configuration: poolSize ${kRows}x${kCols} is larger than input ${inRows}x${inCols}.`
//         );
//     }

//     // --- Case 2: Stride does not tile the input cleanly ---
//     if (inRows % sRows !== 0 || inCols % sCols !== 0) {
//         throw new Error(
//             `Invalid stride: input ${inRows}x${inCols} is not divisible by stride ${sRows}x${sCols}.`
//         );
//     }

//     if (inRows != inCols || outRows != outCols) {
//         throw new Error (
//             `Invalid filter configurations: Both filters must have respect, identical rows and columns`
//         )
//     }

//     // --- Validate expected output shape ---
//     const expectedOutRows = Math.floor((inRows - kRows) / sRows) + 1;
//     const expectedOutCols = Math.floor((inCols - kCols) / sCols) + 1;

//     if (expectedOutRows !== outRows || expectedOutCols !== outCols) {
//         throw new Error(
//             `Output shape mismatch: expected ${expectedOutRows}x${expectedOutCols}, got ${outRows}x${outCols}.`
//         );
//     }

//     // --- Validate positive values ---
//     if (kRows <= 0 || kCols <= 0 || sRows <= 0 || sCols <= 0) {
//         throw new Error(`Invalid poolSize or stride: values must be positive.`);
//     }

//     // If we reach here, everything is valid
//     return true;
// }


// // Helper function returns values that correspond to horizontal alignment of the three visual elements
// function compute_three_panel_layout(svgWidth, leftWidth, centerWidth, rightWidth, gap = 80) {
//     const totalWidth = leftWidth + centerWidth + rightWidth + gap * 2;

//     const startX = (svgWidth - totalWidth) / 2;

//     return {
//       inputX: startX, // Input filter
//       exprX: startX + leftWidth + gap, // Pooling operation visual
//       outputX: startX + leftWidth + gap + centerWidth + gap // Output filter
//     };
// }

// // Helper function returns values that correspond to vertical alignment of the three visual elements
// export function compute_vertical_layout(svgHeight, inputHeight, centerHeight, outputHeight) {
//     const inputY  = (svgHeight - inputHeight) / 2;
//     const exprY = (svgHeight - centerHeight) / 2;
//     const outputY = (svgHeight - outputHeight) / 2;

//     return { inputY, exprY, outputY };
// }

// // Takes an input filter and resulting pooling filter to be compared. 
// // Start for state 2 of pooling layers
// // input: Input filter corresponding to preceding layer
// // pooling: Output filter corresponding to the selected pooling layer
// /*
//     filterIndex: 0,
//     type: "conv2d",
//     shape: [6, 6],
//     stride: [1, 1],
//     kernelSize: [2, 2],
//     numNeurons: 36,
//     values: [
//         [0.1, 0.5, 0.2, 0.9, 0.3, 0.7],
//         [0.4, 0.8, 0.6, 0.1, 0.2, 0.5],
//         [0.9, 0.3, 0.7, 0.4, 0.8, 0.6],
//         [0.2, 0.1, 0.5, 0.9, 0.3, 0.4],
//         [0.7, 0.6, 0.8, 0.2, 0.1, 0.9],
//         [0.3, 0.4, 0.2, 0.5, 0.7, 0.8]
//     ]
// */
// export function render_pooling_state_2(input, pooling) {
    
//     // Intialize SVG, will remove
//     const svg = d3.select('body')
//       .append('svg')
//         .attr("width", window.screen.width - 100)
//         .attr("height", window.screen.height-100);

//     const svgWidth = +svg.attr("width");
//     const svgHeight = +svg.attr("height");

//     try {
//         inspect_filters(input, pooling);
//     } catch (err) {
//         console.error(err.message);
//         alert(err.message); // optional UI feedback
//         return; // stop the program
//     }

//     // First, measure the input and output filters
//     const inputPreview = layout_filter_window(input, 300); // Layout of input filter
//     const outputPreview = layout_filter_window(pooling, 300); // Layout of output (pooling) filter
    
//     console.log(inputPreview);
//     console.log(outputPreview);
    
//     const expressionPreview = layout_pool_expression(pooling.poolSize); // Layout of pooling expression
    
//     console.log(expressionPreview);    

//     // Compute general horizontal coordinates of three visual elements (input filter, pooling-operation grid, output filter)
//     const horizontalLayout = compute_three_panel_layout(
//         svgWidth,
//         inputPreview.width,
//         expressionPreview.width,
//         outputPreview.width
//     )
//     // Compute general vertical coordinates of three visual elements (input filter, pooling-operation grid, output filter)
//     const verticalLayout = compute_vertical_layout(
//         svgHeight,
//         inputPreview.height,
//         expressionPreview.height,
//         outputPreview.height
//     )

//     console.log(horizontalLayout);
//     console.log(verticalLayout);

//     // Render output filter and cells
//     const outputRender = render_output_filter(svg, pooling, outputPreview, {
//         x: horizontalLayout.outputX, // Horizontal positioning of filter
//         y: verticalLayout.outputY, // Default vertical positioning of filter
//         maxWidth: 400 // Max width of filter
//     });
//     const outGroup = outputRender.group; // Save output filter selection

//     // Render pooling expression
//     const poolExpression = render_pooling_expression(
//         svg, // SVG selection
//         expressionPreview, // expression layout
//         horizontalLayout.exprX, // horizontal positioning
//         verticalLayout.exprY, // vertical positioning
//     );
//     const expression = poolExpression.group; // expression group selection
//     const poolWindow = poolExpression.poolWindow; // expression pool window selection
//     const outputSquare = poolExpression.outputSquare; // Output square selection

//     console.log(outputSquare);
    
//     // Render input filter and cells including interactive elements
//     const inputRender = render_input_filter(svg, input, inputPreview, {
//         x: horizontalLayout.inputX,
//         y: verticalLayout.inputY,
//         maxWidth: 400,
//         poolShape: pooling.poolSize,
//         stride: pooling.stride[0],
//         outputGroup: outGroup,
//         poolWindow: poolWindow,
//         outputSquare: outputSquare
//     });
//     const inGroup = inputRender.group;

// }