width=$(window).innerWidth();
height=$(window).innerHeight();
var svg = d3.select("svg")
    .attr("width",width)
    .attr("height",height)
var root=d3.select("#root");
$.ajaxSetup({
   async: false
});
me=$.get("https://kameli.hopto.org/graph/userdata/samelikameli/1326529849.json")["responseJSON"];
ff=me["followers"].concat(me["following"]);
ff=[...new Set(ff)];
var jsons={1326529849:me};
$("#bar-inner").css("width","0%");
for(i=0;i<ff.length;i++){
    p=(i+1)/ff.length*100;
    $("#bar-inner").css("width",p+"%");
    $("#bar-text").text(p+"%");
    r=$.get("https://kameli.hopto.org/graph/userdata/samelikameli/"+ff[i]+".json")["responseJSON"];
    jsons[r["id"]]=r;
}
$("#bar-outer").css("display","none");
$("#bar-inner").css("display","none");
var nodes_data =  [
    {"id": "1326529849"}
]
for(i=0;i<ff.length;i++){
    nodes_data.push({"id":ff[i]});
}
var links_data = [
    //{"source": "1326529849", "target": "1326529849"}
]
for(i=0;i<ff.length;i++){
    links_data.push({"source":"1326529849","target":ff[i]});
}
for(key in jsons){
    console.log(key);
    ff_json=jsons[key]["followers"].concat(jsons[key]["following"]);
    id=jsons[key]["id"];
    ff_json=[...new Set(ff_json)];
    for(j=0;j<ff_json.length;j++){
        if(jsons[id]!=undefined && jsons[ff_json[j]]!=undefined){
            links_data.push({"source":id,"target":ff_json[j]});
        }
    }

}

console.log(links_data);
var link = root.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links_data)
    .enter().append("line")
    .attr("stroke-width", 2);
d3.selectAll(".links").lower();
var simulation = d3.forceSimulation()
    .nodes(nodes_data);

simulation
    //.force("attract_force", d3.forceManyBody().strength(200).distanceMax(100).distanceMin(600))
    .force("repel_force", d3.forceManyBody().strength(-1000).distanceMax(500).distanceMin(1))
    //.force("charge_force",d3.forceManyBody())
    .force("center_force", d3.forceCenter(width / 2,height / 2))
    .force('collision', d3.forceCollide().radius(function(d){return d.radius}));


root.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes_data)
    .enter()
    .append("g")
    .attr("id",function(d){return "u"+d.id})
    .attr("class","node")
    .append("circle")
    .attr("r", 30)
    .style("fill", "red");

d3.selectAll("#u1326529849").select("circle").attr("r",40);


d3.selectAll(".node").append("text")
    .text(function(d){return jsons[parseInt(d.id)]["username"]})
    .attr("y",function(d){return -0.0*d3.selectAll("#u"+d.id).selectAll("text").node().getBBox()["height"]})
    .attr("x",function(d){return -0.5*d3.selectAll("#u"+d.id).selectAll("text").node().getBBox()["width"]});

var node=d3.selectAll(".node")
function tickActions() {
    d3.selectAll(".node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
}

svg.call(d3.zoom().on('zoom', function() {
    console.log("zoom");
    root.attr('transform', d3.event.transform);
}));


simulation.on("tick", tickActions );



var link_force =  d3.forceLink(links_data)
    .id(function(d) { return d.id; })
    .distance(function(d) {return 200})
    .strength(0.1);

simulation.force("links",link_force)

var drag_handler = d3.drag()
    .on("start", drag_start)
    .on("drag", drag_drag)
    .on("end", drag_end);

function drag_start(d) {
    if (!d3.event.active){
        simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
    
}

function drag_drag(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;

}

function drag_end(d) {
    if (!d3.event.active){
        simulation.alphaTarget(0.1);
    }
    d.fx = null;
    d.fy = null;
}

drag_handler(node);
function define_pattern(url,r,id){
    r=r*2;
    d3.select("defs").append("pattern")
        .attr("id",id)
        .attr("x","0")
        .attr("y","0")
        .attr("height",r)
        .attr("width",r)
        .append("image")
            .attr("x",0)
            .attr("y",0)
            .attr("height",r)
            .attr("width",r)
            .attr("xlink:href",url);
    
}



//define_pattern("https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/240px-Cat03.jpg",30,"cat")
d3.selectAll(".node").selectAll("text")
