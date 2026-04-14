export function highlight_kernel_window(group, startRow, startCol, kernelSize) {
  const [kRows, kCols] = kernelSize;

  group.selectAll("rect.input-cell")
    .attr("fill", d => {
      const inWindow =
        d.row >= startRow &&
        d.row < startRow + kRows &&
        d.col >= startCol &&
        d.col < startCol + kCols;

      return inWindow ? "#ffcc00" : "#830000";
    });
}

export function clear_kernel_highlight(group) {
  group.selectAll("rect.input-cell")
    .attr("fill", "#830000");
}

export function highlight_output_cell(outputGroup, outRow, outCol) {
  outputGroup.selectAll("rect.output-cell")
    .attr("fill", d => {
      const target = d.row == outRow && d.col == outCol;
      return target ? "green" : "#e0e0e0";
    });
}

export function clear_output_highlight(outputGroup) {
  outputGroup.selectAll("rect.cell")
    .attr("fill", "##e0e0e0");
}