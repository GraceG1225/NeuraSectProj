import { label_equals, render_output_square } from "./render_expression_pool.js";

function render_conv_window(exp, layout) {
    const g = exp.append("g")
        .attr("class", "conv-window");

    // --- Draw rects ---
    g.selectAll("rect.conv-cell")
        .data(layout.cells)
        .enter()
        .append("rect")
            .attr("class", "conv-cell")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("width", d => d.width)
            .attr("height", d => d.height)
            .attr("fill", "#ffffff")
            .attr("stroke", "#333")
            .attr("stroke-width", 1.5);

    // --- Activation text (top line) ---
    g.selectAll("text.conv-activation")
        .data(layout.cells)
        .enter()
        .append("text")
            .attr("class", "conv-activation")
            .attr("x", d => d.x + d.width / 2)
            .attr("y", d => d.y + d.height * 0.35)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", 12)
            .attr("font-family", "monospace")
            .text(""); // filled dynamically

    // --- Kernel weight text (bottom line) ---
    g.selectAll("text.conv-weight")
        .data(layout.cells)
        .enter()
        .append("text")
            .attr("class", "conv-weight")
            .attr("x", d => d.x + d.width / 2)
            .attr("y", d => d.y + d.height * 0.70)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", 10)
            .attr("font-family", "monospace")
            .text(""); // filled dynamically

    return { group: g };
}


export function render_conv_expression(svg, layout, centerX, centerY) {
    // Root group for the entire expression
    const g = svg.append("g")
        .attr("class", "conv-expression")
        .attr("transform", `translate(${centerX}, ${centerY})`);

    // --- Render kernel window ---
    const kernelWindow = render_conv_window(g, layout.kernelWindow);

    // --- Render equals sign ---
    label_equals(g, layout.equals.x, layout.equals.y);

    // --- Render output square ---
    const outputSquare = render_output_square(
        g,
        layout.outputSquare.x,
        layout.outputSquare.y,
        layout.outputSquare.size
    );

    return {
        group: g,
        window: kernelWindow.group,
        outputSquare
    };
}
