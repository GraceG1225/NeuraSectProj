export function deep_copy(obj) {

  if (typeof structuredClone === "function") 
      return structuredClone(obj);

  return JSON.parse(JSON.stringify(obj));

}

// Get text positions of a layer
export function get_text_position(d) {
  
  if (!d) 
      return { x: null, y: null };
  
  const tp = d.textPosition;
  
  if (Array.isArray(tp)) 
      return { x: tp[0], y: tp[1] };
  
  if (tp && (typeof tp.x !== "undefined" || typeof tp.y !== "undefined")) 
      return { x: tp.x, y: tp.y };
  
  return { x: (typeof d.x === "number" ? d.x - 5 : null), y: (typeof d.y === "number" ? d.y + 110 : null) };

}

// Compute positions for State 1 (absolute coordinates only).
// Returns an array containing only the preceding layer (if exists) and the selected layer,
// with updated filtersPositions for the selected layer arranged in a 5-row x 2-column grid,
// and with textPosition set just to the left of each layer.
export function compute_reduced_positions(positions, selectedIndex, svgW, svgH) {
  // clone positions so we don't mutate the originals
  const cloned = positions.map(p => ({
    ...p,
    filtersPositions: (p.filtersPositions || []).map(f => ({ ...f }))
  }));

  // find selected and preceding
  const sel = cloned.find(p => p.layerIndex === selectedIndex);
  const prev = cloned.find(p => p.layerIndex === selectedIndex - 1);

  // layout constants (tweak to taste)
  const cols = 1;
  const rows = 10;
  const defaultFilterW = 40;
  const defaultFilterH = 40;
  const gap = 15; // gap between filters (both x and y)
  const rightAnchorX = Math.round(svgW * 0.65); // where expanded layer sits (right side)
  const leftAnchorX = Math.round(svgW * 0.2);   // where preceding layer sits (left side)
  const centerY = Math.round(svgH / 2);
  const labelMargin = 10; // horizontal distance between left edge of layer and label

  const result = [];

  if (prev) {
    // compute per-filter heights (fallback to default) and total height including gaps
    const heights = prev.filtersPositions.map(f => (typeof f.height === "number" ? f.height : defaultFilterH));
    const sumHeights = heights.reduce((s, h) => s + h, 0);
    const totalPrevHeight = sumHeights + Math.max(0, heights.length - 1) * gap;
    const startPrevY = centerY - Math.round(totalPrevHeight / 2);

    prev.x = leftAnchorX;
    prev.y = centerY;

    // place filters stacked vertically with gap
    let cursorY = startPrevY;
    prev.filtersPositions.forEach((f, i) => {
      const h = (typeof f.height === "number" ? f.height : defaultFilterH);
      // left-align rects at prev.x
      f.x = prev.x;
      f.y = cursorY;
      cursorY += h + gap;
    });

    // textPosition: just to the left of the preceding layer's x, vertically centered on the stack
    prev.textPosition = {
      x: prev.x - labelMargin - 45,
      y: startPrevY + Math.round(totalPrevHeight / 2)
    };

    result.push(prev);
  }

  if (sel) {
    // determine per-filter sizes (use max to avoid overlap)
    const widths = sel.filtersPositions.map(f => (typeof f.width === "number" ? f.width : defaultFilterW));
    const heights = sel.filtersPositions.map(f => (typeof f.height === "number" ? f.height : defaultFilterH));
    const repW = widths.length ? Math.max(...widths) : defaultFilterW;
    const repH = heights.length ? Math.max(...heights) : defaultFilterH;

    // grid cell spacing uses representative size + gap
    const cellW = repW + gap;
    const cellH = repH + gap;

    const visible = sel.filtersPositions.length;
    const maxCells = cols * rows;
    const used = Math.min(visible, maxCells);

    // compute grid start so grid is centered vertically around centerY
    const gridWidth = (cols - 1) * cellW + repW;
    const gridHeight = (rows - 1) * cellH + repH;
    const startX = rightAnchorX - Math.round(gridWidth / 2);
    const startY = centerY - Math.round(gridHeight / 2);

    sel.x = rightAnchorX;
    sel.y = centerY;

    // fill grid row-major: rows down, columns across (row, col)
    for (let i = 0; i < used; i++) {
      const row = i % rows;      // 0..rows-1
      const col = Math.floor(i / rows); // 0..cols-1
      const f = sel.filtersPositions[i];
      if (!f) continue;
      // place each rect at top-left of its cell
      f.x = startX + col * cellW;
      f.y = startY + row * cellH;
      // ensure width/height exist
      if (typeof f.width !== "number") f.width = repW;
      if (typeof f.height !== "number") f.height = repH;
    }

    // trim any extra filters beyond used
    sel.filtersPositions = sel.filtersPositions.slice(0, used);

    // textPosition: just to the left of the grid start, vertically centered on the grid
    sel.textPosition = {
      x: startX - labelMargin - 45,
      y: startY + Math.round(gridHeight / 2)
    };

    result.push(sel);
  }

  return result;
}

