
// --- Node fill palette ---
const nodeFillPalette = ["#1D4930", "#C299FA", "#BBF932", "#FF64CA"];

// --- Node list ---
const nodeNames = [
  "Sequence", "Feedback", "Emergent behavior", "Iteration", "Feedback loop", "Randomness", "Imperfection", "Documentation", "Process", "Sketch", "Structure", "Emergence", "Interaction", "Texture", "Emotion", "Timing", "Motion", "Bicycles", "Flow", "Observation", "Literature", "Narrative Arc", "Books", "Memory", "Poetic Fragment", "Film Photography", "Nature", "Calm", "Water", "Abstraction", "Noise", "Clarity", "Tactility", "Digital", "Intensity", "Hand drawn animation", "Procedural", "Dancing", "Narrative", "Philosophy", "Music"
];
const nodes = nodeNames.map(name => ({ id: name }));
console.log('Nodes:', nodes);

// --- Edge list ---
const links = [
  ["Sequence", "Feedback"],
  ["Feedback", "Emergent behavior"],
  ["Iteration", "Feedback loop"],
  ["Randomness", "Imperfection"],
  ["Documentation", "Process"],
  ["Sketch", "Structure"],
  ["Feedback loop", "Emergence"],
  ["Interaction", "Structure"],
  ["Texture", "Emotion"],
  ["Timing", "Motion"],
  ["Bicycles", "Flow"],
  ["Bicycles", "Observation"],
  ["Literature", "Narrative Arc"],
  ["Literature", "Emotion"],
  ["Books", "Memory"],
  ["Books", "Feedback loop"],
  ["Poetic Fragment", "Narrative Arc"],
  ["Film Photography", "Imperfection"],
  ["Nature", "Calm"],
  ["Water", "Motion"],
  ["Books", "Abstraction"],
  ["Observation", "Memory"],
  ["Feedback", "Sketch"],
  ["Feedback loop", "Motion"],
  ["Water", "Process"],
  ["Literature", "Process"],
  ["Texture", "Tactility"],
  ["Books", "Feedback"],
  ["Noise", "Emergent behavior"],
  ["Film Photography", "Emotion"],
  ["Interaction", "Emotion"],
  ["Narrative Arc", "Motion"],
  ["Process", "Narrative"],
  ["Procedural", "Emergent behavior"],
  ["Procedural", "Motion"],
  ["Procedural", "Timing"],
  ["Procedural", "Nature"],
  ["Procedural", "Feedback loop"],
  ["Hand drawn animation", "Randomness"],
  ["Hand drawn animation", "Abstraction"],
  ["Hand drawn animation", "Sketch"],
  ["Hand drawn animation", "Motion"],
  ["Hand drawn animation", "Timing"],
  ["Hand drawn animation", "Observation"],
  ["Hand drawn animation", "Emergence"],
  ["Hand drawn animation", "Imperfection"],
  ["Hand drawn animation", "Flow"],
  ["Hand drawn animation", "Poetic Fragment"],
  ["Hand drawn animation", "Texture"],
  ["Dancing", "Structure"],
  // --- Water connections ---
  ["Water", "Calm"],
  ["Water", "Nature"],
  ["Water", "Emotion"],
  ["Water", "Noise"],
  ["Water", "Flow"],
  // --- Literature connections ---
  ["Literature", "Philosophy"],
  ["Literature", "Documentation"],
  ["Literature", "Books"],
  ["Literature", "Observation"],
  // --- Dancing connections ---
  ["Dancing", "Motion"],
  ["Dancing", "Flow"],
  // --- Music connections ---
  ["Music", "Dancing"],
  ["Music", "Motion"],
  ["Music", "Abstraction"],
  ["Music", "Interaction"],
  ["Music", "Observation"],
  ["Music", "Memory"],
  ["Music", "Noise"],
  ["Music", "Imperfection"],
  ["Music", "Poetic Fragment"],
  ["Music", "Process"],
  ["Music", "Sketch"],
  ["Music", "Emotion"],
  // --- Emotion new connections ---
  ["Emotion", "Tactility"],
  ["Emotion", "Emergence"],
  ["Emotion", "Books"],
  ["Emotion", "Process"],
  // --- Film Photography new connections ---
  ["Film Photography", "Noise"],
  ["Film Photography", "Observation"],
  // --- New connections ---
  ["Intensity", "Music"],
  ["Intensity", "Dancing"],
  ["Intensity", "Memory"],
  ["Intensity", "Emotion"],
  ["Poetic Fragment", "Randomness"],
  ["Poetic Fragment", "Emotion"],
  ["Poetic Fragment", "Philosophy"],
  ["Sequence", "Structure"],
  ["Narrative", "Sequence"],
  ["Narrative", "Poetic Fragment"],
  ["Narrative", "Observation"],
  ["Narrative", "Philosophy"],
  ["Documentation", "Memory"],
  ["Documentation", "Sketch"],
  ["Music", "Emotion"],
  ["Music", "Timing"],
  ["Music", "Flow"],
  ["Music", "Books"],
  ["Abstraction", "Philosophy"],
  ["Abstraction", "Structure"],
  ["Abstraction", "Books"],
  ["Water", "Flow"],
  ["Water", "Calm"]
].map(([source, target]) => ({ source, target }));
console.log('Links:', links);

// --- Check for missing nodes in links ---
const nodeSet = new Set(nodeNames);
const missing = [];
links.forEach(l => {
  if (!nodeSet.has(l.source)) missing.push(l.source);
  if (!nodeSet.has(l.target)) missing.push(l.target);
});
if (missing.length) {
  console.error('Missing nodes referenced in links:', Array.from(new Set(missing)));
}

// --- SVG and D3 Setup ---
const svg = d3.select("#concept-svg");
const width = window.innerWidth;
const height = window.innerHeight;
svg.attr("width", width).attr("height", height);
console.log('SVG selected:', svg.node());

// --- Node linear gradients (unique for each node, cycling pairs) ---
const defs = svg.append("defs");
const nodeGradientIds = {};
nodes.forEach((node, i) => {
  const colorA = nodeFillPalette[i % nodeFillPalette.length];
  const colorB = nodeFillPalette[(i + 1) % nodeFillPalette.length];
  const gradId = `nodefill${i}`;
  nodeGradientIds[node.id] = gradId;
  const grad = defs.append("linearGradient")
    .attr("id", gradId)
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "100%")
    .attr("y2", "0%")
  grad.append("stop").attr("offset", "0%")
    .attr("stop-color", colorA).attr("stop-opacity", 0.95);
  grad.append("stop").attr("offset", "100%")
    .attr("stop-color", colorB).attr("stop-opacity", 0.85);
});

// --- Zoom and Pan ---
const g = svg.append("g");
svg.call(d3.zoom()
  .scaleExtent([0.4, 2.5])
  .on("zoom", (event) => g.attr("transform", event.transform))
);

// --- Force Simulation ---
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(180).strength(0.7))
  .force("charge", d3.forceManyBody().strength(-600))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide(24));
console.log('Simulation created');

// --- Draw Links ---
const link = g.append("g")
  .attr("stroke-linecap", "round")
  .selectAll("line")
  .data(links)
  .enter().append("line")
  .attr("class", "link")
  .attr("stroke-width", 1)
  .attr("stroke", "#fff");
console.log('Links drawn');

// --- Draw Nodes ---
const node = g.selectAll(".node-group")
  .data(nodes)
  .enter().append("g")
  .attr("class", "node-group")
  .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended)
  );

node.append("circle")
  .attr("class", "node-circle")
  .attr("r", 22)
  .attr("fill", d => `url(#${nodeGradientIds[d.id]})`);

node.append("text")
  .attr("class", "node-label")
  .attr("dy", ".35em")
  .text(d => d.id);
console.log('Nodes drawn');

// --- Breathing Animation ---
function breathe() {
  node.select("circle")
    .transition().duration(2000).attr("r", 24)
    .transition().duration(2000).attr("r", 22)
    .on("end", breathe);
}
breathe();

// --- Highlight on Click ---
node.on("click", function(event, d) {
  event.stopPropagation();
  const neighbors = new Set();
  links.forEach(l => {
    if (l.source === d.id) neighbors.add(l.target);
    if (l.target === d.id) neighbors.add(l.source);
  });
  node.select("circle")
    .classed("selected", n => n.id === d.id)
    .classed("neighbor", n => neighbors.has(n.id))
    .classed("dimmed", n => n.id !== d.id && !neighbors.has(n.id));
  link
    .classed("highlighted", l => l.source === d.id || l.target === d.id)
    .classed("dimmed", l => l.source !== d.id && l.target !== d.id);
});

svg.on("click", () => {
  node.select("circle").classed("selected", false).classed("neighbor", false).classed("dimmed", false);
  link.classed("highlighted", false).classed("dimmed", false);
});

// --- Update positions ---
simulation.on("tick", () => {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);
  node.attr("transform", d => `translate(${d.x},${d.y})`);
});

function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}
function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}
function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
} 