//Better Mouse
let mouse = {
  x: 0,
  y: 0,
  is_pressed: 0,

  x_offset: 0,
  y_offset: 0,

  size: 0,
  buffer: {
    array: [],
    index: 0,
    population: 0,
    size: 1,

    init(size){
      this.size = size;
      this.array = new Array(size);
      this.index = 0;
      this.population = 0;
    },

    push(instance){
      this.array[this.index] = instance;
      this.index = (this.index + 1)% this.size;
      if (this.population < this.size) this.population++;
    },

    get_history(){
      let history = [];
      for(let i = 0; i < this.population; i++){
        let _index = (this.index + i) % this.size;
        history.push(this.array[_index]);
      }
      return history;
    }
  },

  init(x_off, y_off, size = 1){
    this.x_offset = x_off;
    this.y_offset = y_off;
    this.size = size;

    if (this.size > 1) this.buffer.init(size);
    this.update();
  },
  
  update(){
    this.x = mouseX - this.x_offset;
    this.y = mouseY - this.y_offset;
    this.is_pressed = mouseIsPressed;
    if (this.size > 1) this.buffer.push([this.x, this.y, this.is_pressed]);
  },
};

//Better Canvas
let canvas = {
  width: null,
  height: null,
  frame_rate: null,
  background_color: null,
    
  init(w, h, bg, fr = 60) {
    this.width = w;
    this.height = h;
    this.background_color = bg;
    this.frame_rate = fr;

    //mouse.init(w/2, h/2, s);
    createCanvas(this.width, this.height);        
    frameRate(this.frame_rate);
    colorMode(RGB);
    noStroke();
    noFill();
  },
  
  beginFrame() {
    push();
    background(this.background_color);
    translate(floor(this.width/2), floor(this.height/2))
    mouse.update();
  },
    
  endFrame() {
    pop();
  },

  init_mouse(size=1){
    mouse.init(this.width/2, this.width/2, size);
  },

  pointer_size: 3,
  drawMouse(pointer_size = 3) {
    this.pointer_size = pointer_size;
    noCursor();
    noStroke();
    if (mouse.is_pressed) fill(255, 0, 0);
    else fill(0);
    ellipse(mouse.x, mouse.y, pointer_size, pointer_size);
  },

  drawMouseTail(){
    if (mouse.size > 1){
      let mouse_buffer = mouse.buffer.get_history();
      noFill();
      strokeWeight(1);
      strokeCap(ROUND);

      for (let i = 0; i < mouse_buffer.length - 1; i++){
        let _frame = mouse_buffer[i];
        if (!_frame) continue;
        
        let _alpha = map(i, 0 , mouse_buffer.length - 1, 0, 255);
        if (_frame[2]) stroke(255, 0, 0, _alpha);
        else stroke(0, _alpha);

        let _stroke = map(i, 0, mouse_buffer.length-1, 0.5, this.pointer_size);
        
        strokeWeight(_stroke);
        line(_frame[0], _frame[1], mouse_buffer[i+1][0], mouse_buffer[i+1][1]);
      }
    }
  },

  frame_count: -1,
  drawFrameSquare(square_size = 10, padding = 5){
    this.frame_count++;
    if (this.frame_count >= this.frame_rate) this.frame_count = 0;
    
    this.square_size = square_size;
    let vertical_far = this.height/2 - padding;
    let vertical_close = vertical_far - this.square_size;
    let horizontal_far = this.width/2 - padding;
    let horizontal_close = horizontal_far - this.square_size;

    //Grid
    stroke(0, 50);
    strokeWeight(1);
    for (let i = 0; i<9; i++){
      let v_coordinate = map(i, 0, 8, vertical_close, vertical_far);
      let h_coordinate = map(i, 0, 8, horizontal_close, horizontal_far);
      line(h_coordinate, vertical_close, h_coordinate, vertical_far);
      line(horizontal_close, v_coordinate, horizontal_far, v_coordinate);
    }

    let _x = 0;
    let _y = 0;
    noStroke();
    fill(255, 0, 0, 100);
    //Fill
    if (this.frame_rate< 64){
      for (let i = 63; i>this.frame_rate-1; i--){
      _x = i%8;
      _y = floor(i/8);
      rect(map(_x, 0, 8, horizontal_close, horizontal_far), map(_y, 0, 8, vertical_close, vertical_far), this.square_size/8, this.square_size/8);
      }
    }

    fill(0, 0, 255, 100);
    //Fill Current Frame
    for (let i = 0; i<this.frame_count+1; i++){
      if(i+1 == this.frame_count) fill(0,255,0,150);
      _x = i%8;
      _y = floor(i/8);
      rect(map(_x, 0, 8, horizontal_close, horizontal_far), map(_y, 0, 8, vertical_close, vertical_far), this.square_size/8, this.square_size/8);
    }
  },

  fps: 0,
  lastFpsUpdate: 0,
  displayFps(display_rate) {
    if (display_rate == undefined) display_rate = this.frame_rate;

    let interval = 1000 / display_rate;

    if (millis() - this.lastFpsUpdate > interval){
      this.lastFpsUpdate = millis();
      this.fps = floor(frameRate());
    }

    fill(0);
    noStroke();
    textAlign(LEFT, TOP);
    text(this.fps + ' (' + this.frame_rate + ')', -this.width/2 + 5, -this.height/2 + 5);
  },

  displayCanvasSize(){
    noStroke();
    fill(0);
    
    textAlign(LEFT, BOTTOM);
    text(this.width + ' x ' + this.height, -this.width/2 + 5, this.width/2 )
  },

  displayMouseCoordinates(){
    fill(0);
    noStroke();
    textAlign(RIGHT, TOP);
    text('(' + mouse.x + ', ' + (-mouse.y) + ')',this.width/2 - 5, -this.height/2 + 5);
  }

};



function setup() {
  let canvas_size = 512;
  canvas.init(canvas_size, canvas_size, 255, 60);
  canvas.init_mouse(6);
}

function draw() {
  canvas.beginFrame();

  canvas.drawMouse(3);
  canvas.drawMouseTail();
  canvas.drawFrameSquare(30, 5);

  


  canvas.displayCanvasSize();
  canvas.displayMouseCoordinates();
  canvas.displayFps(30);
  
  canvas.endFrame();
}
