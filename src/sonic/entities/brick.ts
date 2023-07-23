import { data_theme_t, data_theme_bricks_t } from "./../core/data"
import { image_t } from "./../core/image"
import { spriteframe_t, animation_t, spriteinfo_t, sprite_create, sprite_info_destroy } from "./../core/sprite"
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

export interface brickdata_t {
  data: spriteinfo_t,
  image: spriteframe_t,
  property: number,
  behavior: number,
  angle: number,
  zindex: number,
  behavior_arg: number[]
}

export interface brick_t {
  brick_ref: brickdata_t,
  x: number,
  y: number,
  sx: number,
  sy: number,
  enabled: boolean,
  state: number,
  value: number[],
  animation_frame: number
}

export interface brick_list_t {
  data: brick_t,
  next: brick_list_t
}

/* private */
const BRKDATA_MAX   =   10000;

let brickdata_count = 0;
let brickdata:brickdata_t[] = [];

/**
 * brickdata_load()
 * Loads all the brick data from a file
 */
export const brick_load = async (filename:string) => {
  logfile_message(`brickdata_load("${filename}")`);
  const data = await resourcemanager_getJsonFile(filename);
  const bdata = await traverse(<data_theme_t>data);
  brickdata = <brickdata_t[]>bdata;
}

/**
 * brickdata_unload()
 * Unloads brick data
 */
export const brick_unload = () => {
  let i;

  logfile_message("brickdata_unload()");

  for(i=0; i<brickdata_count; i++)
    brickdata[i] = brickdata_delete(brickdata[i]);
  brickdata_count = 0;

  logfile_message("brickdata_unload() ok");
}

/**
 * brickdata_get()
 * Gets a brickdata_t* object
 */
export const brick_get = (id:number) => {
  //id = Math.min(id, 0, brickdata_count-1);
  return brickdata[id];
}

/**
 * brickdata_size()
 * How many bricks are loaded?
 */
export const brick_size = () => {
  return brickdata_count;
}

/* brick utilities */

/**
 * brick_animate()
 * Animates a brick
 */
export const brick_animate = (brk:brick_t) => {
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
      f = ~~brk.animation_frame;
      brk.brick_ref.image = sprite.frame_data[ sprite.animation_data[0].data[f] ];
  }
}

/**
 * brick_image()
 * Returns the image of an (animated?) brick
 */
export const brick_image = (brk:brick_t) => {
  return brk.brick_ref.image;
}

/**
 * brick_get_property_name()
 * Returns the name of a given brick property
 */
export const brick_get_property_name = (property:number) => {
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

/**
 * brick_get_behavior_name()
 * Returns the name of a given brick behavior
 */
export const brick_get_behavior_name = (behavior:number) => {
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

const brickdata_new = ():brickdata_t => {

  const obj:brickdata_t = {
    data: null,
    image: null,
    property: BRK_NONE,
    angle: 0,
    behavior: BRB_DEFAULT,
    zindex: 0.5,
    behavior_arg: []
  };  

  for(let i=0; i<BRICKBEHAVIOR_MAXARGS; i++)
    obj.behavior_arg[i] = 0.0;

  return obj;
}

const brickdata_delete = (obj:brickdata_t):brickdata_t => {
  if(obj != null) {
    if(obj.data != null)
      sprite_info_destroy(obj.data);
    //delete(obj);
  }

  return null;
}

const validate_brickdata = (obj:brickdata_t) => {
  if(obj.data == null)
    logfile_message("Can't load bricks: all bricks must have a sprite!");
    //fatal_error("Can't load bricks: all bricks must have a sprite!");
}

const traverse = (stmt:data_theme_t) => {
  return Promise.all(stmt.bricks.map(traverse_brick_attributes))
}

const traverse_brick_attributes = async (stmt:data_theme_bricks_t) => {

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
    logfile_message(`Can't read brick attributes: unknown brick type ${type}`);
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
    logfile_message(`Can't read brick attributes: unknown brick type ${type}`);
    //fatal_error("Can't read brick attributes: unknown brick type '%s'", type);
  }

  for(let j=0; j<BRICKBEHAVIOR_MAXARGS; j++) {
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
  const data = await sprite_create(stmt.sprite);
  dat.data = <spriteinfo_t>data;
  dat.image = (<spriteinfo_t>data).frame_data[0];
  brickdata_count++;
  return dat;
}
