export function highlight_max_in_pool(poolWindow, values) {
  const maxVal = Math.max(...values);

  poolWindow.group.selectAll("rect.pool-cell")
    .attr("stroke", (d, i) => values[i] === maxVal ? "#ff9900" : "#333")
    .attr("stroke-width", (d, i) => values[i] === maxVal ? 3 : 1.5);

  return maxVal;
}



export function update_pool_window(poolWindow, values) {
  poolWindow.group.selectAll("rect.pool-cell")
    .data(values)
    .attr("fill", "#ffffff");

  poolWindow.group.selectAll("text.pool-value")
    .data(values)
    .text(d => d);
}

export function update_output_square(outputSquare, value) {
  outputSquare.text.text(value);
}