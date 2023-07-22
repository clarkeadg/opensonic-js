import { DATA_ROOT } from "./global"
import { data_sprite_file_t, data_sprite_t, data_sprite_animation_t } from "./data"
import { hashtable_sprites, hashtable_spriteinfo_t_create, hashtable_spriteinfo_t_add } from "./hashtable"
import { image_load, image_destroy, image_t } from "./image"
import { logfile_message } from "./logfile"
import { resourcemanager_getJsonFiles } from "./resourcemanager"
import { isInArray } from "./util"
import { v2d_t, v2d_new } from "./v2d"
import { video_renderLoading } from "./video"

const SPRITE_MAX_ANIM = 1000;

export interface animation_t {
  repeat: boolean,
  fps: number,
  frame_count: number,
  data: number[],
  hot_spot: v2d_t,
  frame_data: any
}

export interface spriteinfo_t {
  source_file: string,
  rect_x: number,
  rect_y: number,
  rect_w: number,
  rect_h: number,
  frame_w: number,
  frame_h: number,
  hot_spot: v2d_t,
  frame_count: number,
  frame_data: any,
  animation_count: number,
  animation_data: any
}

export interface sprites_t {
  [key: string]: spriteinfo_t
}

let sprites:sprites_t = {};

// test
const showSheets = false;

const spriteFiles = [
  "animal",
  "bigring",
  "bluering",
  "bosses",
  "bumber",
  "charge",
  "checkpointorb",
  "chef",
  "danger",
  "dangpower",
  "dnadoor",
  "door",
  "explosion",
  "fireball",
  "flyingboy",
  "flyingeyes",
  "font",
  "glasses",
  "goal",
  "goldfish",
  "hud",
  "icon",
  "itembox",
  "joan",
  "kleps",
  "lady_bugsy",
  "levelact",
  "loop",
  "menu",
  "misc",
  "nafder",
  "neon",
  "oranjection",
  "ring",
  "roboxer",
  "shield",
  "spikes",
  "spring",
  "surge",
  "surpreyes",
  "switch",
  "teleporter"
];

let numLoaded = 0;
let spriteData: data_sprite_t[] = [];

/**
 * sprite_init()
 * Initializes the sprite module
 */
export const sprite_init = () => {
  return new Promise(function (fulfill, reject){

    let i;

    logfile_message("Loading sprites...");
    sprites = hashtable_spriteinfo_t_create();

    for(i=0;i<spriteFiles.length;i++) {
      spriteFiles[i] = "data/sprites/"+spriteFiles[i]+".json";
    }

    video_renderLoading('Loading...',0);

    resourcemanager_getJsonFiles(spriteFiles)
    .then(function(data:data_sprite_file_t[]){

      //console.log('GOT ALL SPRITE JSON FILES')      

      // merge data
      for(i=0;i<data.length;i++) {
        for (let s in data[i]) {
          data[i][s].name = s;
          spriteData.push(data[i][s]);
        }
      }

      traverse(spriteData)
      .then(function(){
        logfile_message("All sprites have been loaded!");
        //console.log(hashtable.hash.sprites)
        sprites = hashtable_sprites();
        //cb();
        fulfill(sprites);
      });

    });
  });
}

/**
 * sprite_get_animation()
 * Receives the sprite name and the desired animation number.
 * Returns a pointer to an animation object.
 */
export const sprite_get_animation = (sprite_name:string, anim_id:number) => {
  let info;

  /* find the corresponding spriteinfo_t* instance */
  //info = sprites[sprite_name];
  info = sprites[sprite_name];
  //console.log(info)
  //info = hashtable_spriteinfo_t_find(sprites, sprite_name);
  if(info != null) {
    //anim_id = Math.min(anim_id, 0, info.animation_count-1);
    return info.animation_data[anim_id];
  }
  else {
    //fatal_error("Can't find sprite '%s' (animation %d)", sprite_name, anim_id);
    return null;
  }
}

/**
 * sprite_get_image()
 * Receives an animation and the desired frame number.
 * Returns an image.
 */
export const sprite_get_image = (anim:animation_t, frame_id:number) => {
  if (!anim) return 0;
  //frame_id = Math.min(frame_id, 0, anim.frame_count-1);
  return anim.frame_data[anim.data[frame_id]];
}

export const sprite_create = (tree:data_sprite_t) => {
  //console.log('CREATE SPRITE',tree)
  return new Promise(function (fulfill, reject){
    spriteinfo_create(tree)
    .then(fulfill);
  });
}

/**
 * spriteinfo_destroy()
 * Destroys a spriteinfo_t object
 */
export const sprite_info_destroy = (info:spriteinfo_t) => {
  let i;

  if(info.source_file != null)
    info.source_file = null

  if(info.frame_data != null) {
      for(i=0; i<info.frame_count; i++)
          image_destroy(info.frame_data[i]);
      info.frame_data = null;
  }

  if(info.animation_data != null) {
      for(i=0; i<info.animation_count; i++)
          info.animation_data[i] = animation_delete(info.animation_data[i]);
      info.animation_data = null;
  }

  info = null;
}

const createCanvas = (imgUrl:string, spr:spriteinfo_t) => {
  let canvas = document.createElement("canvas");
  canvas.width = spr.rect_w;
  canvas.height = spr.rect_h;
  document.body.appendChild(canvas);
  return canvas.getContext("2d");
}

/**
 * animation_delete()
 * Deletes an existing animation_t instance
 */
const animation_delete = (anim:animation_t):null => {
  if(anim != null) {
    if(anim.data != null)
      anim.data = null;
    anim = null;
  }
  return null;
}

/**
 * validate_sprite()
 * Validates the sprite
 */
const validate_sprite = (spr:spriteinfo_t) => {
  let i, j, n;

  //console.log(spr)

  if(spr.frame_w > spr.rect_w || spr.frame_h > spr.rect_h) {
      //logfile_message("Sprite error: frame_size (%d,%d) can't be larger than source_rect size (%d,%d)", spr.frame_w, spr.frame_h, spr.rect_w, spr.rect_h);
      spr.frame_w = Math.min(spr.frame_w, spr.rect_w);
      spr.frame_h = Math.min(spr.frame_h, spr.rect_h);
      //logfile_message("Adjusting frame_size to (%d,%d)", spr.frame_w, spr.frame_h);
  }

  if(spr.rect_w % spr.frame_w > 0 || spr.rect_h % spr.frame_h > 0) {
      //logfile_message("Sprite error: incompatible frame_size (%d,%d) x source_rect size (%d,%d). source_rect size should be a multiple of frame_size.", spr.frame_w, spr.frame_h, spr.rect_w, spr.rect_h);
      spr.rect_w = (spr.rect_w % spr.frame_w > 0) ? (spr.rect_w - spr.rect_w % spr.frame_w + spr.frame_w) : spr.rect_w;
      spr.rect_h = (spr.rect_h % spr.frame_h > 0) ? (spr.rect_h - spr.rect_h % spr.frame_h + spr.frame_h) : spr.rect_h;
      //logfile_message("Adjusting source_rect size to (%d,%d)", spr.rect_w, spr.rect_h);
  }

  //if(spr.animation_count < 1 || spr.animation_data == null)
  //    fatal_error("Sprite error: sprites must contain at least one animation");

  n = (spr.rect_w / spr.frame_w) * (spr.rect_h / spr.frame_h);
  for(i=0; i<spr.animation_count; i++) {
      for(j=0; j<spr.animation_data[i].frame_count; j++) {
          if(!(spr.animation_data[i].data[j] >= 0 && spr.animation_data[i].data[j] < n)) {
              //logfile_message("Sprite error: invalid frame '%d' of animation %d. Animation frames must be in range %d..%d", spr.animation_data[i].data[j], i, 0, n-1);
              spr.animation_data[i].data[j] = Math.min(spr.animation_data[i].data[j], 0, n-1);
              //logfile_message("Adjusting animation frame to %d", spr.animation_data[i].data[j]);
          }
      }
  }

  return spr;
}

/**
 * validate_animation()
 * Validates the animation
 */
const validate_animation = (anim:animation_t) => {
  if(anim.frame_count == 0)
    logfile_message("Animation error: invalid 'data' field. You must specify the frames of the animations");
  //  fatal_error("Animation error: invalid 'data' field. You must specify the frames of the animations");
}

/**
 * spriteinfo_create()
 * Creates and stores on the memory a spriteinfo_t
 * object by parsing the passed tree
 */
const spriteinfo_create = (tree:data_sprite_t) => {
  return new Promise(function (fulfill, reject){
    let s = spriteinfo_new();
    let sprite = traverse_sprite_attributes(s,tree);
    sprite = validate_sprite(sprite);
    //fulfill();
    load_sprite_images(sprite)
    .then(function(loadedSprite:spriteinfo_t){
      //console.log('SPRITE LOADED',loadedSprite)
      sprite = fix_sprite_animations(loadedSprite);
      register_sprite(tree.name, sprite)
      numLoaded++;
      video_renderLoading('Loading...',numLoaded/spriteData.length);
      fulfill(sprite);
    });
  });
}

/**
 * spriteinfo_new()
 * Creates a new empty spriteinfo_t instance
 */
const spriteinfo_new = () => {
  const info:spriteinfo_t = {
    source_file: null,
    rect_x: 0,
    rect_y: 0,
    rect_w: 0,
    rect_h: 0,
    frame_w: 0,
    frame_h: 0,
    hot_spot: v2d_new(0,0),
    frame_count: 0,
    frame_data: [],
    animation_count: 0,
    animation_data: []
  } 

  return info;
}

/**
 * load_sprite_images()
 * Loads the sprite by reading the spritesheet
 * !!! this function needs to be highly optimzed, it gets run many many times
 */
const load_sprite_images = (spr:spriteinfo_t) => {
  //console.log('load_sprite_images')
  return new Promise(function (fulfill, reject){
    let i = 0;
    let cur_x = 0;
    let cur_y = 0;
    // need to put event listener inside of image.load and return promise
    image_load(spr.source_file)
    .then(function(sheet:image_t){

      //console.log('image loaded',spr.source_file)

      //console.log(sheet)
      spr.frame_count = (spr.rect_w / spr.frame_w) * (spr.rect_h / spr.frame_h);
      spr.frame_data = [];

      spr = setupCanvasSprite(spr,sheet);
      //console.log(spr)
      fulfill(spr);
    })
  });
}

const setupCanvasSprite = (spr:spriteinfo_t, sheet:image_t) => {
  let cur_x = 0;
  let cur_y = 0;

  //console.log('setupCanvasSprite', sheet);

  for(let i=0; i<spr.frame_count; i++) {

    spr.frame_data[i] = {
      data: sheet,
      sx: cur_x + spr.rect_x,
      sy: cur_y + spr.rect_y,
      swidth: spr.frame_w,
      sheight: spr.frame_h,
      x: 0,
      y: 0,
      width: spr.frame_w,
      height: spr.frame_h
    };

    cur_x += spr.frame_w;

    if(cur_x >=spr.rect_w) {
      cur_x = 0;
      cur_y += spr.frame_h;
    }
  }

  return spr;
}

const fix_sprite_animations = (spr:spriteinfo_t) => {
  for(let i=0; i<spr.animation_count; i++) {
    spr.animation_data[i].frame_data = spr.frame_data;
    spr.animation_data[i].hot_spot = spr.hot_spot;
  }
  return spr;
}

/**
 * traverse()
 * Sprite list traversal
 */
const traverse = (data:data_sprite_t[]) => {
  return Promise.all(data.map(spriteinfo_create));
}

/**
 * traverse_sprite_attributes()
 * Sprite attributes traversal
 */
const traverse_sprite_attributes = (sprite:spriteinfo_t, s:data_sprite_t) => {

  /* source_file */
  sprite.source_file = DATA_ROOT + s.source_file;

  /* source_rect */
  sprite.rect_x = s.source_rect.xpos;
  sprite.rect_y = s.source_rect.ypos;
  sprite.rect_w = s.source_rect.width;
  sprite.rect_h = s.source_rect.height;

  /* frame_size */
  sprite.frame_w = s.frame_size.width;
  sprite.frame_h = s.frame_size.height;

  /* hot_spot */
  if(s.hot_spot) {
    sprite.hot_spot.x = s.hot_spot.xpos;
    sprite.hot_spot.y = s.hot_spot.ypos;
  }

  /* animations */
  if(s.animations) {
    sprite.animation_count = s.animations.length;
    for(var i=0;i<sprite.animation_count;i++) {
      sprite.animation_data[i] = traverse_animation_attributes(animation_new(), s.animations[i]);
      validate_animation(sprite.animation_data[i]);
    }
  }

  return sprite;
}

/**
 * traverse_animation_attributes()
 * Animation attributes traversal
 */
const traverse_animation_attributes = (anim:animation_t, animation:data_sprite_animation_t) => {
  //console.log(anim, animation);

  anim.repeat = animation.repeat;
  anim.fps = animation.fps;
  anim.data = animation.data;
  anim.frame_count = animation.data.length;

  return anim;
}

/**
 * register_sprite()
 * Adds spr to the main hash. Please provide the internal name as the sprite_name.
 */
const register_sprite = (sprite_name:string, spr:spriteinfo_t) => {
  //logfile_message("Registering sprite '%s'...", sprite_name);
  hashtable_spriteinfo_t_add(hashtable_sprites(), sprite_name, spr);
}

/**
 * animation_new()
 * Creates a new empty animation_t instance
 */
const animation_new = () => {
  const anim:animation_t = {
    repeat:false,
    fps: 8,
    frame_count: 0,
    data: null, /* this will be malloc'd later */
    hot_spot: v2d_new(0,0),
    frame_data: null
  }
  return anim;
}
