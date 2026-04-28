/*
 * Updates the convolution expression window with:
 * - activations (top line)
 * - weights (bottom line)
 * - products (optional third line)
 *
 * exprWindow: the <g> group returned by render_conv_window
 * activations: flat array of activation values
 * weights: flat array of kernel weights
 * products: flat array of activation * weight results (optional)
 */
export function update_conv_window(exprWindow, activations, weights, products = []) {
    // --- Update activation text ---
    exprWindow.selectAll("text.conv-activation")
        .data(activations)
        .text(d => (d !== undefined ? d : ""));

    // --- Update weight text ---
    exprWindow.selectAll("text.conv-weight")
        .data(weights)
        .text(d => (d !== undefined ? `x ${d}` : ""));

    // --- Optional: update product text (if you add it to the renderer) ---
    if (products.length > 0) {
        exprWindow.selectAll("text.conv-product")
            .data(products)
            .text(d => (d !== undefined ? d : ""));
    } else {
        // Clear product text if present
        exprWindow.selectAll("text.conv-product")
            .text("");
    }
}
