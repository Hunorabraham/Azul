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
    x;y;type;isDragged;
    constructor(x,y,type){
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 89;
        this.height = 91;
    }
    render(){
        draw.drawImage(imageDict[this.type],this.x,this.y);
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

//do physics simulation for the tiles pushing each other around, but ignore the one(s) being dragged(isDragged)
function collision(tileA,tileB){
    let dist = distance([tileA.x,tileA.y],[tileB.x,tileB.y]);
    let coll = ((dist-tileA.radius-tileB.radius)>0)?0:1;
    if(coll==1){
        let vec = [tileA.x-tileB.x,tileA.y-tileB.y];
        let normal = normalize(vec);//you need that funciton
        let relativeVela = flattenToB([tileA.velocityX,tileA.velocityY],vec);//you also need this function
        let relativeVelb = flattenToB([tileB.velocityX,tileB.velocityY],vec);
        //well screw this part, no momentum baing passed around, just each push the other by foce proportional to dist^2
        let vela = [(tileA.size-tileB.size)/(tileA.size+tileB.size)*relativeVela[0]+(2*tileB.size)/((tileA.size+tileB.size))*relativeVelb[0],(tileA.size-tileB.size)/(tileA.size+tileB.size)*relativeVela[1]+(2*tileB.size)/((tileA.size+tileB.size))*relativeVelb[1]];
        let velb = [(tileB.size-tileA.size)/(tileB.size+tileA.size)*relativeVelb[0]+(2*tileA.size)/((tileA.size+tileB.size))*relativeVela[0],(tileB.size-tileA.size)/(tileA.size+tileB.size)*relativeVelb[1]+(2*tileA.size)/((tileA.size+tileB.size))*relativeVela[1]];
        tileA.velocityX += vela[0]-relativeVela[0];
        tileA.velocityY += vela[1]-relativeVela[1];
        tileB.velocityX += velb[0]-relativeVelb[0];
        tileB.velocityY += velb[1]-relativeVelb[1];

        //no need to immediatelly split them
        let diff = tileA.radius+tileB.radius-dist;
        tileA.x += normal[0]*diff/2;
        tileA.y += normal[1]*diff/2;
        tileB.x -= normal[0]*diff/2;
        tileB.y -= normal[1]*diff/2;
    }
}
//start funcion, initialisation
function start(){
    //loop
    types = ["red","blue","snow","sun","thorn"];
    for(let i = 0; i < 100; i++){
        tiles.push(new tile(Math.random()*(width-89),Math.random()*(height-91),types[Math.floor(i/20)]));
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
    tiles.forEach(tile =>{
        tile.render();
    });
    
    wabi.render();
}
