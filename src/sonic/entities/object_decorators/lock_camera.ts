
import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { enemy_get_observed_player } from "./../enemy"
import { bounding_box } from "./../../core/util"
import { video_get_backbuffer, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../../core/video"
import { IF_NONE } from "./../../core/global"
import { image_create, image_draw, image_line, image_clear, image_rgb } from "./../../core/image"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"
import { player_t } from "./../player"
import { level_lock_camera } from "./../../scenes/level"

export interface objectdecorator_lockcamera_t extends objectdecorator_t {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cute_image: any,
  has_locked_somebody: boolean
}

export const objectdecorator_lockcamera_new = (decorated_machine:objectmachine_t, x1:number, y1:number, x2:number, y2:number) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_lockcamera_t = <objectdecorator_lockcamera_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.x1 = Math.min(x1, x2);
  me.y1 = Math.min(y1, y2);
  me.x2 = Math.max(x1, x2);
  me.y2 = Math.max(y1, y2);

  return obj;
} 

const init = (obj:objectmachine_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  const me:objectdecorator_lockcamera_t = <objectdecorator_lockcamera_t>obj;


  let w = Math.abs(me.x2 - me.x1);
  let h = Math.abs(me.y2 - me.y1);

  //if(w*h <= 0)
    //fatal_error("The rectangle passed to lock_camera must have a positive area");

  me.cute_image = create_cute_image(w, h);
  me.has_locked_somebody = false;

  decorated_machine.init(decorated_machine);
}

const release = (obj:objectmachine_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  
  decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj:objectmachine_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  const me:objectdecorator_lockcamera_t = <objectdecorator_lockcamera_t>obj;

  const object = obj.get_object_instance(obj);
  const player = enemy_get_observed_player(object);
  const act = object.actor;

  let rx, ry, rw, rh;
  let ta;

  /* my rectangle, in world coordinates */
  rx = act.position.x + me.x1;
  ry = act.position.y + me.y1;
  rw = me.x2 - me.x1;
  rh = me.y2 - me.y1;

  /* only the observed player can enter this area */
  for(let i=0; i<team_size; i++) {
    ta = team[i].actor;

    if(team[i] != player || (null != ta.carrying)) {
      /* hey, you can't enter here! */
      let border = 30.0;
      if(ta.position.x > rx - border && ta.position.x < rx) {
        ta.position.x = rx - border;
        ta.speed.x = 0.0;
      }
      if(ta.position.x > rx + rw && ta.position.x < rx + rw + border) {
        ta.position.x = rx + rw + border;
        ta.speed.x = 0.0;
      }
    }
    else {
      /* test if the player has got inside my rectangle */
      let a = [];
      let b = [];

      a[0] = ta.position.x;
      a[1] = ta.position.y;
      a[2] = ta.position.x + 1;
      a[3] = ta.position.y + 1;

      b[0] = rx;
      b[1] = ry;
      b[2] = rx + rw;
      b[3] = ry + rh;

      if(bounding_box(a, b)) {
        /* welcome, player! You have been locked. BWHAHAHA!!! */
        me.has_locked_somebody = true;
        team[i].in_locked_area = true;
        level_lock_camera(rx, ry, rx+rw, ry+rh);
      }
    }
  }

  /* cage */
  if(me.has_locked_somebody) {
    ta = player.actor;
    if(ta.position.x < rx) {
      ta.position.x = rx;
      ta.speed.x = Math.max(0.0, ta.speed.x);
      player.at_some_border = true;
    }
    if(ta.position.x > rx + rw) {
      ta.position.x = rx + rw;
      ta.speed.x = Math.min(0.0, ta.speed.x);
      player.at_some_border = true;
    }
    ta.position.y = Math.min(ta.position.y, ry, ry + rh);
  }

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  /*if(level_editmode()) {
    const me:objectdecorator_lockcamera_t = <objectdecorator_lockcamera_t>obj;
    const act = obj.get_object_instance(obj).actor;
    let x, y;

    x = (act.position.x + me.x1) - (camera_position.x - VIDEO_SCREEN_W/2);
    y = (act.position.y + me.y1) - (camera_position.y - VIDEO_SCREEN_H/2);
    image_draw(me.cute_image, video_get_backbuffer(), x, y, IF_NONE);
  }*/

  decorated_machine.render(decorated_machine, camera_position);
}

const create_cute_image = (w:number, h:number) => {
  let image = image_create(w, h);
  let color = image_rgb(255, 0, 0);

  //image_clear(image, video_get_maskcolor());
  //image_line(image, 0, 0, w-1, 0, color);
  //image_line(image, 0, 0, 0, h-1, color);
  //image_line(image, w-1, h-1, w-1, 0, color);
  //image_line(image, w-1, h-1, 0, h-1, color);

  return image;
}
