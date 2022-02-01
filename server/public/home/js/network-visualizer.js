function visualizeData(data){
    d3.select('#network-visualizer')
    .data(data)
    .enter()
    .append('p')
    .text(data=>data)
    .exit()
    .remove();
}

const graphData = {
    nodes: [
        {id: 'computer'},
        {id: 'me'},
        {id: 'you'},
        {id: 'her'},
        {id: 'him'},
        {id: 'they'},
    ],
    links: [
        {source: 'computer', target: 'me'},
        {source: 'computer', target: 'you'},
        {source: 'computer', target: 'her'},
        {source: 'computer', target: 'him'},
        {source: 'computer', target: 'they'}
    ]
}
const width = 640;
const height = 480;

const svg = d3.select('#network-visualizer').append('svg');
svg.attr('width', width).attr('height', height);

const simulation = d3
    .forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links).distance(50).id((dataPoint)=>{return dataPoint.id}))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width/2, height/2))
    .on('tick', tick)

const link = svg
    .append('g').attr('class', 'link')
    .selectAll('line')
    .data(graphData.links)
    .enter()
    .append('line');

const node = svg
    .append('g').attr('class', 'node')
    .selectAll('circle')
    .data(graphData.nodes)
    .enter()
    .append('circle')
    .attr('r', 10)
    .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

// adding mouse over events
const hiddenDiv = d3.select('body').append('div').attr('class', 'hover-data-div').style('opacity', 0);
node.on('mouseover', function (event, datum) {
    d3.select(this).transition()
    .duration('50')
    .attr('opacity', '.5');
    hiddenDiv.transition().duration(50).style('opacity', '1');
    hiddenDiv.text(datum.id).style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 15) + 'px');
    console.log(event)
    console.log(datum);
})
    .on('mouseout', function (event, datum) {
    d3.select(this).transition()
    .duration('50')
    .attr('opacity', '1');

    hiddenDiv.transition().duration(50).style('opacity', 0)
});


function tick(e){
    node.attr('cx', d=>{return d.x})
        .attr('cy', d=> { return d.y });

    link.attr('x1', d=>{ return d.source.x })
        .attr('y1', d=>{ return d.source.y })
        .attr('x2', d=>{ return d.target.x })
        .attr('y2', d=>{ return d.target.y });
}

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