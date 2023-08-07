try{
    const images = [
	    document.getElementById("straightRail0"),
	    document.getElementById("straightRail1"),
	    document.getElementById("straightRail2"),
	    document.getElementById("straightRail3"),
	    document.getElementById("straightRail4"),
	    document.getElementById("straightRail5"),
	    document.getElementById("straightRail6"),
	    document.getElementById("straightRail7")
    ];
    const gridSize = 20;
    const gridSizePx = 64;
    let width = 0;
    let height = 0;
    class Vec2{
        x = 0;
        y = 0;
        constructor(_x, _y){
            this.x = _x;
            this.y = _y;
        }
        equals(other){
            return(this.x == other.x && this.y == other.y);
        }
        static Zero(){
            return new Vec2(0,0);
        }
        static One(){
            return new Vec2(1,1);
        }
        static Lerp(a,b,i){
            o = new Vec2();
            o.x = (b.x - a.x) * i + a.x;
			o.y = (b.y - a.y) * i + a.y;
            return o;
        }
    }
    class Track{
        pos = Vec2.Zero();
        points = 0;
        lock = false;
        constructor(p){
            this.pos = p;
        }
        getPoint(pt){
            let i = 1 << pt;
            let b = this.points & i;
            return b > 0;
        }
        setPoint(pt, state){
            let i = 1 << pt;
            if(state){
                this.points = this.points | i;
            }else{
                this.points = this.points & ~i;
            }
        }
        togglePoint(pt){
            this.setPoint(pt, !this.getPoint(pt));
        }
        draw(){
            for(let i = 0; i < 8; i++){
                if(this.getPoint(i)){
                    getGame().ctx.drawImage(
                        images[i], 
                        this.pos.x * gridSizePx, 
                        this.pos.y * gridSizePx,
                        gridSizePx,
                        gridSizePx
                    );
                }
            }
        }
    }
    class Game{
        constructor(){
            this.grid = new Array(gridSize);
            for(let x = 0; x < gridSize; x++){
                this.grid[x] = new Array(gridSize);
                for(let y = 0; y < gridSize; y++){
                    this.grid[x][y] = new Track(new Vec2(x,y));
                }
            }
            this.canvas = document.getElementById("board");
            //this.canvas.width = gridSize * gridSizePx;
            //this.canvas.height = gridSize * gridSizePx;
            width = this.canvas.width;
            height = this.canvas.height; 
            this.ctx = this.canvas.getContext('2d');
            alert(this.canvas.width + ":" + (gridSize + gridSizePx));
            this.placeRailLine(new Vec2(0,0),new Vec2(4,4));
        }
        update(){

        }
        draw(){
            this.ctx.clearRect(0,0,gridSize*gridSizePx,gridSize*gridSizePx);
			this.drawGrid();
            for(let x = 0; x < gridSize; x++){
                for(let y = 0; y < gridSize; y++){
                    this.grid[x][y].draw();
                }
            }
        }
        drawGrid(){
            for(let x = 0; x < width/gridSizePx; x++){
                for(let y = 0; y < height/gridSizePx; y++){
                    this.ctx.strokeRect(x*gridSizePx,y*gridSizePx,gridSizePx,gridSizePx);
                }
            }
        }
        placeRailLine(start,end){
            let canPlace = false;
            if(Math.abs(start.x - end.x) == Math.abs(start.y - end.y)){
                canPlace = true;
            }
            if(start.x - end.x == 0){
                canPlace = true;
            }
            if(start.y - end.y == 0){
                canPlace = true;
            }
            if(start.equals(end)){
                canPlace = false;
            }
            if(!canPlace){
                return;
            }
            let direction = [2];
            if(dist2.x > 0){
                direction = [6,2];
            }
			if(dist2.x < 0){
				direction = [2,6];
			}
			if(dist2.y > 0){
                direction = [0,4];
            }
			if(dist2.y < 0){
				direction = [4,0];
			}
			if(dist2.x > 0 && dist2.y > 0){
				direction = [7,3];
			}
			if(dist2.x < 0 && dist2.y < 0){
				direction = [3,7];
			}
			if(dist2.x < 0 && dist2.y > 0){
				direction = [1,5];
			}
			if(dist2.x > 0 && dist2.y < 0){
				direction = [5,1];
			}
            let dist = Math.max(Math.abs(start.x - end.x), Math.abs(start.y - end.y));
            let dist2 = new Vec2(start.x - end.x, start.y - end.y);
            for(let i = 0; i < dist; i++){
                let cellPos = Vec2.Lerp(start,end,i/dist);
                var cell = this.grid[cellPos.x][cellPos.y];
                if(cell.lock){
                    continue;
                }
                for(let j = (i == dist ? 1 : 2); j < (i == 0 ? 1 : 2); j++){
                    cell.togglePoint(j);
                }
            }
        }
    }
    let game = new Game();
    game.draw();
    function getGame(){
        return game;
    }
}catch(e){
    alert(e + ":(");
}
