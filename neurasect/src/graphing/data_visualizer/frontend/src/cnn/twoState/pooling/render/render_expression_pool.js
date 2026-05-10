// Renders the text surrounding the pool window
export function label_pool_window(expression, text, x, y) {
    return expression.append("text")
        .attr("class", "pool-label")
        .attr("x", x)
        .attr("y", y)
        .attr("font-size", 20)
        .attr("font-family", "monospace")
        .attr("dominant-baseline", "middle")
        .text(text);
}

// Renders the equal size
export function label_equals(svg, x, y) {
  return svg.append("text")
    .attr("class", "equals-label")
    .attr("x", x)
    .attr("y", y)
    .attr("font-size", 20)
    .attr("font-family", "monospace")
    .attr("dominant-baseline", "middle")
    .text("=");
}

export function render_output_square(expression, x, centerY, size = 30) {
  const group = expression.append("g")
    .attr("class", "pool-output-group");

  // Center the square vertically around centerY
  const rect = group.append("rect")
    .attr("class", "pool-output-square")
    .attr("x", x)
    .attr("y", centerY - size / 2)
    .attr("width", size)
    .attr("height", size)
    .attr("fill", "#ffe680")
    .attr("stroke", "#333")
    .attr("stroke-width", 2);

  // Center the text inside the square
  const text = group.append("text")
    .attr("class", "pool-output-value")
    .attr("x", x + size / 2)
    .attr("y", centerY)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-size", 10)
    .attr("font-family", "monospace")
    .text("");

  return { group, rect, text };
}

/* 
 * Renders kernel window
 * exp: expression group selection
 * poolSize: number of columns and rows pertaining to pool window
 * x: horizontal positioning
 * y: vertical positioning
*/
function render_pool_window(exp, layout) {

    const g = exp.append("g")
        .attr("class", "pool-window");

    g.selectAll("rect.pool-cell")
      .data(layout.cells)
      .enter()
      .append("rect")
        .attr("class", "pool-cell")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("width", d => d.width)
        .attr("height", d => d.height)
        .attr("fill", "#ffffff")
        .attr("stroke", "#333")
        .attr("stroke-width", 1.5);

    g.selectAll("text.pool-value")
      .data(layout.cells)
      .enter()
      .append("text")
        .attr("class", "pool-value")
        .attr("x", d => d.x + d.width / 2)
        .attr("y", d => d.y + d.height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", 10)
        .attr("font-family", "monospace")
        .text("");

    return { group: g };
}

/* 
 * Renders pooling operation elements
 * svg: SVG selection
 * pooling: Output (pooling) filter object
 * x: Horizontal positioning
 * y: Vertical positioning
 */
// Renders the full pooling expression centered at (centerX, centerY)
export function render_pool_expression(svg, layout, centerX, centerY) {
    const g = svg.append("g")
      .attr("class", "pooling-expression")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    label_pool_window(g, "max(", layout.maxLabel.x, layout.maxLabel.y);

    const poolWindow = render_pool_window(g, layout.poolWindow);

    label_pool_window(g, ")", layout.closeParen.x, layout.closeParen.y);

    label_equals(g, layout.equals.x, layout.equals.y);

    const outputSquare = render_output_square(g, layout.outputSquare.x, layout.outputSquare.y, layout.outputSquare.size);

    return { group: g, window: poolWindow, outputSquare };
}

