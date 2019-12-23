/*
My interpretation of an A* pathfinder in p5.js inspired by the coding train youtube channel.
https://www.youtube.com/watch?v=aKYlikFAV4k
To change the wall density, adjust the factor of the random condition in the node() function.
*/

function node(x, y) {
  this.x = x;
  this.y = y;

  this.wall = false;

  if (random() < 0.35) {
    this.wall = true;
  }

  this.g = Infinity;
  this.h = Infinity;
  this.f = Infinity;

  this.prev = undefined;

  this.distance = function(end_node) {
    var dx = abs(this.x - end_node.x);
    var dy = abs(this.y - end_node.y);
    var dist_diag = min(dx, dy) * sqrt(2);
    var dist_str = max(dx, dy) - min(dx, dy);
    return dist_diag + dist_str;
  }

  this.heuristic = function(end_node) {
    this.h = this.distance(end_node);
  }

  this.show = function(col, w, h) {
    fill(col);
    noStroke();
    // rect(this.x * w, this.y * h, w - 1, h - 1);
    ellipse(this.x * w + w/2, this.y * h + h/2, w/2, h/2);
  }


}


function grid(xdim, ydim) {
  this.xdim = xdim;
  this.ydim = ydim;
  this.nodes = new Array(this.xdim * this.ydim);

  this.open = [];
  this.close = [];
  this.path = [];

  this.start_node = undefined;
  this.end_node = undefined;

  this.goal = function(start_x, start_y, end_x, end_y) {
    this.end_node = this.nodes[this.xy_to_index(end_x, end_y)];
    this.end_node.wall = false;

    // print('x: ' + this.end_node.x + ' - y: ' + this.end_node.y);
    this.start_node = this.nodes[this.xy_to_index(start_x, start_y)];
    this.start_node.heuristic(this.end_node);
    this.start_node.g = 0;
    this.start_node.f = this.start_node.h + this.start_node.g;
    this.start_node.wall = false;

    // print('x: ' + this.start_node.x + ' - y: ' + this.start_node.y);
    // print('f: ' + this.start_node.f + ' - g: ' + this.start_node.g + ' - h: ' + this.start_node.h)

    this.open.push(this.start_node);
    // print(this.open.length)
    this.path = [];
  }

  this.index_to_xy = function(index) {
    var x = floor(index % this.xdim);
    var y = floor(index / this.xdim);
    return [x, y];
  }

  this.xy_to_index = function(x, y) {
    return y * this.xdim + x;
  }

  // populate the grid
  for (var i = 0; i < this.nodes.length; i++) {
    var [x, y] = this.index_to_xy(i);
    // print('x: ' + x + ' - y: ' + y);
    this.nodes[i] = new node(x, y);
  }

  this.neighbors = function(cur_node) {
    var xcur = cur_node.x;
    var ycur = cur_node.y;
    var neighbors = [];
    for (var x = max(xcur - 1, 0); x <= min(xcur + 1, this.xdim - 1); x++) {
      for (var y = max(ycur - 1, 0); y <= min(ycur + 1, this.ydim - 1); y++) {
        if (!(x === xcur && y === ycur)) {
          neighbors.push(this.nodes[this.xy_to_index(x, y)]);
        }
      }
    }
    return neighbors;
  }

  this.get_index_lowest = function() {
    var min_cost = Infinity,
      i_min = -1;
    for (var i = 0; i < this.open.length; i++) {
      // print('cost: ' + this.open[i].f);
      if (this.open[i].f < min_cost) {
        min_cost = this.open[i].f;
        i_min = i;
      }
    }
    return i_min;
  }

  this.heuristic = function(cur_node, end_node) {
    return cur_node.h(end_node);
  }

  this.update_path = function(cur_node) {
    this.path = [];
    var temp = cur_node;
    while (temp) {
      this.path.push(temp);
      temp = temp.prev;
    }
  }

  this.show = function(width, height) {
    // compute dimensions for display purpose
    var w = width / g.xdim;
    var h = height / g.ydim;
    var i = 0;
    
    // draw grid
    background(255);
    for (i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].wall) {
        this.nodes[i].show(color(0, 0, 0), w, h);
      }
    }

    // draw path
    noFill();
    stroke(255, 0, 200);
    strokeWeight(w / 3);
    beginShape();
    for (i = 0; i < this.path.length; i++) {
      vertex(this.path[i].x * w + w/2, this.path[i].y * h + h/2);
    }
    endShape();

  }

}

var g;


function setup() {
  createCanvas(500, 500);

  // Create grid
  g = new grid(50, 50);

  // Set goal
  g.goal(0, 0, 49, 49);
}

function draw() {
  // check if there are any nodes in the open list
  if (g.open.length > 0) {
    // get node with lowest f score
    var cur_idx = g.get_index_lowest();
    var cur_node = g.open[cur_idx];

    // remove from open list and add to closed list (optional)
    g.open.splice(cur_idx, 1);
    g.close.push(cur_node);

    // keep track of the path
    g.update_path(cur_node);

    // exit condition
    if (cur_node === g.end_node) {
      print('DONE');
      noLoop();
    }

    // get all neighbors
    var neighbors = g.neighbors(cur_node);

    for (var i = 0; i < neighbors.length; i++) {
      var temp_score = cur_node.g + cur_node.distance(neighbors[i]);

      if (temp_score < neighbors[i].g) {
        neighbors[i].prev = cur_node;
        neighbors[i].g = temp_score;
        neighbors[i].heuristic(g.end_node);
        neighbors[i].f = neighbors[i].g + neighbors[i].h;

        if (!g.open.includes(neighbors[i])) {
          if (neighbors[i].wall === false) {
            g.open.push(neighbors[i]);
          }
        }
      }
    }
  } else {
    print('No Solution!');
    noLoop();
  }

  // draw the grid and path
  g.show(width, height);


}
