class NetworkGraph{
    #simulation;
    #link;
    #node;
    #color;
    constructor(){
        this.#color = d3.scaleOrdinal(d3.schemeCategory10);
        const bbox = d3.select('#network-visualizer').node().getBoundingClientRect();
        const width = bbox.width;
        const height =  bbox.height;
        const svg = d3.select('#network-visualizer').append('svg');    
        this.#simulation = d3
            .forceSimulation()
            .force('link', d3.forceLink().distance(100).id((dataPoint)=>{return dataPoint.id}))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width/2, height/2))
            .force('x', d3.forceX())
            .force('y', d3.forceY())
            .alphaTarget(1)
            .on('tick', this.#tick)
        
        const group = svg.append('g');
        
        this.#link = group
            .append('g')
            .selectAll('.line');
        
        this.#node = group
        .append('g')
        .selectAll('.node');
    }

    updateCenter = () =>{
        const bbox = d3.select('#network-visualizer').node().getBoundingClientRect();
        const width = bbox.width;
        const height =  bbox.height;
        this.#simulation.force('center', d3.forceCenter(width/2, height/2));
    }
    
    updateGraph = (graphData) =>{
        this.#node = this.#node.data(graphData.nodes, function(d) {return d.source});
        this.#node.exit().remove();
        this.#node = this.#node.enter().append("circle").attr('class', 'node').attr("fill", (d) => { return this.#color(d.type) }).attr("r", 8)
        .call(d3.drag()
        .on('start', this.#dragstarted)
        .on('drag', this.#dragged)
        .on('end', this.#dragended)).merge(this.#node);
        
        this.#link = this.#link.data(graphData.links, function(d) { return d.source.id + "-" + d.target.id; });
        this.#link.exit().remove();
        this.#link = this.#link.enter().append('line').attr('class', 'link').merge(this.#link);
        // adding mouse over events
        const hiddenDiv = d3.select('body').append('div').attr('class', 'hover-data-div').style('opacity', 0);
        this.#node.on('mouseover', function (event, datum) {
            d3.select(this).transition()
            .duration('50')
            .attr('opacity', '.5');
            hiddenDiv.transition().duration(50).style('opacity', '1');
            hiddenDiv.text(datum.type).style('left', (event.pageX + 10) + 'px').style('top', (event.pageY - 15) + 'px');
        })
        .on('mouseout', function (event, datum) {
            d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1');
            
            hiddenDiv.transition().duration(50).style('opacity', 0)
        });
        this.#simulation.nodes(graphData.nodes);
        this.#simulation.force('link').links(graphData.links);
        this.#simulation.alpha(1).restart();
    }
    #tick = (e) =>{
        this.#node.attr('cx', d=>{return d.x})
        .attr('cy', d=> { return d.y });

        this.#link.attr('x1', d=>{ return d.source.x })
        .attr('y1', d=>{ return d.source.y })
        .attr('x2', d=>{ return d.target.x })
        .attr('y2', d=>{ return d.target.y });
    }
    
    #dragstarted = (event, d) => {
        if (!event.active) this.#simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
      
    #dragged = (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
    }
      
    #dragended = (event, d) => {
        if (!event.active) this.#simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

const ng = new NetworkGraph();