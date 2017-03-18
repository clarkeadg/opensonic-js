import { sprite_create } from "./../core/sprite"
import { resourcemanager_getJsonFile } from "./../core/resourcemanager"
import { timer_get_delta } from "./../core/timer"
import { logfile_message } from "./../core/logfile"
import { isArray } from "./../core/util"

/* brick properties */
export const BRK_NONE              =  0;
export const BRK_OBSTACLE          =  1;
export const BRK_CLOUD             =  2;

/* brick behavior */
export const BRICKBEHAVIOR_MAXARGS =  5;
export const BRB_DEFAULT           =  0;
export const BRB_CIRCULAR          =  1;
export const BRB_BREAKABLE         =  2;
export const BRB_FALL              =  3;

/* brick state */
export const BRS_IDLE              =  0;
export const BRS_DEAD              =  1;
export const BRS_ACTIVE            =  2; /* generic action */

/* misc */
export const BRICK_MAXVALUES       =  3;
export const BRB_FALL_TIME         =  1.0; /* time in seconds before a BRB_FALL gets destroyed */

/* private */
const BRKDATA_MAX   =   10000;

let brickdata_count = 0;
let brickdata = [];

export const brick_load = (filename) => {
  return new Promise(function (fulfill, reject){
    logfile_message("brickdata_load('%s')", filename);
    resourcemanager_getJsonFile(filename)
    .then(traverse)
    .then(function(bdata){
      brickdata = bdata;
    })
    .then(fulfill);
  });
}

export const brick_unload = () => {
  let i;

  logfile_message("brickdata_unload()");

  for(i=0; i<brickdata_count; i++)
    brickdata[i] = brickdata_delete(brickdata[i]);
  brickdata_count = 0;

  logfile_message("brickdata_unload() ok");
}

export const brick_get = (id) => {
  //id = Math.min(id, 0, brickdata_count-1);
  return brickdata[id];
}

export const brick_size = () => {
  return brickdata_count;
}

/* brick utilities */

export const brick_animate = (brk) => {
  const sprite = brk.brick_ref.data;

  if(sprite != null && sprite.animation_data.length) { // if brk is not a fake brick 
      const loop = sprite.animation_data[0].repeat;
      let f = sprite.animation_data[0].frame_count;

      brk.animation_frame += (sprite.animation_data[0].fps) * timer_get_delta();
      if (brk.animation_frame > sprite.animation_data[0].frame_count-1) {
        brk.animation_frame = 0;
      }

      //if(!loop)
      //    brk.animation_frame = Math.min(c-1, brk.animation_frame + sprite.animation_data[0].fps * timer_get_delta());
      //else
      //    brk.animation_frame = parseInt((sprite.animation_data[0].fps * (timer.get_ticks() * 0.001)) % c,10);

      //f = Math.min(parseInt(brk.animation_frame,10), 0, c-1);
      f = parseInt(brk.animation_frame,10);
      brk.brick_ref.image = sprite.frame_data[ sprite.animation_data[0].data[f] ];
  }
  return brk;
}

export const brick_image = (brk) => {
  return brk.brick_ref.image;
}

export const brick_get_property_name = (property) => {
  switch(property) {
    case BRK_NONE:
      return "PASSABLE";

    case BRK_OBSTACLE:
      return "OBSTACLE";

    case BRK_CLOUD:
      return "CLOUD";

    default:
      return "Unknown";
  }
}

export const brick_get_behavior_name = (behavior) => {
  switch(behavior) {
    case BRB_DEFAULT:
      return "DEFAULT";

    case BRB_CIRCULAR:
      return "CIRCULAR";

    case BRB_BREAKABLE:
      return "BREAKABLE";

    case BRB_FALL:
      return "FALL";

    default:
      return "Unknown";
  }
}

const brickdata_new = () => {
  let i;
  let obj = {};

  obj.data = null;
  obj.image = null;
  obj.property = BRK_NONE;
  obj.angle = 0;
  obj.behavior = BRB_DEFAULT;
  obj.zindex = 0.5;
  obj.behavior_arg = [];

  for(i=0; i<BRICKBEHAVIOR_MAXARGS; i++)
    obj.behavior_arg[i] = 0.0;

  return obj;
}

const brickdata_delete = (obj) => {}

const validate_brickdata = (obj) => {
  if(obj.data == null)
    logfile_message("Can't load bricks: all bricks must have a sprite!");
    //fatal_error("Can't load bricks: all bricks must have a sprite!");
}

const traverse = (stmt) => {
    let bricks = stmt.bricks;
    return Promise.all(bricks.map(traverse_brick_attributes))
}

const traverse_brick_attributes = (stmt) => {
  return new Promise(function (fulfill, reject){
    let dat = brickdata_new();
    let type = stmt.type;
    
    // type       
    if(type == "OBSTACLE") {
      dat.property = BRK_OBSTACLE;
    } else if(type == "PASSABLE") {
      dat.property = BRK_NONE;
    } else if(type == "CLOUD") {
      dat.property = BRK_CLOUD;
    } else {
      logfile_message("Can't read brick attributes: unknown brick type '%s'", type);
      //fatal_error("Can't read brick attributes: unknown brick type '%s'", type);
    }

    // behavior 
    if (isArray(stmt.behavior)) {
      type = stmt.behavior[0];
    } else {
      type = stmt.behavior;
    }
    if(type == "DEFAULT") {
      dat.behavior = BRB_DEFAULT;
    } else if(type == "CIRCULAR") {
      dat.behavior = BRB_CIRCULAR;
    } else if(type == "BREAKABLE") {
      dat.behavior = BRB_BREAKABLE;
    } else if(type == "FALL") {
      dat.behavior = BRB_FALL;
    } else {
      logfile_message("Can't read brick attributes: unknown brick type '%s'", type);
      //fatal_error("Can't read brick attributes: unknown brick type '%s'", type);
    }

    for(let j=0; j<BRICKBEHAVIOR_MAXARGS; j++) {
      //pj = nanoparser_get_nth_parameter(param_list, 2+j);
      dat.behavior_arg[j] = stmt.behavior[1+j]
    }
     dat.behavior_arg[dat.behavior_arg.length-1] = 0;

    // angle 
    dat.angle =  stmt.angle;

    // zindex 
    if (stmt.zindex) {
      dat.zindex = stmt.zindex;
    }

    // sprite 
    sprite_create(stmt.sprite)
    .then(function(data){
      dat.data = data;
      dat.image = data.frame_data[0];
      brickdata_count++;
      fulfill(dat);
    });
  });
}
