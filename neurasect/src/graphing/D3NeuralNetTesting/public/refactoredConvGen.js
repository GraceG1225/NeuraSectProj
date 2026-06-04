function computeVerticalPositions(layers, svgWidth, svgHeight, squareSize = 80, gap = 15) {

  // Total height of all squares + all gaps between them
  const totalHeight = layers * squareSize + (layers - 1) * gap;

  // Center the column horizontally
  const startX = (svgWidth - squareSize) / 2;

  // Center the column vertically
  const startY = (svgHeight - totalHeight) / 2;

  return Array.from({ length: layers }, (_, i) => ({
    x: startX,
    y: startY + i * (squareSize + gap),
    idx: i
  }));

}

function modifySquares(stack, positions, opts = {}) {
  const {
    width = 80,
    height = 80,
    fill = "yellow",
    stroke = "#333",
    strokeWidth = 2,
    id = "square"
  } = opts;

  console.log("erm");
  const uses = stack.selectAll(`rect.${id}`)
    .data(positions, d => d.idx);

  uses.join(
    enter => enter.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("class", id)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .append("title").text((d, i) => `Square ${i + 1}`),

    update => update
        .transition()          // <— transition added here
        .duration(500)
        .attr("x", d => d.x)
        .attr("y", d => d.y),
    exit => exit.remove()
  );

}

function restoreStack(stack) {
  const node = stack.node();
  const saved = node._originalSquares;

  if (!saved) return; // nothing to restore

  // Rebind data
  const rects = stack.selectAll(".square")
    .data(saved, d => d.idx);

  rects.join(
    enter => enter.append("rect")
      .transition()
      .duration(250)
      .attr("class", "square")
      .attr("width", d => d.width)
      .attr("height", d => d.height)
      .attr("fill", d => d.fill)
      .attr("stroke", d => d.stroke)
      .attr("stroke-width", d => d.strokeWidth)
      .attr("x", d => d.x)
      .attr("y", d => d.y),

    update => update
      .transition()
      .duration(300)
      .attr("width", d => d.width)
      .attr("height", d => d.height)
      .attr("x", d => d.x)
      .attr("y", d => d.y),

    exit => exit.remove()
  );
}

function appendSquares(svg, layers = 5, opts = {}) {
  const {
    startX = 210,
    startY = 140,
    dx = -10,
    dy = 10,
  } = opts;

  // build data array of positions
  // Ex: {x: 200, y: 140: idx: 1}
  const positions = Array.from({ length: layers }, (_, i) => ({
    x: startX + i * dx,
    y: startY + i * dy,
    idx: i
  }));

  const stack = svg.selectAll("g.stack")
    .data([null])
    .join("g")
    .attr("class", "stack");

  modifySquares(stack, positions)

}

async function createSVG(layers, width = 1200, height = 1200) {

    // Create SVG container
    let svg = d3.select('body')
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // TODO Tomorrow: Create many stacks (layers) and group them into groups.
    appendSquares(svg, layers);

    const s = ".square";
    let stacks = svg.selectAll(".stack");

    let state = 0;

    const squares = stacks.selectAll(s);
    const originalPositions = squares.data(); 

    stacks.on("click", function(event, d) {

      event.stopPropagation();

      const selection = d3.select(this);

      const node = selection.node();

      node._originalSquares = selection.selectAll(".square").nodes().map(el => ({
        x: +el.getAttribute("x"),
        y: +el.getAttribute("y"),
        width: +el.getAttribute("width"),
        height: +el.getAttribute("height"),
        fill: el.getAttribute("fill"),
        stroke: el.getAttribute("stroke"),
        strokeWidth: el.getAttribute("stroke-width"),
        idx: el.__data__.idx   // keep your data key
      }));

      // state 0 -> state 1
      if (state == 0) {

        const newPositions = computeVerticalPositions(layers, width, height);
        modifySquares(selection, newPositions);

        state = 1;

        console.log(`State: ${state}`);
        
      }

      // state 1 -> state 2
      else if (state === 1) {

        const target = event.target;

        if (target.classList.contains("square")) {

          const clicked = d3.select(target);

          const others = selection
            .selectAll(".square")
            .filter(function() { return this !== target; });

          // Fade out others, then remove them
          others
            .transition()
            .duration(250)
            .style("opacity", 0)
            .on("end", function() {
              d3.select(this).remove();
            });

          // Enlarge clicked square
          clicked
            .transition()
              .duration(250)
            .attr("width", "400")
            .attr("height", "400")
            .attr("y", 600)
            .attr("x",600);

          state = 2;
          console.log(`State: ${state}`);
        }
      }


    });

    svg.on("click", function(event) {

      const stack = d3.selection(this).select(".stack");
      console.log(originalPositions);


      if (stacks.node().contains(event.target)) return;

      
      if (state == 1) {

        modifySquares(stack, originalPositions);

        state = 0;

        console.log(`State: ${state}`);
        
      }

      if (state == 2) {
        restoreStack(stack);

        state = 1;

        console.log(`State: ${state}`);
      }

    });


    // // Save originals once
    // gStack.each(function() {
    //     this._origGroupTransform = d3.select(this).attr("transform") || "translate(0,0)";
    //     d3.select(this).selectAll("use").each(function() {
    //         this._origTransform = d3.select(this).attr("transform") || "translate(0,0)";
    //     });
    //     this._moved = false; // state flag: falsedd = state0 (original), true = state1 (moved)
    // });

    
    // gStack.on("click", function(event) {
    //     // prevent the svg click handler from seeing this click
    //     event.stopPropagation();

    //     if (state == 2) return; // already moved; ignore clicks on squares while in state1

    //     if (state == 0) {          
            
    //     }

    //     // if (state == 1) {
    //     //     const target = event.target;
    //     //     if (target && target.tagName && target.tagName.toLowerCase() === "rect") {
    //     //         const clicked = d3.select(target);
    //     //         const other = gSquares.selectAll("rect").filter(function() { return this !== target; });

    //     //         // save originals if not already saved
    //     //         if (target._origFill === undefined) target._origFill = clicked.attr("fill") || null;
    //     //         other.each(function() { if (this._origOpacity === undefined) this._origOpacity = d3.select(this).style("opacity") || "1"; });


                    

    //     //         // record focused and advance state
    //     //         focused = target;
    //     //         state = 2;
    //     //     }
    //     //     return;
    //     // }

    
    // });

    // 3) Click on the SVG — if click is outside the group and group is moved, restore originals
    // svg.on("click", function(event) {
    // // if the click target is inside the group, do nothing
    // if (gStack.node().contains(event.target)) return;

    // // for each group (here only one) restore if moved
    // gSquares.each(function() {
    //     if (!this._moved) return;

    //     const g = d3.select(this);
    //     g.transition().duration(500).attr("transform", this._origGroupTransform);

    //     d3.select(this).selectAll("rect").each(function() {
    //     d3.select(this).transition().duration(500).attr("transform", this._origTransform);
    //     });

    //     this._moved = false;
    // });
    // });

    

}

async function main() {
    const layers = 10;
    createSVG(layers);
}

main()