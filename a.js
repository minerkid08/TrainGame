update(){
	if(this.moving)
		if(this.pos.x % 64 == 0)
			var newTrack = map[Math.floor(this.pos.x/64)][Math.floor(this.pos.y/64)];
			if(currentTrack == newTrack)
				newTrack = map[Math.floor((this.pos.x-5)/64)][Math.floor(this.pos.y/64)];
			
			this.currentTrack = newTrack);
		
		else if(this.pos.x % 64 == 32 && this.pos.y % 64 == 32)
			this.seg = this.currentTrack.nextseg(this.seg);
			switch(this.seg)
				case 0:
					this.direction = new v2(0,2);
					break;
				case 1:
					this.direction = new v2(2,2);
					break;
				case 2:
					this.direction = new v2(2,0);
					break;
				case 3:
					this.direction = new v2(2,-2);
					break;
				case 4:
					this.direction = new v2(0,-2);
					break;
				case 5:
					this.direction = new v2(-2,-2);
					break;
				case 6:
					this.direction = new v2(-2,0);
					break;
				case 7:
					this.direction = new v2(-2,2);
					break;
			
		
		this.pos.x += this.direction.x;
		this.pos.y += this.direction.y;
	
}