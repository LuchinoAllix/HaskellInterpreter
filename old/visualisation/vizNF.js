// AI generated code for visualizing the normalizing result

window.addEventListener("DOMContentLoaded", () => {

  fetch("nf.json")
    .then(res => res.json())
    .then(data => {

      const width = window.innerWidth;
      const height = window.innerHeight;

      // --------- Récupération générique des enfants ----------
      function getChildren(node) {
        if (typeof node !== "object" || node === null) return [];

        let children = [];

        for (const key in node) {
          const value = node[key];

          // Tableau d'enfants
          if (Array.isArray(value)) {
            value.forEach(v => {
              if (typeof v === "object" && v !== null) {
                children.push(v);
              }
            });
          }
          // Objet enfant unique
          else if (typeof value === "object" && value !== null) {
            children.push(value);
          }
        }

        return children.length > 0 ? children : null;
      }

      // --------- Construction de la hiérarchie ----------
      const root = d3.hierarchy(data, getChildren);

      const treeLayout = d3.tree()
        .size([width - 100, height - 100]);

      treeLayout(root);

      const svg = d3.select("#astViz")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(50,50)");

      // --------- Liens ----------
      svg.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1.5)
        .attr("d", d3.linkVertical()
          .x(d => d.x)
          .y(d => d.y)
        );

      // --------- Nœuds ----------
      const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

      node.append("circle")
        .attr("r", 28)
        .attr("fill", "#dcdf35ff")
        .attr("stroke", "#c2a72eff")
        .attr("stroke-width", 2);

      // --------- Label principal : Afficher uniquement "type" ----------
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.4em")
        .attr("font-weight", "bold")
        .text(d => d.data.type || "node");

      // --------- Label secondaire : Afficher seulement les valeurs ----------
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1em")
        .attr("font-size", "10px")
        .text(d => {
          let label = "";

          // Afficher uniquement les valeurs (sans nom d'attribut)
          if (d.data.value !== undefined) {
            label += d.data.value;
          } else if (d.data.namedArg !== undefined && typeof d.data.namedArg !== 
            "object"){
            label += d.data.namedArg;
          } else if (d.data.exp !== undefined && 
                    typeof d.data.exp !== "object"){
            label += d.data.exp;
          }  else if (d.data.name) {
            label += d.data.name;
          } else if (d.data.blt) {
            label += d.data.blt;
          }

          return label;
        });
    });
});
