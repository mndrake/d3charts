HTMLWidgets.widget({

  name: 'bubblemap',

  type: 'output',

  initialize: function(el, width, height) {
    return {
      width: width, height: height
    }
  },

  renderValue: function(el, x, instance) {

    // hack for now, need to separate map initialization and data population
    d3.select(el).empty()

    var states = HTMLWidgets.getAttachmentUrl('shapes', 'states'),
        data = HTMLWidgets.dataframeToD3(x.data),
        sizes = [10000, 100000, 250000];

    var container = d3.select(el),
        width = instance.width,
        height = instance.height;

    var projection = d3.geo.albersUsa()
      .scale(1100)
      .translate([width / 2, height / 2]);

    var path = d3.geo.path()
      .projection(projection);

    var svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var g = svg.append("g");

    g.append( "rect" )
        .attr("width",width)
        .attr("height",height)
        .attr("fill","white")
        .attr("opacity",0)
        .on("mouseover",function(){
            hoverData = null;
            if ( probe ) probe.style("display","none");
        });

    var map = g.append("g")
        .attr("class", "map");

    var probe, hoverData;

    probe = container.append("div")
      .attr("class","probe");

    var format = d3.format(",");

    function circleSize(d){
        return Math.sqrt( .02 * Math.abs(d) );
    };

    d3.json(states, function(error, us) {
        map.selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter()
            .append("path")
            .attr("vector-effect","non-scaling-stroke")
            .attr("class","land")
            .attr("d", path);

        map.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) {
               return a !== b; }))
            .attr("class", "state-boundary")
            .attr("vector-effect","non-scaling-stroke")
            .attr("d", path);

         // draw city points
        for ( var i in data ){
            var projected = projection([ parseFloat(data[i].LON), parseFloat(data[i].LAT) ]);
            map.append("circle")
                .datum( data[i] )
                .attr("cx",projected[0])
                .attr("cy",projected[1])
                .attr("r",1)
                .attr("vector-effect","non-scaling-stroke")
                .on("mousemove", function(d){
                    hoverData = d;
                    setProbeContent(d);
                    probe
                        .style( {
                            "display" : "block",
                            "top" : (d3.event.pageY - 80) + "px",
                            "left" : (d3.event.pageX + 10) + "px"
                        });
                })
                .on("mouseout",function(){
                    hoverData = null;
                    probe.style("display","none");
                });
        }

    // create legend
    var legend = g.append("g").attr("class","legend").attr("transform","translate(560,10)");

    legend.append("circle").attr("class","gain").attr("r",5).attr("cx",5).attr("cy",10);
    legend.append("circle").attr("class","loss").attr("r",5).attr("cx",5).attr("cy",30);

    legend.append("text").text("gained").attr("x",15).attr("y",13);
    legend.append("text").text("lost").attr("x",15).attr("y",33);

    for ( var i in sizes ){
        legend.append("circle")
            .attr( "r", circleSize( sizes[i] ) )
            .attr( "cx", 80 + circleSize( sizes[sizes.length-1] ) )
            .attr( "cy", 2 * circleSize( sizes[sizes.length-1] ) - circleSize( sizes[i] ) )
            .attr("vector-effect","non-scaling-stroke");
        legend.append("text")
            .text( (sizes[i] / 1000) + "K" + (i == sizes.length-1 ? "" : "") )
            .attr( "text-anchor", "middle" )
            .attr( "x", 80 + circleSize( sizes[sizes.length-1] ) )
            .attr( "y", 2 * ( circleSize( sizes[sizes.length-1] ) - circleSize( sizes[i] ) ) + 5 )
            .attr( "dy", 13)
    }

    // initalize map
    var circle = map.selectAll("circle")
        .sort(function(a,b){
            // catch nulls, and sort circles by size (smallest on top)
            if ( isNaN(a.VALUE) ) a.VALUE = 0;
            if ( isNaN(b.VALUE) ) b.VALUE = 0;
            return Math.abs(b.VALUE) - Math.abs(a.VALUE);
        })
        .attr("class",function(d){
            return d.VALUE > 0 ? "gain" : "loss";
        })
        .attr("r",function(d){
            return circleSize(d.VALUE)
        });

    if (hoverData){
        setProbeContent(hoverData);
    }

    });

    function setProbeContent(d){
        var val = d.VALUE;
        var html = "<strong>" + d.LABEL + "</strong><br/>" +
            format( Math.abs( val ) ) + " " + ( val < 0 ? "lost" : "gained" ) + "<br/>";
        probe
            .html( html );
    }
  },

  resize: function(el, width, height, instance) {

  }

});
