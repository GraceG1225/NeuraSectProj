/**
 * Coputes filter positions relative to layer positions
 * @param {*} filterCount // Filter count for layer
 * @param {*} layerX // Layer x coord
 * @param {*} layerY // Layer y coord
 * @param {*} offsetX // Horizontal offset
 * @param {*} offsetY  // Vertical offset
 * @param {*} squareSize // Size of filter (rect)
 * @returns 
 */
function get_filter_positions(
    filterCount,
    layerX,
    layerY,
    layerIndex,
    layerType,
    offsetX = -5,
    offsetY = 4,
    squareSize = 40
) {
    return Array.from({ length: filterCount }, (_, i) => ({
        filterIndex: i, // Filter index
        x: layerX + i * offsetX, // Filter x coordinate
        y: layerY + i * offsetY, // Filter y coordinate
        width: squareSize, 
        height: squareSize,
        layerIndex: layerIndex,
        type: layerType
    }));
}

/**
 * Compute layer coordinates
 * @param {*} layerCount Number of conv and pool layers 
 * @param {*} svgWidth width of SVG
 * @param {*} svgHeight height of SVG
 * @returns 
 */
function get_layer_positions(layerCount, svgWidth, svgHeight) {
    const cols = 4; // Number of columns for organizing layers in state 0
    const rows = 2; // Number of rows for organizing layers in state 0

    const cellWidth = svgWidth / cols; // Horizontal space dedicated to each layer
    const cellHeight = svgHeight / rows; // Vertical space dedicated to each layer

    // For loop that iterates through each layer, and assigns layer a column, row, coords, and dimensions.
    // Returns array of layerData 
    return Array.from({ length: layerCount }, (_, i) => {
        // Cycles through number of columns as loop increments.
        const col = i % cols; 
        const row = Math.floor(i / cols); // Assigns layers rows from top to bottom.

        // Return layer datum
        return {
            layerIndex: i, // Layer index for data/join selection
            x: col * cellWidth + cellWidth / 2, // x coordinate
            y: row * cellHeight + cellHeight / 2, // y coordinate
            cellWidth, // cell width
            cellHeight // cell height
        };
    });
}

/**
 * 
 * @TODO Dense and Flatten layers
 * @param {*} layerArray 
 * @param {*} width 
 * @param {*} height 
 * @returns 
 */
export function get_positions(layerArray, palette, width, height) {
    let count = 0; // Saves total number of conv and pool layers
    let lastConv; // Index of last conv layer
    
    // For loop iterates through each layer in layer array
    // Appends additional info to layers in layer array.
    layerArray.forEach((item, i) => {
        item.layerIndex = i;   // add index attribute to the layer info

        // If layer is of type convolution, save number of filters and assign fill color
        if  (item.type === "conv2d") {
            item.filters = item.kernel_shape[3];
            item.fill = palette.primary;
            lastConv = i;
            count++;
        }

        // If layer is of type pool, save number of filters and assign fill color
        else if (item.type === "maxpool2d") {
            item.filters = layerArray[lastConv].kernel_shape[3];
            item.fill = palette.secondary;
            count++;
        }

        // Ignore if flatten or dense for now
        else if ((item.type === "flatten") || (item.type === "dense")) {}

    });

    // Computes positions of each layer.
    // Generates information for future d3 data/join.
    const layerPositions = get_layer_positions(count, width, height);

    // Append further information regarding filters to each layer
    // Maps using layer array, which is pulled from JSON file.
    const layersWithPositions = layerArray.map((layer, i) => {
        // Appends further information to each conv and max layer
        if (layer.type === "conv2d" || layer.type === "maxpool2d") {
            const lp = layerPositions.shift(); // Saves element in layer position array
            const maxFiltersToShow = 10;  // Only vizualize up to 10 filters
            const visibleFilters = Math.min(layer.filters, maxFiltersToShow); // Show all filters in layer if <= 10
            const extra = layer.filters - visibleFilters; // Number of filters not vizualized

            // Saves all information needed for layer vizualizer
            return {
              ...layer, // Layer being processed from layer array
              x: lp.x, // Computed x
              y: lp.y, // Computed y
              
              filtersPositions: get_filter_positions(
                  visibleFilters,
                  lp.x,
                  lp.y,
                  lp.layerIndex,
                  layer.type
              ), // Generated filter positions
              extraFilters: extra > 0 ? `+ ${extra}` : "", // Extra filter text
              textPosition: { x: lp.x - 5, y: lp.y + 110 } // Position of text, relative to layer position
            };
        }

        // Do nothing if flatten or dense (yet)
        return {
            ...layer,
            x: null,
            y: null,
            extraFilters: "",
            textPosition: { x: null, y: null }
        };
    });

    return layersWithPositions; // Array of layers with appended information
}