import { get_text_position } from "./oneState/layout_state_1.js";

/**
 * Renders layers and filters
 * Uses d3 data + join
 * @param {*} svg SVG selection
 * @param {*} positions // Layout of layers and filters
 * @param {*} filter_click_handler // Work on this
 * @param {*} transitionDuration // Duration of transition animations
 * @returns 
 */
export function render_state(
    svg, 
    positions, 
    filter_click_handler, 
    pool_mouseover_handler, 
    pool_mouseleave_handler,
    transitionDuration = 400
) {

    // Ensure positions is always an array
    positions = Array.isArray(positions) ? positions : [];
    // For loop iterates through each element in positions, layout array
    positions.forEach(p => {
        // Ensure that layer filter array is an array
        if (!Array.isArray(p.filtersPositions)) p.filtersPositions = [];
        // Ensure that each layer has a text position object
        if (!p.textPosition)
            p.textPosition = {
                x: p.x - 5,
                y: p.y + 110
            };
    });

    // Returns promise after all layers are rendered
    return new Promise(resolve => {
      let active = 0; // Variable keeps track of all tracked transitions

      // Count how many transitions are running
      function track(t) {
          active++;
          t.on("end", () => {
              active--;
              if (active === 0) resolve();
          });
      }

      // Layer select all groups with class layer
      const layers = svg.selectAll("g.layer")
        .data(positions, d => d.layerIndex) // Bounds visual elements to data within positions array
        .join(

          // ENTER
          enter => {
              const gEnter = enter.append("g") // Append new group
                .attr("class", "layer") // Add class layer
                .attr("label", d => d.type) // Add label for type of layer

              // Create filtered selection of conv and pool layers
              const filtered = gEnter.filter(d =>
                  d.type === "conv2d" || d.type === "maxpool2d"
              );

              // First label
              track(
                filtered.append("text") // Append label text to each layer group
                  .attr("class", "layer-label")
                  .attr("text-anchor", "middle")
                  .attr("x", d => get_text_position(d).x)
                  .attr("y", d => get_text_position(d).y)
                  .style("font-size", "16px")
                  .style("fill", "black")
                  .style("pointer-events", "none")
                  .style("opacity", 0)
                  .text(d => d.name)
                  .transition()
                  .duration(transitionDuration)
                  .style("opacity", 1)
              );

              // Second label
              track(
                filtered.append("text")// Append extra number of filters text to group
                  .attr("class", "extra-label")
                  .attr("text-anchor", "middle")
                  .attr("x", d => get_text_position(d).x)
                  .attr("y", d => get_text_position(d).y + 30)
                  .style("font-size", "16px")
                  .style("fill", "black")
                  .style("pointer-events", "none")
                  .style("opacity", 0)
                  .text(d => d.extraFilters)
                  .transition()
                  .duration(transitionDuration)
                  .style("opacity", 1)
              );

              return gEnter;
          },

          // UPDATE
          update => {
              // Updates each element visually
              update.each(function(d) {
                
                  const g = d3.select(this); // Selects this layer

                  const label = g.select("text.layer-label"); // Select the layer label
                  if (!label.empty()) {
                      track(
                        label.transition()
                          .duration(transitionDuration)
                          .attr("x", get_text_position(d).x)
                          .attr("y", get_text_position(d).y)
                      ); // Track movement transition
                  }

                  const extra = g.select("text.extra-label"); // Select the extra label
                  if (!extra.empty()) {
                      track(
                        extra.transition()
                          .duration(transitionDuration)
                          .attr("x", get_text_position(d).x)
                          .attr("y", get_text_position(d).y + 20)
                    ); // Track movement transition

                  }
                });

                return update;

          },

          // EXIT
          exit => {
            track(
              exit.transition()
                .duration(transitionDuration)
                .style("opacity", 0)
                .remove()
            ); // Remove transition
            return exit;
          }
        );

      // FILTERS
      // For each layer...
      layers.each(function(layerData) {
          const g = d3.select(this); // Layer selection

          // Select all rects under this layer
          g.selectAll("rect.filter")
            .data(layerData.filtersPositions, d => d.filterIndex) // Bound layer filter positions
            .join(

                // ENTER
                enter => {
                  const rects = enter.append("rect") // Append new rect to layer 
                    .attr("class", "filter") // Add class filter
                    .attr("x", d => d.x) // x coord
                    .attr("y", d => d.y + 8) // x cord
                    .attr("width", d => d.width) // width
                    .attr("height", d => d.height) // height
                    .attr("fill", layerData.fill) // color
                    .attr("stroke", "black") // stroke
                    .attr("stroke-width", 2)
                    .attr("opacity", 0)
                    .attr("data-layer-index", layerData.layerIndex)
                    .attr("data-filter-index", (f, i) => i)
                    .on("click", filter_click_handler) // Add interactive element
                    .on("mouseover", pool_mouseover_handler)
                    .on("mouseleave", pool_mouseleave_handler);

                  track(
                    rects.transition()
                      .duration(transitionDuration)
                      .delay((d, i) => i * 30)
                      .attr("y", d => d.y)
                      .attr("opacity", 1)
                  ); // Layer pop in animation

                  return rects;
                },

                // UPDATE
                update => {
                  track(
                    update.transition()
                      .duration(transitionDuration)
                      .attr("x", d => d.x)
                      .attr("y", d => d.y)
                      .attr("width", d => d.width)
                      .attr("height", d => d.height)
                      .attr("fill", layerData.fill)
                      .attr("opacity", d => d.opacity ?? 1)
                  ); // Used for moving filters
                  return update;
                },

                // EXIT
                exit => {
                  track(
                    exit.transition()
                      .duration(transitionDuration)
                      .attr("opacity", 0)
                      .remove()
                  ); // Removing filters
                  return exit;
                }
            );
        });

        return layers;
    });
}