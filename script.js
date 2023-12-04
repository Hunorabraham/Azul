//rendering
let c = document.getElementById("LayerTop");
let draw = c.getContext("2d");
let width = c.width;
let height = c.height;
let imageBuffer = draw.createImageData(width,height);//initialize
let bufferData = imageBuffer.data;


//tile images
let red = new Image();
red.src = "./img/red.png";
let snow = new Image();
snow.src = "./img/snow.png";
let sun = new Image();
sun.src = "./img/sun.png";
let thorn = new Image();
thorn.src = "./img/thorn.png";
let blue = new Image();
blue.src = "./img/blue.png";
const imageDict = {
    "red": red,
    "snow": snow,
    "sun": sun,
    "thorn": thorn,
    "blue": blue
}


//fixed update timing variables
let deltaTime = 20;
let speedup = 1;
let planc = deltaTime/1000*speedup;


let mouseX,mouseY;
//outline-less stile
draw.strokeStyle = "rgba(0,0,0,0)";
//drawb.strokeStyle = "rgba(0,0,0,0)";

//rendering functions
function drawCircle(position, radius, colour){
    draw.beginPath();
    draw.arc(position[0],position[1],radius,0,Math.PI*2);
    draw.strokeStyle = "rgba(0,0,0,0)";//renistating the strokeless stile
    draw.stroke();
    draw.fillStyle = colour;
    draw.fill();
    draw.closePath();
}
function drawLine(start, end, colour){
    drawb.beginPath();
    drawb.moveTo(start[0],start[1]);
    drawb.lineTo(end[0],end[1]);
    drawb.strokeStyle = colour;
    drawb.stroke();
    drawb.closePath();
}

//cursor bs
class cursor{
    x;
    y;
    updatePos(x,y){
        this.x = x;
        this.y = y;
    }
    render(){
        drawCircle([this.x,this.y],10,"rgba(50,50,50,0.7)");
    }
}
let wabi = new cursor();
function getMousePosition(){
    let rect = c.getBoundingClientRect();
    let e = window.event;
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    wabi.updatePos(mouseX,mouseY);
}

class tile{
    x;y;type;isDragged;velocityX;velocityY;width
    constructor(x,y,type){
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 89;
        this.height = 91;
        this.isDragged = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.width = Math.min(height,width)/10;
    }
    update(){
        this.x += this.velocityX*planc;
        this.y += this.velocityY*planc;
        this.velocityX*=(Math.abs(this.velocityX)<2)?0:0.9;
        this.velocityY*=(Math.abs(this.velocityY)<2)?0:0.9;
        this.velocityX += (this.x<0)?planc*500:0;
        this.velocityX -= (this.x>width-this.width)?planc*500:0;
        this.velocityY += (this.y<0)?planc*500:0;
        this.velocityY -= (this.y>height-this.width)?planc*500:0;
    }
    render(){
        draw.drawImage(imageDict[this.type],this.x,this.y,this.width,this.width);
    }
    bound(locationX,locationY){
        return (locationX>this.x&&locationX<this.x+this.width&&locationY>this.y&&locationY<this.y+this.height)?true:false;
    }
}
let tiles = [];
let dragged = [];

//clicking stuff
function startDrag(){
    for(let i = tiles.length-1; i >=0;i--){
        if(tiles[i].bound(mouseX,mouseY)){
            dragged.push([tiles[i],tiles[i].x-mouseX,tiles[i].y-mouseY]);
            tiles[i].isDragged = true;
            break;
        }
    }
}
function release(){
    dragged.forEach(tile=>{
        tile.isDragged = false;
    });
    dragged = [];
}

//vector functions
function magnitude(a){
    return(Math.sqrt(a[0]*a[0]+a[1]*a[1]));
}
function normalize(raw){
    let mag = magnitude(raw);
    return [raw[0]/mag,raw[1]/mag];
}
function distance(pos1,pos2){
    return Math.sqrt(Math.abs((pos2[0]-pos1[0])*(pos2[0]-pos1[0])+(pos2[1]-pos1[1])*(pos2[1]-pos1[1])));
}
function dotProduct(a,b){
    return a[0]*b[0]+a[1]*b[1];
}
function flattenToB(a,b){
    let maga = magnitude(a);
    let magb = magnitude(b);
    let norm = normalize(b);
    let mag = maga*(dotProduct(a,b)/(maga*magb));
    return (maga==0)?[0.0,0.0]:[norm[0]*mag,norm[1]*mag];
}
function clamp(x,min,max){
    return (x>max)?max:(x<min)?min:x;
}

function collision(tileA,tileB){
    let dist = distance([tileA.x,tileA.y],[tileB.x,tileB.y]);
    let coll = ((dist-tileA.width)>0)?0:1;
    if(coll==1){
        let vec = [tileA.x-tileB.x,tileA.y-tileB.y];
        let normal = normalize(vec);//you need that funciton
        tileA.velocityX += normal[0]*planc*500;
        tileA.velocityY += normal[1]*planc*500;
        tileB.velocityX -= normal[0]*planc*500;
        tileB.velocityY -= normal[1]*planc*500;
    }
}
//start funcion, initialisation
function start(){
    //loop
    types = ["red","blue","snow","sun","thorn"];
    for(let i = 0; i < 10; i++){
        tiles.push(new tile(Math.random()*(width-89),Math.random()*(height-91),types[Math.round(Math.random()*4)]));
    }
    setInterval(() => {
        update();
    }, deltaTime);
}
//start start
start();

//fixedupdate
function update(){
    draw.clearRect(0,0,width,height);
    dragged.forEach(tilePrim => {
        tilePrim[0].x = mouseX + tilePrim[1];
        tilePrim[0].y = mouseY + tilePrim[2];
    })
    for(let i = 0; i < tiles.length;i++){
        for(let j = 1; j < tiles.length-i;j++){
            collision(tiles[i],tiles[i+j]);
        }
    }
    tiles.forEach(tile =>{
        tile.update();
        tile.render();
    });
    
    wabi.render();
}
