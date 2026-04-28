/**
 * Render edges between layers by using D3 join pattern
 * @param {*} linkG Edge group
 * @param {*} edges Edge layout
 * @param {*} nodeById Neuron map
 * @param {*} palette Color scheme
 * @param {*} tooltip Used for text
 * @param {*} setSelectedId Select neuron function
 * @param {*} duration Duration of transition animation
 */
export function render_lines(linkG, edges, nodeById, palette, tooltip, setSelectedId, duration = 750) {

    // Return promise after rendering/transitions finish
    return new Promise(resolve => {
        let active = 0; // Initialize tracker

        // Track transitions so we know when all have finished
        function track(t) {
            active++; // Incremenet for every track call
            t.on("end", () => {
                active--;                    // Decremenet after transition ends
                if (active === 0) resolve(); // Resolve promise if all tracks are closed
            }); // If an animation ends, resolve the tracker and close it.
        }

        // D3 data/join
        const edgeMerge = linkG
            .selectAll("line.edge") // Select edge class
            .data(edges, d => d.id) // Bind edge objects to renders. Use edge ID as key
            .join(

                // ENTER
                enter => {
                    const sel = enter.append("line")
                        .attr("class", "edge")
                        .attr("stroke-linecap", "round")
                        .attr("marker-end", "url(#arrowhead)")
                        .attr("opacity", 0)
                        .style("cursor", "pointer");
                    return sel;
                },

                // UPDATE
                update => update,

                // EXIT
                exit => {
                    const t = exit.transition().duration(duration)
                        .attr("opacity", 0)
                        .remove();
                    track(t);
                    return exit;
                }
            );

        // ENTER + UPDATE transitions
        const t = edgeMerge.transition().duration(duration)
            .attr("opacity", 0.9)
            .attr("stroke", d => d.weight >= 0 ? "#000" : palette.secondary)
            .attr("stroke-width", d => Math.max(1, Math.abs(d.weight) * 4))
            .attr("x1", d => nodeById.get(d.source).cx)
            .attr("y1", d => nodeById.get(d.source).cy)
            .attr("x2", d => {
                const src = nodeById.get(d.source);
                const tgt = nodeById.get(d.target);
                const dx = tgt.cx - src.cx;
                const dy = tgt.cy - src.cy;
                const len = Math.hypot(dx, dy) || 1;
                return tgt.cx - (dx / len) * (tgt.r || 8);
            })
            .attr("y2", d => {
                const src = nodeById.get(d.source);
                const tgt = nodeById.get(d.target);
                const dx = tgt.cx - src.cx;
                const dy = tgt.cy - src.cy;
                const len = Math.hypot(dx, dy) || 1;
                return tgt.cy - (dy / len) * (tgt.r || 8);
            });

        // Track the main transition
        track(t);

        // INTERACTIVITY (no tracking — these transitions are user‑driven)
        edgeMerge
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .transition().duration(120)
                    .attr("stroke-width", Math.max(2, Math.abs(d.weight) * 6))
                    .attr("opacity", 1);

                tooltip
                    .text(`w = ${d.weight}`)
                    .attr("x", event.offsetX + 10)
                    .attr("y", event.offsetY - 10)
                    .attr("opacity", 1);
            })
            .on("mousemove", function (event) {
                tooltip
                    .attr("x", event.offsetX + 10)
                    .attr("y", event.offsetY - 10);
            })
            .on("mouseout", function (event, d) {
                d3.select(this)
                    .transition().duration(120)
                    .attr("stroke-width", Math.max(1, Math.abs(d.weight) * 4))
                    .attr("opacity", 0.9);

                tooltip.attr("opacity", 0);
            })
            .on("click", function (event, d) {
                setSelectedId(d.source);
            });
    });
}

/**
 * Render neurons using D3 join pattern
 * @param {*} nodeG Neuron group
 * @param {*} nodes Neuron layout
 * @param {*} palette Colors
 * @param {*} setSelectedId Neuron select ID
 * @param {*} duration Transition duration
 */
export function render_nodes(nodeG, nodes, palette, setSelectedId, duration = 750) {

    return new Promise(resolve => {
        let active = 0;

        // Track transitions so we know when all have finished
        function track(t) {
            active++;
            t.on("end", () => {
                active--;
                if (active === 0) resolve();
            });
        }

        const nodeMerge = nodeG
            .selectAll("g.node")
            .data(nodes, d => d.id)
            .join(

                // ENTER
                enter => {
                    const g = enter.append("g")
                        .attr("class", "node")
                        .attr("transform", d => `translate(${d.cx}, ${d.cy})`)
                        .style("cursor", "pointer")
                        .style("opacity", 0);

                    g.append("circle")
                        .attr("r", 0)
                        .attr("fill", d => d.fill || palette.primary)
                        .attr("stroke", "none");

                    return g;
                },

                // UPDATE
                update => update,

                // EXIT
                exit => {
                    const t = exit.transition().duration(duration)
                        .style("opacity", 0)
                        .remove();
                    track(t);
                    return exit;
                }
            );

        // ENTER + UPDATE transitions (group)
        const t1 = nodeMerge.transition().duration(duration)
            .style("opacity", 1)
            .attr("transform", d => `translate(${d.cx}, ${d.cy})`);
        track(t1);

        // ENTER + UPDATE transitions (circle)
        const t2 = nodeMerge.select("circle")
            .transition().duration(duration)
            .attr("r", d => d.r)
            .attr("fill", d => d.fill || palette.primary);
        track(t2);

        // INTERACTIVITY (not tracked)
        nodeMerge.on("click", (event, d) => {
            setSelectedId(d.id);
        });
    });
}


/**
 * Interface function. Calls renderer functions for edges and neurons.
 * @param {*} handles The handles used by the model renderer
 * @param {*} nodes Node layout
 * @param {*} edges Edge layout
 * @param {*} palette Colors
 */
export function render_dense(handles, nodes, edges, palette) {

    const { linkG, nodeG, tooltip, setSelectedId } = handles; // Save handles for rendering

    const nodeById = new Map(nodes.map(n => [n.id, n])); // Easy mapping of nodes using node id
    console.log(nodeById);
    
    const edgePromise = render_lines(linkG, edges, nodeById, palette, tooltip, setSelectedId); // Render edges
    const nodePromise = render_nodes(nodeG, nodes, palette, setSelectedId); // Render neurons

    console.log(edgePromise, nodePromise);
    
}

/**
 * Initialize handles such as defs, node/edge groups, and select nueron function.
 * @param {*} svg SVG selection
 * @returns Handles object containing handle values
 */
export function init_render(svg) {

    // -----------------------------
    // 1. Create <defs> + arrowhead
    // -----------------------------
    let defs = svg.select("defs");
    if (defs.empty()) defs = svg.append("defs"); // Defs are essentially reusable tools

    let arrow = defs.select("#arrowhead"); // Triangle shape at the end of an edge. We can reuse
    if (arrow.empty()) {
        arrow = defs.append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 9)
            .attr("refY", 0)
            .attr("markerWidth", 9)
            .attr("markerHeight", 9)
            .attr("orient", "auto")
            .attr("markerUnits", "userSpaceOnUse");

        arrow.append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#000");
    }

    // -----------------------------
    // 2. Create persistent groups
    // -----------------------------
    const linkG = svg.append("g").attr("class", "edges"); // Empty edge group
    const nodeG = svg.append("g").attr("class", "nodes"); // Empty neuron group

    // -----------------------------
    // 3. Tooltip
    // -----------------------------
    const tooltip = svg.append("text") // Used for text
        .attr("class", "edge-tooltip")
        .attr("font-size", 12)
        .attr("fill", "#333")
        .attr("opacity", 0);

    // -----------------------------
    // 4. Selection state
    // -----------------------------
    let selectedId = null; 

    // Used in the event that a neuron is clicked or selected
    function setSelectedId(id) {
        selectedId = id;

        nodeG.selectAll("g.node").each(function (d) {
            d3.select(this).select("circle")
                .attr("stroke", d.id === selectedId ? "black" : "none")
                .attr("stroke-width", d.id === selectedId ? 3 : 0);
        });
    }

    // Return persistent handles
    return {
        linkG,
        nodeG,
        tooltip,
        setSelectedId
    };
}
