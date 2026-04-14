// IMPORTS

import { render_state } from "./render_state.js";
import { get_positions } from "./zeroState/layout_state_0.js";
import { render_pooling_state_2 } from "./twoState/pooling/root_pool.js";
import { compute_reduced_positions, deep_copy } from "./oneState/layout_state_1.js";
import { apply_highlight, remove_highlight } from "./zeroState/interactions_pool01.js";
import { buildConvFilter, buildPoolFilter } from "./twoState/layout_state_2.js";

// GLOBAL VARIABLES

let svg; // Allows entire program to have access to svg selection
let model;
let positions;

// module scope at top of file
let currentPositions = [];    // authoritative layout
let snapshots = [];           // stack of deep-copied snapshots
let isTransitioning = false;  // Ensures transitions cannot be interrupted
let state = 0;                // Keeps track of state of interactive visual

let preceding = null;
let selected = null;

function restore_from_pool2() {
    if (isTransitioning) return;
    isTransitioning = true;

    // 1. Remove the pooling animation layer
    svg.select(".output-filter").remove();
    svg.select(".pooling-expression").remove();
    svg.select(".input-filter").remove();


    // 2. Pop the snapshot of State 1
    const snapshot = deep_copy(snapshots.pop());
    console.log("[POP] Stack size:", snapshots.length);

    // 3. Re-render State 1 using the snapshot
    render_state(
        svg,
        snapshot,
        filter_click_handler,
        pool_mouseover_handler,
        pool_mouseleave_handler
    ).then(() => {
        // 4. Restore state machine
        currentPositions = snapshot;
        state = 1;
        isTransitioning = false;

        console.log("Returned to State 1");
    });
}

function restore_from_pool1(event) {
            // ensure click was on background (not on a layer or its children)
            if (event.target.closest && event.target.closest("g.layer")) return;

            // Warn if no snapshot
            if (!snapshots || snapshots.length === 0) {
            console.warn("No snapshot to restore");
            return;
            }

            // block further interactions while we restore
            isTransitioning = true;

            // pop the most recent snapshot (LIFO)
            const snapshot = deep_copy(snapshots.pop());
            console.log("[POP] Stack size:", snapshots.length);

            // restore the popped positions
            render_state(
                svg, 
                snapshot, 
                filter_click_handler,
                pool_mouseover_handler,
                pool_mouseleave_handler
            ).then(() => {
                isTransitioning = false;
                console.log("[RETURN] Promise fulfilled")
            });

            currentPositions = snapshot;
            console.log("this is weird")
            // update state (collapse one level)
            console.log(currentPositions);

            state = Math.max(0, state - 1);
            console.log(`State restored -> ${state}`);
            // do NOT set isTransitioning = false here; render_state will clear it
}

async function render_pool_svg(input, pooling, filterIndex) {
    if (isTransitioning) return;
    isTransitioning = true;

    // Push current position information into snapshot stack
    snapshots.push(deep_copy(currentPositions));
    console.log("[PUSH] Stack size:", snapshots.length);

    const none = [];
    render_state(svg, none);

    console.log(input);
    console.log(pooling);

    const recIn = buildConvFilter(input, filterIndex);
    const recOut = buildPoolFilter(pooling, filterIndex);

    console.log(recIn);
    console.log(recOut);

    // 5. Render pooling animation into overlay-content
    await render_pooling_state_2(recIn, recOut).then(() => {
        isTransitioning = false;
        state = 2;
        currentPositions = none;
        console.log("[RP] Promise fulfilled");
    });

}

// State 0 -> 1 Transition
function zero_to_one(d) {
    const parentLayer = currentPositions[d.layerIndex]; // Parent Layer
    
    console.log(parentLayer);

    // Edge case: Will handle later
    if (parentLayer.layerIndex === 0) {
        isTransitioning = false;
        console.log("First layer selected. Do nothing")
        return;
    }

    // Push current position information into snapshot stack
    snapshots.push(deep_copy(currentPositions));
    console.log("[PUSH] Stack size:", snapshots.length);

    // compute reduced positions containing only preceding layer and selected layer
    const reduced = compute_reduced_positions(
        currentPositions, 
        d.layerIndex, 
        svg.attr("width"), 
        svg.attr("height")
    );

    console.log("Reduced positions")
    console.log(reduced);

    // Transition to state 1
    isTransitioning = true;

    // Render the new state
    render_state(svg, reduced, filter_click_handler).then(() => {
        isTransitioning = false;
        state = 1;
        currentPositions = reduced;
        selected = reduced[1];
        preceding = reduced[0];
        console.log("[LC] Promise fulfilled");
    });

    console.log(`State: 0 -> 1 (selected layer ${d.layerIndex})`);
}

function pool_mouseover_handler(event, d) {
    if (state !== 1) return;

    // Only highlight filters in the selected layer
    if (d.layerIndex !== selected.layerIndex) return;

    const thisFilterSel = d3.select(this);
    apply_highlight(thisFilterSel);

    // Highlight corresponding filter in preceding layer
    const idx = d.filterIndex;

    const precedingFilterSel = d3.select(
        `rect.filter[data-layer-index='${preceding.layerIndex}'][data-filter-index='${idx}']`
    );

    apply_highlight(precedingFilterSel);
}

function pool_mouseleave_handler(event, d) {
    if (state !== 1) return;

    if (d.layerIndex !== selected.layerIndex) return;

    const thisFilterSel = d3.select(this);
    remove_highlight(thisFilterSel);

    const idx = d.filterIndex;

    const precedingFilterSel = d3.select(
        `rect.filter[data-layer-index='${preceding.layerIndex}'][data-filter-index='${idx}']`
    );

    remove_highlight(precedingFilterSel);
}

// Handles filter (or layer) click events
function filter_click_handler(event, d) {
    event.stopPropagation(); // Stops events past the filter level

    console.log("FILTER CLICK");
    
    // Restricts interaction during transitional animation
    if (isTransitioning) {
      console.log("RESTRICTED: Transition Ongoing");
      return;
    }

    // Handles interactions when layer is clicked at state 0
    if (state == 0) zero_to_one(d);

    else if (state == 1) {

        const type = d.type;

        if (type == "maxpool2d") {
            const input = model.layers[preceding.layerIndex];
            const pooling = model.layers[selected.layerIndex];

            console.log(d);
            
            
            render_pool_svg(input, pooling, d.filterIndex);
        }

        else {
            console.log("Later Julian's problem");
        }   

        console.log(`State: 1 -> 2 (selected filter ${d.filterIndex})`);
    }
}

/**
 * Computes initial layout at state 0
 * Ensures users are not allowed to interact with layers during intial animation
 * @param {*} layerArray Information pertaining to each layer of the CNN
 */
async function build_model(layerArray, palette) {

    // Compute layout and generates information for all layers + filters
    positions = get_positions(
        layerArray, 
        palette,
        svg.attr("width"), 
        svg.attr("height")
    );

    // Update current positions array with newly generated layout
    currentPositions = positions;

    // Restricts user from interacting with layers while initial animation occuring
    isTransitioning = true;
    return render_state(
        svg, 
        positions, 
        filter_click_handler, 
        pool_mouseover_handler,
        pool_mouseleave_handler
    ).then(() => {
        console.log("[BUILD] Promise fulfilled");
        isTransitioning = false;
    }); // Renders initial state 0

}

/**
 * Renders the visualization for the convolution neural network
 * Handles interactivity and animations
 * Delegates transitions between states of the vizualizer
 * @param {*} svgRef Original SVG Selection
 * @param {*} model Data pertaining to CNN model
 * @param {*} palette Color theme of visual
 * @returns Updated SVG
 */
export function create_conv(svgRef, modelRef, palette) {
    svg = svgRef; // saves svg selection for global use
    model = modelRef; // saves model for global use

    // Saves information pertaining to each layer
    const layerArray = model.layers;

    // Updates layerArray to include information pertaining to filters and additional elements
    build_model(layerArray, palette);

    // Update current positions array with newly generated layout
    currentPositions = positions;

    ("Original Positions")
    console.log(currentPositions);

    // svg click handler
    svg.on("click", function(event) {
        // ignore clicks while animating or when already at base state
        if (isTransitioning) return;

        if (state == 0) return;

        else if (state == 1) restore_from_pool1(event);

        else if (state === 2) {
            
            if (selected.type == "maxpool2d") restore_from_pool2();
            
        }

    });

    return svg;

}