
import { PI } from "./../core/global"
import { v2d_t, v2d_new, v2d_subtract } from "./../core/v2d"
import { spriteinfo_t, sprite_info_destroy, sprite_create } from "./../core/sprite"
import { VIDEO_SCREEN_W, VIDEO_SCREEN_H} from "./../core/video"
import { logfile_message } from "./../core/logfile"
import { timer_get_delta } from "./../core/timer"
import { resourcemanager_getJsonFile } from "./../core/resourcemanager"
import { isArray } from "./../core/util"
import { actor_t, actor_create, actor_destroy, actor_render_repeat_xy } from "./actor"

export interface bgtheme_t {
  data: background_t[],
  length: number
}

export interface bgstrategy_t {
  background: background_t,
  update: Function
}

export interface background_t {
  actor: actor_t
  data: spriteinfo_t,
  repeat_x: boolean,
  repeat_y: boolean,
  zindex: number,
  strategy: bgstrategy_t
}

export interface bgstrategy_default_t extends bgstrategy_t {}

export interface bgstrategy_linear_t extends bgstrategy_t {
  speed_x: number,
  speed_y: number
}

export interface bgstrategy_circular_t extends bgstrategy_t {
  timer: number,
  amplitude_x: number,
  amplitude_y: number,
  angularspeed_x: number,
  angularspeed_y: number,
  initialphase_x: number,
  initialphase_y: number
}

/**
 * background_load()
 * Loads a background theme from a .bg file
 */
export const background_load = (file:string) => {
  //console.log("background_load", file)
  return new Promise(function (fulfill, reject){

    logfile_message(`background_load("${file}")`);

    resourcemanager_getJsonFile(file)
    .then(traverse)
    .then(function(bgdata){
      fulfill({
        data: bgdata,
        length: bgdata.length
      });
    });
   });         
}

/**
 * background_unload()
 * Unloads a background theme
 */
export const background_unload = (bgtheme:bgtheme_t):bgtheme_t => {

  logfile_message("background_unload()");

  for(let i=0; i<bgtheme.length; i++)
    bgtheme.data[i] = background_delete(bgtheme.data[i]);

  return null;
}

/**
 * background_update()
 * Updates the background
 */
export const background_update = (bgtheme:bgtheme_t) => {
  if (!bgtheme) return false;

  //console.log(bgtheme)
  for(let i=0; i<bgtheme.length; i++) {
    const bg:background_t = bgtheme.data[i];
    if (bg.strategy && bg.strategy.update)
      bg.strategy.update(bg.strategy);
  }
}

/**
 * background_render_bg()
 * Renders the background
 */
export const background_render_bg = (bgtheme:bgtheme_t, camera_position:v2d_t) => {
  render(bgtheme, camera_position, false);
}

/**
 * background_render_fg()
 * Renders the foreground
 */
export const background_render_fg = (bgtheme:bgtheme_t, camera_position:v2d_t) => {
  render(bgtheme, camera_position, true);
}

const render = (bgtheme:bgtheme_t, camera_position:v2d_t, foreground:boolean) => {
  if (!bgtheme) return;

  let i;
  const halfscreen = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);
  const topleft = v2d_subtract(camera_position, halfscreen);
  let bg;

  for(i=0; i<bgtheme.length; i++) {
    bg = bgtheme.data[i];
    if((!foreground && bg.zindex <= 0.5) || (foreground && bg.zindex > 0.5)) {
      
      bg.actor.position.x += topleft.x * bg.actor.speed.x;
      bg.actor.position.y += topleft.y * bg.actor.speed.y;

      actor_render_repeat_xy(bg.actor, halfscreen, bg.repeat_x, bg.repeat_y);

      bg.actor.position.y -= topleft.y * bg.actor.speed.y;
      bg.actor.position.x -= topleft.x * bg.actor.speed.x;
    }
  }
}

const background_new = ():background_t => {

  const bg:background_t = {
    actor: actor_create(),
    data: null,
    strategy: null,
    repeat_x: false,
    repeat_y: false,
    zindex: 0.0
  }; 

  return bg;
}

const background_delete = (bg:background_t):background_t => {
  bg.strategy = bgstrategy_delete(bg.strategy);
  sprite_info_destroy(bg.data);
  actor_destroy(bg.actor);
  bg = null;

  return null;
}

const bgstrategy_delete = (strategy:bgstrategy_t):bgstrategy_t => {
  strategy = null;
  return null;
}

const bgstrategy_default_new = (background:background_t):bgstrategy_t => {  
  
  const base:bgstrategy_t = {
    background: background,
    update: bgstrategy_default_update
  }

  const me:bgstrategy_default_t = <bgstrategy_default_t>base;

  return base;
}

const bgstrategy_default_update = (strategy:bgstrategy_t) => {
  ; /* empty */
}

const bgstrategy_linear_new = (background:background_t, speed_x:number, speed_y:number):bgstrategy_t => {
  
  const base:bgstrategy_t = {
    background: background,
    update: bgstrategy_linear_update
  }

  const me:bgstrategy_linear_t = <bgstrategy_linear_t>base;

  me.speed_x = speed_x;
  me.speed_y = speed_y;

  return base;
}

const bgstrategy_linear_update = (strategy:bgstrategy_t) => {
  
  const me:bgstrategy_linear_t = <bgstrategy_linear_t>strategy;
  const bg = strategy.background;
  const dt = timer_get_delta();

  bg.actor.position.x += me.speed_x * dt;
  bg.actor.position.y += me.speed_y * dt;
}

const bgstrategy_circular_new = (background:background_t, amplitude_x:number, amplitude_y:number, angularspeed_x:number, angularspeed_y:number, initialphase_x:number, initialphase_y:number):bgstrategy_t => {
  
  const base:bgstrategy_t = {
    background: background,
    update: bgstrategy_linear_update
  }

  const me:bgstrategy_circular_t = <bgstrategy_circular_t>base;  

  me.timer = 0;
  me.amplitude_x = amplitude_x;
  me.amplitude_y = amplitude_y;
  me.angularspeed_x = (2.0 * PI) * angularspeed_x;
  me.angularspeed_y = (2.0 * PI) * angularspeed_y;
  me.initialphase_x = (initialphase_x * PI) / 180.0;
  me.initialphase_y = (initialphase_y * PI) / 180.0;  

  return base;
}

const bgstrategy_circular_update = (strategy:bgstrategy_circular_t) => {
  const me:bgstrategy_circular_t = <bgstrategy_circular_t>strategy;
  const bg = strategy.background;  
  const dt = timer_get_delta();
  let t, sx, cy;

  t = (me.timer += dt);
  sx = Math.sin(me.angularspeed_x * t + me.initialphase_x);
  cy = Math.cos(me.angularspeed_y * t + me.initialphase_y);

  /* elliptical trajectory */
  bg.actor.position.x += (-me.angularspeed_x * me.amplitude_x * sx) * dt;
  bg.actor.position.y += (me.angularspeed_y * me.amplitude_y * cy) * dt;
}

const traverse = (data:any) => {
  const bg = data.bg;
  return Promise.all(bg.map(traverse_background_attributes));
}

const traverse_background_attributes = (data:any, bgdata:any) => {
  return new Promise(function (fulfill, reject){
    let bg = background_new();

    /* initial_position */
    bg.actor.spawn_point.x = data.initial_position.xpos;
    bg.actor.spawn_point.y = data.initial_position.ypos;
    bg.actor.position = v2d_new(bg.actor.spawn_point.x, bg.actor.spawn_point.y);

    /* scroll_speed */
    bg.actor.speed.x = data.scroll_speed.xspeed;
    bg.actor.speed.y = data.scroll_speed.yspeed;

    /* behavior */
    let strategy = null;
    if (data.behavior && isArray(data.behavior)) {
      strategy = data.behavior[0]; 
    } else {
      strategy = data.behavior;
    }

    switch(strategy) {
      case 'DEFAULT':
        //bg.strategy = strategy;
        if(bg.strategy)
          bg.strategy = bgstrategy_delete(bg.strategy);
        bg.strategy = bgstrategy_default_new(bg);
      break;
      case 'LINEAR':
        if(bg.strategy)
          bg.strategy = bgstrategy_delete(bg.strategy);
        bg.strategy = bgstrategy_linear_new(bg, data.behavior[1], data.behavior[2]);
      break;
      case 'CIRCULAR':
        if(bg.strategy)
          bg.strategy = bgstrategy_delete(bg.strategy);
        bg.strategy = bgstrategy_circular_new(bg, data.behavior[1], data.behavior[2], data.behavior[3], data.behavior[4], data.behavior[5], data.behavior[6]);
      break;
      default:
      break;
    }

    /* repeat */
    bg.repeat_x = data.repeat_x;
    bg.repeat_y = data.repeat_y;

    /* zindex */
    if (data.zindex) {
      bg.zindex = data.zindex;
    }

    /* sprite */
    sprite_create(data.sprite)
    .then(function(spr:any){
      bg.data = spr;
      bg.actor.animation = spr;
      bg.actor.animation.data = [0];
      //bg.actor.image = bg.actor.animation.frame_data[0];
      fulfill(bg);
    });
  });
}

const validate_background = (bg:background_t) => {

  if(bg.data == null)
    logfile_message("Can't read background: no sprite data given");
    //fatal_error("Can't read background: no sprite data given");

  if(bg.strategy == null)
    logfile_message("Can't read background: no behavior given");
    //fatal_error("Can't read background: no behavior given");
}

const sort_backgrounds = (bgtheme:bgtheme_t) => {
  return bgtheme;
}
