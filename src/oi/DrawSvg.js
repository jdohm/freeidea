
function draw(id){
    var doc = document.implementation.createDocument("", "", null);

    var svg = doc.createElement("svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("xmlns:sodipodi", "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd");
    svg.setAttribute("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape");
    svg.setAttribute("width", "150");
    svg.setAttribute("height", "150");
    svg.setAttribute("viewBox", "0 0 150 150");
    svg.setAttribute("version", "1.1");

    var newRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    newRect.setAttributeNS(null,"width", "150");
    newRect.setAttributeNS(null,"height", "150");
    newRect.setAttributeNS(null,"fill", "#FFFFFF");
    svg.appendChild(newRect);

    setID(svg,id);

    svg.appendChild(setText({x:25, y:100, fill:'#000000', transform:'rotate(-90, 25,100)'}, "test"));
    svg.appendChild(setText({x:75, y:100, fill:'#000000', transform:'rotate(-90, 75,100)'}, "test"));
    svg.appendChild(setText({x:125, y:100, fill:'#000000', transform:'rotate(-90, 125,100)'}, "test"));

    // return svg;
    return testSVG;
}
export {draw}



function setID(svg, id) {
    svg.appendChild(setText({x:0,   y:50, fill:'#000000'}, "#"+id));
    svg.appendChild(setText({x:50,  y:50, fill:'#000000'}, "#"+id));
    svg.appendChild(setText({x:100, y:50, fill:'#000000'}, "#"+id));
}

var svgNS = "http://www.w3.org/2000/svg";
function setText(v, t) {
    let elem = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    for (var p in v)
        elem.setAttributeNS(null, p, v[p]);
    elem.textContent = t;
    return elem;
}

var testSVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="150" height="150" viewBox="0 0 150 150" version="1.1"> <rect width="150" height="150" fill="#FFFFFF"/> </svg>`
