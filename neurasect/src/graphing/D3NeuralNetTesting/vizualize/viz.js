export function createViz(svg, { nodes = [], edges = [] }) {

    // Fast lookup table
    const nodeById = new Map(nodes.map(n => [n.id, n]));

    // 2. LOCAL SELECTION STATE
    let selectedId = null;

    function setSelectedId(id) {
        selectedId = id;

        nodeG.selectAll("g.node").each(function (d) {
            d3.select(this).select("circle")
                .attr("stroke", d.id === selectedId ? "black" : "none")
                .attr("stroke-width", d.id === selectedId ? 3 : 0);
        });
    }

    let defs = svg.select("defs");
    if (defs.empty()) defs = svg.append("defs");

    let arrow = defs.select("#arrowhead") ;
    if (arrow.empty()) {
        arrow = defs.append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 9)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#000");
    }

    let linkG = svg.append("g").attr("class", "edges");
    let nodeG = svg.append("g").attr("class", "nodes");

    // Tooltip
    let tooltip = svg.append("text")
        .attr("class", "edge-tooltip")
        .attr("font-size", 12)
        .attr("fill", "#333")
        .attr("opacity", 0);

    // ------------------------------------------------------------
    // 5. DRAW + INTERACT WITH edges
    // ------------------------------------------------------------
    linkG.selectAll('line')
    .data(edges, d => `${d.source}->${d.target}`) // keyed join
    .join(
        enter => enter.append('line')
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0)
        .attr('marker-end', 'url(#arrowhead)')
        .style('cursor', 'pointer'), // make edges clickable
        update => update,
        exit => exit.remove()
    )
    // Position edges based on node coordinates
    .attr('x1', d => nodeById.get(d.source)?.cx ?? 0)
    .attr('y1', d => nodeById.get(d.source)?.cy ?? 0)
    .attr('x2', d => {
        const src = nodeById.get(d.source);
        const tgt = nodeById.get(d.target);
        if (!src || !tgt) return 0;

        const dx = tgt.cx - src.cx;
        const dy = tgt.cy - src.cy;
        const len = Math.hypot(dx, dy) || 1;

        const ux = dx / len;
        const uy = dy / len;

        return tgt.cx - ux * (tgt.r || 8);
    })
    .attr('y2', d => {
        const src = nodeById.get(d.source);
        const tgt = nodeById.get(d.target);
        if (!src || !tgt) return 0;

        const dx = tgt.cx - src.cx;
        const dy = tgt.cy - src.cy;
        const len = Math.hypot(dx, dy) || 1;

        const ux = dx / len;
        const uy = dy / len;

        return tgt.cy - uy * (tgt.r || 8);
    })
    .attr('stroke', d => d.weight >= 0 ? '#000000' : '#de2d26')
    .attr('stroke-width', d => Math.max(1, Math.abs(d.weight) * 4))
    .transition().duration(200)
    .attr('opacity', 0.9);

    // ------------------------------------------------------------
    // 6. EDGE INTERACTIVITY
    // ------------------------------------------------------------
    d3.selectAll('line')
    .on('mouseover', function (event, d) {
        // Highlight hovered edge
        d3.select(this)
        .transition().duration(120)
        .attr('stroke-width', Math.max(2, Math.abs(d.weight) * 6))
        .attr('opacity', 1);

        // Show tooltip near cursor
        tooltip
        .text(`w = ${d.weight}`)
        .attr('x', event.offsetX + 10)
        .attr('y', event.offsetY - 10)
        .attr('opacity', 1);
    })
    .on('mousemove', function (event) {
        // Move tooltip with cursor
        tooltip
        .attr('x', event.offsetX + 10)
        .attr('y', event.offsetY - 10);
    })
    .on('mouseout', function (event, d) {
        // Restore original appearance
        d3.select(this)
        .transition().duration(120)
        .attr('stroke-width', Math.max(1, Math.abs(d.weight) * 4))
        .attr('opacity', 0.9);

        tooltip.attr('opacity', 0);
    })
    .on('click', function (event, d) {
        // Clicking an edge selects its *source node*
        const newId = d.source === selectedId ? null : d.source;
        setSelectedId(newId);
    });

    // ------------------------------------------------------------
    // 7. DRAW NODES
    // ------------------------------------------------------------
    nodeG.selectAll('g.node')
    .data(nodes, d => d.id)
    .join(
        enter => {
        const g = enter.append('g')
            .attr('class', 'node')
            .style('cursor', 'pointer');

        // Circle
        g.append('circle')
            .attr('r', 0)
            .attr('fill', d => d.fill || 'steelblue')
            .attr('stroke', 'none');

        // Label
        g.append('text')
            .attr('y', d => -(d.r || 8) - 6)
            .attr('text-anchor', 'middle')
            .attr('font-size', 10)
            .text(d => d.id);

        return g;
        },
        update => update,
        exit => exit.remove()
    )
    // Node click toggles selection
    .on('click', (event, d) => {
        const newId = d.id === selectedId ? null : d.id;
        setSelectedId(newId);
    })
    // Update both enter + update selections
    .each(function (d) {
        const g = d3.select(this);

        // Move node
        g.transition().duration(200)
        .attr('transform', `translate(${d.cx}, ${d.cy})`);

        // Update circle appearance
        g.select('circle')
        .transition().duration(200)
        .attr('r', d.r)
        .attr('fill', d.fill || 'steelblue')
        .attr('stroke', d.id === selectedId ? 'black' : 'none')
        .attr('stroke-width', d.id === selectedId ? 3 : 0);
    });

}