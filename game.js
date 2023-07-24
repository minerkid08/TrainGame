//consts
try{
	var canvas = document.getElementById("board");
	var ctx = canvas.getContext("2d");
	var contractCanvas = document.getElementById("contracts");
	var contractCtx = contractCanvas.getContext("2d");
	const gridSize = 64;
	var contracts = [];
	var keys = {w:false,a:false,s:false,d:false};
	const mapSize = 20;
	var money = 2500;//2.5k
	var moneyDiv = document.getElementById("money");
	map = new Array(mapSize);
	for(var x = 0; x < mapSize; x++){
		map[x] = new Array(mapSize);
	}
	//image
	const images = [
		document.getElementById("straightRail0"),
		document.getElementById("straightRail1"),
		document.getElementById("straightRail2"),
		document.getElementById("straightRail3"),
		document.getElementById("straightRail4"),
		document.getElementById("straightRail5"),
		document.getElementById("straightRail6"),
		document.getElementById("straightRail7")
	]
	function tileFromWorldPos(pos){
		return map[Math.floor(pos.x/64)][Math.floor(pos.y/64)];
	}
	class Rail{
		constructor(p, pts){
			this.type = "rail";
			this.pos = p;
			this.pts = pts;
			this.lock = false;
			this.switchPos = 1;
			this.station = null;
			this.hasTrain = false;
		}
		draw(){
			for(var i = 0; i < this.pts.length; i++){
				ctx.drawImage(images[this.pts[i]], (this.pos.x * gridSize) + playerPos.x, (this.pos.y * gridSize) + playerPos.y, gridSize, gridSize);
			}
			if(this.station == null && this.pts.length > 2){
				ctx.font = "32px serif";
				ctx.fillStyle = "#000000";
				ctx.fillText(this.switchPos.toString(), this.pos.x * 64, this.pos.y * 64 + 32);
			}
		}
		drawStation(mode){
			var pts = (mode == Station.mode.In ? [2] : (mode == Station.mode.Out ? [6] : [2,6]));
			for(var i = 0; i < pts.length; i++){
				ctx.drawImage(images[pts[i]], (this.pos.x * gridSize) + playerPos.x, (this.pos.y * gridSize) + playerPos.y, gridSize, gridSize);
			}
		}
		nextseg(seg){
			var pts = [];
			var posiblePts = [];
			posiblePts.push(this.nextPt(seg,3));
			posiblePts.push(this.nextPt(seg,4));
			posiblePts.push(this.nextPt(seg,5));
			for(var i in this.pts){
				if(posiblePts.includes(this.pts[i])){
					pts.push(this.pts[i]);
				}
			}
			pts.sort(function(a, b){return a - b});
			if(this.switchPos >= pts.length){
				this.switchPos--;
				if(this.switchPos >= pts.length){
					this.switchPos--;
				}
			}
			return pts[this.switchPos];
		}
		nextPt(pt, rot){
			pt += rot;
			if(pt > 7){
				pt -= 8;
			}
			return pt;
		}
		addseg(seg){
			if(this.lock){return;}
		}
		remove(seg){
			if(this.lock){return;}
		}
		toggleseg(seg){
			if(this.lock == true){return;}
			var a = false;
			for(var i = 0; i < this.pts.length; i++){
				if(this.pts[i] == seg){
					a = true;
					break;
				}
			}
			if(a){
				this.pts.splice(this.pts.indexOf(seg),1);
				money+=100;
			}else{
				if(buy(100)){
					this.pts.push(seg);
				}
			}
		}
	}
	class Train{
		constructor(p,d,s,t,m){
			this.pos = p;
			this.direction = d;
			this.seg = s;
			this.table = t;
			this.target = this.table.shift();
			this.moving = true;
			this.arrived = false;
			this.currentTrack = map[Math.floor(p.x/64)][Math.floor(p.y/64)];
			this.currentTrack = this.currentTrack.rail;
			this.currentTrack.hasTrain = true;
			this.stationIndex = 1;
			this.money = m;
			this.a = false;
			var a = 0;
			for(var i = 0; i < stationMid.length; i++){
				if(stationMid[i].active){
					a++;
				}
			}
			this.maxStations = Math.floor(Math.random() * (a - 1)) + 1;
		}
		start(){
			this.currentTrack.hasTrain = true;
			this.moving = true;
		}
		update(){
			if(this.moving){
				if(this.pos.x % 64 == 0 || this.pos.y % 64 == 0){
					var newTrack;
					switch(this.seg){
						case 0:
							if(this.pos.y == 0){break;}
							newTrack = map[this.currentTrack.pos.x][this.currentTrack.pos.y-1];
							break;
						case 1:
							if(this.pos.y == 0){break;}
							newTrack = map[this.currentTrack.pos.x+1][this.currentTrack.pos.y-1];
							break;
						case 2:
							newTrack = map[this.currentTrack.pos.x+1][this.currentTrack.pos.y];
							break;
						case 3:
							newTrack = map[this.currentTrack.pos.x+1][this.currentTrack.pos.y+1];
							break;
						case 4:
							newTrack = map[this.currentTrack.pos.x][this.currentTrack.pos.y+1];
							break;
						case 5:
							if(this.pos.x == 0){break;}
							newTrack = map[this.currentTrack.pos.x-1][this.currentTrack.pos.y+1];
							break;
						case 6:
							if(this.pos.x == 0){break;}
							newTrack = map[this.currentTrack.pos.x-1][this.currentTrack.pos.y];
							break;
						case 7:
							if(this.pos.x == 0){break;}
							if(this.pos.y == 0){break;}
							newTrack = map[this.currentTrack.pos.x-1][this.currentTrack.pos.y-1];
							break;
					}
					if(newTrack == null){
						this.direction.x *= -1;
						this.direction.y *= -1;
					}else{
						if(this.currentTrack.signal != null){
							if(!this.currentTrack.signal.loc){
								this.currentTrack.signal.active = false;
							}
						}
						this.currentTrack.hasTrain = false;
						this.currentTrack = newTrack;
						if(this.currentTrack.type != "rail"){
							this.currentTrack = this.currentTrack.rail;
						}
						this.currentTrack.hasTrain = true;
						this.seg += 4;
						if(this.seg > 7){
							this.seg -= 8;
						}
					}
					this.pos.x += this.direction.x;
					this.pos.y += this.direction.y;
					return;
				}else if(this.pos.x % 64 == 32 && this.pos.y % 64 == 32){
					this.seg = this.currentTrack.nextseg(this.seg);
					switch(this.seg){
						case 0:
							this.direction = new v2(0,-2);
							break;
						case 1:
							this.direction = new v2(2,-2);
							break;
						case 2:
							this.direction = new v2(2,0);
							break;
						case 3:
							this.direction = new v2(2,2);
							break;
						case 4:
							this.direction = new v2(0,2);
							break;
						case 5:
							this.direction = new v2(-2,2);
							break;
						case 6:
							this.direction = new v2(-2,0);
							break;
						case 7:
							this.direction = new v2(-2,-2);
							break;
					}
					if(this.currentTrack.station != null){
						if(this.currentTrack.station.name == this.target){
							this.moving = false;
							if(this.currentTrack.station.arrive(this)){
								return;
							}
							var t = this.currentTrack.station.name;
							this.target = this.table.shift();
							if(this.target == undefined){
								for(var i = 0; i < train.length; i++){
									if(train[i] == this){
										train.splice(i, 1);
									}
								}
							}
							this.moving = true;
						}else{
							if(this.a){
								alert("wrongStation :(");
								this.money -= 50;
							}else{
								this.a = true;
							}
						}
					}
				}
				if(this.currentTrack.signal != null){
					if(this.currentTrack.signal.active || this.currentTrack.signal.loc){
						this.pos.x += this.direction.x;
						this.pos.y += this.direction.y;
					}
				}else{
					this.pos.x += this.direction.x;
					this.pos.y += this.direction.y;
				}
			}
		}
		draw(){
			ctx.fillStyle = "#80FF80";
			ctx.fillRect(this.pos.x-16, this.pos.y-16,32,32);
			ctx.font = "32px serif";
			ctx.fillStyle = "#000000";
			ctx.fillText(this.target, this.pos.x-8, this.pos.y+8);
		}
	}
	class Station{
		static mode = {
			In: Symbol("In"),
			Out: Symbol("Out"),
			Mid: Symbol("Mid")
		}
		constructor(p, n, m, a){
			this.type = "station";
			this.pos = p;
			this.mode = m;
			var track = [2,6];
			this.rail = new Rail(p, track);
			this.rail.lock = true
			this.lock = true;
			this.rail.station = this;
			this.name = n;
			this.spawning = false;
			this.tick = 0;
			this.spawnTick = false;
			this.active = a;
			this.price = 1000;
		}
		draw(){
			this.rail.drawStation(this.mode);
			ctx.font = "32px serif";
			ctx.fillStyle = "#000000";
			ctx.fillText(this.active ? this.name : "$" + this.price, this.pos.x * 64, (this.pos.y + 1) * 64);
		}
		spawnTrain(t, m){
			this.spawnT = t;
			this.spawnM = m;
			var a = false;
			if(map[this.pos.x+1][this.pos.y] != null){
				if(map[this.pos.x+1][this.pos.y].type == "rail"){
					a = map[this.pos.x+1][this.pos.y].hasTrain;
				}else if(map[this.pos.x+1][this.pos.y].type == "signal"){
					a = map[this.pos.x+1][this.pos.y].rail.hasTrain;
				}
			}
			if(this.rail.hasTrain || a){
				this.spawning = true;
			}else{
				train.push(
					new Train(
						new v2(this.pos.x * 64 + 32, this.pos.y * 64 + 32),
						new v2(2, 0),
						6,
						t,
						m
					)
				);
			}
		}
		arrive(t){
			if(this.mode == Station.mode.Out){
				for(var i = 0; i < train.length; i++){
					if(train[i] == t){
						train.splice(i,1);
					}
				}
				money += t.money;
				return true;
			}
			return false;
		}
		update(){
			if(this.spawning){
				if(!this.rail.hasTrain){
					var a = true;
					if(map[this.pos.x+1][this.pos.y] != null){
						if(map[this.pos.x+1][this.pos.y].type == "rail"){
							a = !map[this.pos.x+1][this.pos.y].hasTrain;
						}else if(map[this.pos.x+1][this.pos.y].type == "signal"){
							a = map[this.pos.x+1][this.pos.y].rail.hasTrain;
						}
					}
					if(a){
						this.spawnTick = true;
					}
				}
				if(this.spawnTick){
					this.tick++;
					if(this.tick >= 50){
						this.spawnTick = false;
						this.spawning = false;
						this.spawnTrain(this.spawnT, this.spawnM);
						this.tick = 0;
					}
				}
			}
		}
	}
	class Signal{
		constructor(p,r){
			this.pos = p;
			r.signal = this;
			this.rail = r;
			this.active = false;
			this.type = "signal";
			this.loc = false;
		}
		draw(){
			this.rail.draw();
			ctx.fillStyle = this.loc ? "#80FF80" : (this.active ? "#80FF80" : "#FF8080");
			ctx.fillRect(this.pos.x*64+16, this.pos.y*64+16,32,32);
			if(this.loc){
				ctx.font = "32px serif";
				ctx.fillStyle = "#000000";
				ctx.fillText("L", this.pos.x*64+20, this.pos.y*64+42);
			}
		}
	}
	class v2{
		constructor(_x,_y){
			this.x = _x;
			this.y = _y;
		}
		static lerp(v,v1,i){
			var a = new v2(0,0);
			a.x = (v1.x - v.x) * i + v.x;
			a.y = (v1.y - v.y) * i + v.y;
			return a;
		}
		static max(v,v1){
			return new v2(Math.max(v.x,v1.x), Math.max(v.y,v1.y));
		}
		static equals(v,v1){
			return v.x == v1.x && v.y == v1.y;
		}
	}
	var playerPos = new v2(0,0);
	function drawGrid(){
		for(var x = playerPos.x % gridSize-63; x < canvas.width; x+=gridSize){
			for(var y = playerPos.y % gridSize-63; y < canvas.height; y+=gridSize){
				ctx.strokeStyle = "rgb(0,0,0)";
				ctx.strokeRect(x,y,gridSize,gridSize);
			}
		}
	}
	window.addEventListener("keydown", function (event) {
		if (event.defaultPrevented) {
			return; // Do nothing if the event was already processed
		}
		if(event.key == "e"){
			for(var i = 0; i < train.length; i++){
				train[i].start();
			}
		}
		if(event.key == "b"){
			build = !build;
			mode = true;
		}
		if(event.key == 1){
			placeRail = true;
		}
		if(event.key == 2){
			placeRail = false;
		}
		if(event.key == "g"){
			var b = 0;
			for(var i = 0; i < stations.length; i++){
				if(stations[i].active == true){
					b++;
				}
			}
			if(train.length < ((b - 3) * 2) + 3){
				contract = new Contract();
				contract.start();
			}
		}
		keys[event.key] = true;
		event.preventDefault();
	},true);
	window.addEventListener("keyup", function (event) {
		if (event.defaultPrevented) {
			return; // Do nothing if the event was already processed
		}
		keys[event.key] = false;
		event.preventDefault();
	}, true);
	
	function draw(){
		ctx.clearRect(0,0,canvas.width,canvas.height);
		drawGrid();
		for(var x = 0; x < mapSize; x++){
			for(var y = 0; y < mapSize; y++){
				if(map[x][y] != null){
					if(map[x][y].draw != null){
						map[x][y].draw();
					}
				}
			}
		}
		for(var i = 0; i < train.length; i++){
			train[i].draw();
		}
	}
	var stations = [];
	var stationIn = [];
	var stationOut = [];
	var stationMid = [];
	function addStation(pos, name, b, a){
		map[pos.x][pos.y] = new Station(pos, name, b, a);
		stations.push(map[pos.x][pos.y]);
		switch(b){
			case Station.mode.In:
				stationIn.push(map[pos.x][pos.y]);
				break;
			case Station.mode.Out:
				stationOut.push(map[pos.x][pos.y]);
				break;
			case Station.mode.Mid:
				stationMid.push(map[pos.x][pos.y]);
				break;
		}
	}
	addStation(new v2(2,4), "a", Station.mode.In, false);
	addStation(new v2(3,6), "b", Station.mode.In, true);
	addStation(new v2(2,8), "c", Station.mode.In, false);
	addStation(new v2(9,6), "d", Station.mode.Mid, true);
	addStation(new v2(12,0), "e", Station.mode.Mid, false);
	addStation(new v2(9,2), "f", Station.mode.Mid, false);
	addStation(new v2(15,7), "g", Station.mode.Out, true);
	addStation(new v2(15,4), "h", Station.mode.Out, false);
	var train = [];
	var mode = true;
	var build = true;
	var placeRail = true;
	var mouseCellPos = new v2(0,0);
	var mouseCell;
	function mouseClick(event){
		if(build){
			if(event.button == 0){
				if(placeRail){
					if(mode){
						mouseCellPos = new v2(Math.floor((event.clientX - playerPos.x)/64), Math.floor((event.clientY - playerPos.y)/64));
						mouseCell = map[mouseCellPos.x][mouseCellPos.y];
						mode = false;
					}else{
						var cellPos = new v2(Math.floor((event.clientX - playerPos.x)/64), Math.floor((event.clientY - playerPos.y)/64));
						placeRailLine(mouseCellPos, cellPos);
					}
				}else{
					mouseCellPos = new v2(Math.floor((event.clientX - playerPos.x)/64), Math.floor((event.clientY - playerPos.y)/64));
					mouseCell = map[mouseCellPos.x][mouseCellPos.y];
					if(mouseCell != null){
						if(mouseCell.type == "rail"){
							if(mouseCell.pts.length == 2 && buy(500)){
								map[mouseCellPos.x][mouseCellPos.y] = new Signal(mouseCellPos, mouseCell);
							}
						}else if(mouseCell.type == "signal"){
							map[mouseCellPos.x][mouseCellPos.y] = mouseCell.rail;
							mouseCell.rail.signal = null;
							money += 500;
						}else if(mouseCell.type == "station"){
							if(mouseCell.active == false){
								if(buy(mouseCell.price)){
									mouseCell.active = true;
								}
							}
						}
					}
				}
			}else{
				mode = true;
			}
		}else{
			mouseCellPos = new v2(Math.floor((event.clientX - playerPos.x)/64), Math.floor((event.clientY - playerPos.y)/64));
			mouseCell = map[mouseCellPos.x][mouseCellPos.y];
			if(mouseCell.type == "rail"){
				mouseCell.switchPos++;
				if(mouseCell.switchPos == Math.min(mouseCell.pts.length - 1, 3)){
					mouseCell.switchPos = 0;
				}
			}else if(mouseCell.type == "signal"){
				if(event.button == 0){
					mouseCell.active = !mouseCell.active;
				}else if(event.button == 2){
					mouseCell.loc = !mouseCell.loc;
				}
			}
		}
	}
	function placeRailLine(pt, pt2){
		var canPlace = false;
		if(Math.abs(pt.x - pt2.x) == Math.abs(pt.y - pt2.y)){
			canPlace = true;
		}else if(pt.x - pt2.x == 0){
			canPlace = true;
		}else if(pt.y - pt2.y == 0){
			canPlace = true;
		}
		if(v2.equals(pt,pt2)){
			canPlace = false;
		}
		if(!canPlace){return;}
		for(var i = 0; i < Math.max(Math.abs(pt.x - pt2.x), Math.abs(pt.y - pt2.y)); i++){
			var cellPos = v2.lerp(pt, pt2, i/Math.max(Math.abs(pt.x - pt2.x), Math.abs(pt.y - pt2.y)));
			var direction = [2];
			if(pt.x - pt2.x > 0){
				direction = (i == 0 ? [6] : [2,6]);
			}
			if(pt.x - pt2.x < 0){
				direction = (i == 0 ? [2] : [2,6]);
			}
			if(pt.y - pt2.y > 0){
				direction = (i == 0 ? [0] : [0,4]);
			}
			if(pt.y - pt2.y < 0){
				direction = (i == 0 ? [4] : [0,4]);
			}
			if(pt.x - pt2.x > 0 && pt.y - pt2.y > 0){
				direction = (i == 0 ? [7] : [3,7]);
			}
			if(pt.x - pt2.x < 0 && pt.y - pt2.y < 0){
				direction = (i == 0 ? [3] : [3,7]);
			}
			if(pt.x - pt2.x < 0 && pt.y - pt2.y > 0){
				direction = (i == 0 ? [1] : [1,5]);
			}
			if(pt.x - pt2.x > 0 && pt.y - pt2.y < 0){
				direction = (i == 0 ? [5] : [1,5]);
			}
			var cell = map[cellPos.x][cellPos.y];
			if(cell != null){
				if(cell.lock){
					continue;
				}
				for(var j = 0; j < direction.length; j++){
					cell.toggleseg(direction[j]);
				}
				if(cell.pts.length == 0){
					map[cellPos.x][cellPos.y] = null;
				}
			}else{
				if(buy(100 * direction.length)){
					map[cellPos.x][cellPos.y] = new Rail(cellPos, direction);
				}
			}
		}
		var direction = 2;
		if(pt.x - pt2.x > 0){
			direction = 2;
		}
		if(pt.x - pt2.x < 0){
			direction = 6;
		}
		if(pt.y - pt2.y > 0){
			direction = 4;
		}
		if(pt.y - pt2.y < 0){
			direction = 0;
		}
		if(pt.x - pt2.x > 0 && pt.y - pt2.y > 0){
			direction = 3;
		}
		if(pt.x - pt2.x < 0 && pt.y - pt2.y < 0){
			direction = 7;
		}
		if(pt.x - pt2.x < 0 && pt.y - pt2.y > 0){
			direction = 5;
		}
		if(pt.x - pt2.x > 0 && pt.y - pt2.y < 0){
			direction = 1;
		}
		var cell = map[pt2.x][pt2.y];
		if(cell != null){
			if(cell.lock){
				mouseCellPos = pt2;
				return;
			}
			cell.toggleseg(direction);
			if(cell.pts.length == 0){
				map[pt2.x][pt2.y] = null;
			}
		}else{
			if(buy(100)){
				map[pt2.x][pt2.y] = new Rail(pt2, [direction]);
			}
		}
		mouseCellPos = pt2;
	}
	var intervalId = window.setInterval(function(){
		if(keys.w){
			//playerPos.y+=16;
		}
		if(keys.a){
			//playerPos.x-=16;
		}
		if(keys.s){
			//playerPos.y-=16;
		}
		if(keys.d){
			//playerPos.x+=16;
		}
		if (!build){
			for(var i = 0; i < stationIn.length; i++){
				stationIn[i].update();
			}
			for(var i = 0; i < train.length; i++){
				train[i].update();
			}
			for(var i = 0; i < contracts.length; i++){
				contracts[i].update();
			}
		}
		draw();
		drawContracts();
		moneyDiv.innerHTML = "$" + money + "      buildMode: " + (placeRail ? "rail" : "signal/station") + "       mode: " + (build ? "build" : "not build");
	}, 50);
	function angle(cx, cy, ex, ey) {
		var dy = ey - cy;
		var dx = ex - cx;
		var theta = Math.atan2(dy, dx);
		theta *= 180 / Math.PI;
		return theta;
	}
	function angle360(cx, cy, ex, ey) {
		var theta = angle(cx, cy, ex, ey);
		if (theta < 0) theta = 360 + theta;
		return theta;
	}
	function buy(a){
		if(money >= a){
			money -= a;
			return true;
		}else{
			return false;
		}
	}
	class Contract{
		constructor(){
			this.table = [];
			var a = true;
			while(a){
				rand = Math.floor(Math.random() * stationIn.length);
				if(stationIn[rand].active){
					this.table.push(stationIn[rand]);
					a = false;
				}
			}
			var a = 0;
			for(var i = 0; i < stationMid.length; i++){
				if(stationMid[i].active){
					a++;
				}
			}
			var maxStations = 0;
			while(maxStations == 0){
				maxStations = Math.floor(Math.random() * (a + 1));
				if(a == 1){
					maxStations = 1;
				}
				if(maxStations > a){
					maxStations = a;
				}
			}
			var target = null;
			for(var i = 0; i < maxStations; i++){
				var t = null;
				while(target == t || t == null){
					var rand = 0;
					var r = Math.random();
					rand = Math.floor(r * stationMid.length);
					if(stationMid[rand].active == false){
						continue;
					}
					t = stationMid[rand].name;
				}
				this.table.push(stationMid[rand].name);
				target = stationMid[rand].name;
			}
			a = true;
			while(a){
				rand = Math.floor(Math.random() * stationOut.length);
				if(stationOut[rand].active){
					this.table.push(stationOut[rand].name);
					a = false;
				}
			}
			this.active = false;
			this.t = 0;
			this.money = (200*this.table.length) + Math.floor(200 * Math.random());
			this.maxTick = Math.floor(480 * Math.random());
		}
		update(){
			if(this.active == false){return;}
			this.t++;
			if(this.t >= this.maxTick){
				this.t = 0;
				var startStation = this.table[0];
				var newTable = this.table.slice();
				newTable.shift();
				startStation.spawnTrain(newTable, this.money);
			}
		}
		start(){
			this.active = true;
			this.t = this.maxTick * 2;
		}
		draw(y){
			var text = "";
			for(var i = 0; i < this.table.length; i++){
				if(typeof(this.table[i]) == "object"){
				}else{
					text += this.table[i] + ", ";
				}
			}
			contractCtx.strokeStyle = "#000000";
			contractCtx.strokeRect(0,y*40,320,40);
			contractCtx.font = "25px serif";
			contractCtx.fillStyle = "#000000";
			var time = Math.round((this.active ? (((this.maxTick - this.t)*50)/1000) : ((this.maxTick*50)/1000))*10)/10;
			contractCtx.fillText(text + this.money + "$, " + (this.active ? "A" : "X") + ", " + time +"s", 15, (y*40) + 30);
		}
	}
	for(i = 0; i < 8; i++){
		contracts.push(new Contract());
	}
	function drawContracts(){
		contractCtx.clearRect(0,0,contractCanvas.width,contractCanvas.height);
		for(var i = 0; i < contracts.length; i++){
			contracts[i].draw(i);
		}
	}
	function clickContracts(event){
		var y = Math.floor(event.clientY/40);
		if(y > 7){return;}
		if(event.button == 0){
			contracts[y].start();
		}else if(event.button == 2){
			contracts[y] = new Contract();
		}
	}
	class Edit{
		constructor(){
			this.canvas = document.getElementById("edit");
			this.ctx = this.canvas.getContext("2d");
			this.opened = false;
		}
		draw(){
		}
		open(o){
			this.opened = true;
			this.object = o;
			this.stations = stations.length - stationIn.length;
			alert(this.stations);
		}
		close(){
			this.opened = false;
		}
		click(x,y){
		
		}
	}
	//var edit = new Edit();
	//edit.open(null);
	draw();
}catch(e){
	alert(e);
}