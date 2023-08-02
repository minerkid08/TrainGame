try{
    const gridSize = 16;
    const gridSizePx = 64;
    class Vec2{
        x = 0;
        y = 0;
        constructor(_x, _y){
            this.x = _x;
            this.y = _y;
        }
        static Zero(){
            return new Vec2(0,0);
        }
    }
    class Track{
        pos = Vec2.Zero();
        points = 0;
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
            this.canvas.width = gridSize * gridSizePx;
            this.canvas.height = gridSize * gridSizePx;
            this.ctx = this.canvas.getContext('2d');
            alert(this.canvas.width + ":" + (gridSize + gridSizePx));
        }
        update(){

        }
        draw(){
            this.ctx.clearRect(0,0,gridSize*gridSizePx,gridSize*gridSizePx);
            this.drawGrid();
        }
        drawGrid(){
            for(let x = 0; x < gridSize; x++){
                for(let y = 0; y < gridSize; y++){
                    this.canvas.strokeRect(x*gridSizePx,y*gridSizePx,gridSizePx,gridSizePx);
                }
            }
        }
    }
    let game = new Game();
    game.draw();
}catch(e){
    alert(e + ":(");
}
