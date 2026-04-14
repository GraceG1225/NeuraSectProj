export function apply_highlight(sel) {
    // store original stroke if not stored
    if (!sel.attr("_orig_stroke")) {
        sel.attr("_orig_stroke", sel.attr("stroke") || null);
        sel.attr("_orig_stroke_width", sel.attr("stroke-width") || null);
    }

    sel
        .attr("stroke", "#FFCC00")
        .attr("stroke-width", 3);
}

export function remove_highlight(sel) {
    sel
        .attr("stroke", sel.attr("_orig_stroke"))
        .attr("stroke-width", sel.attr("_orig_stroke_width"));
}
