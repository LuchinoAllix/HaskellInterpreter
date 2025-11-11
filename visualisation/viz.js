

// AI generated code for visualizing the parsing result

window.addEventListener("DOMContentLoaded", () => {

  fetch("ast.json")
  .then(res => res.json())
  .then(ast => {
    const width = window.innerWidth, height = window.innerHeight;
    const root = d3.hierarchy(ast, d => d.childs);
    const tree = d3.tree().size([width - 100, height - 100]);
    tree(root);
  
    const svg = d3.select("#astViz")
      .append("g")
      .attr("transform", "translate(50,50)");
  
    svg.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("stroke", "#ccc")
      .attr("fill", "none")
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      );
  
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);
  
    node.append("circle")
      .attr("r", 30)
      .attr("fill", "#b350c7ff")
      .attr("stroke", "#3b0437ff");
  
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.3em")
      .text(d => d.data.type);
  
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("font-size", "10px")
      .text(d => d.data.value ? `"${d.data.value}"` : "");
  });

});
