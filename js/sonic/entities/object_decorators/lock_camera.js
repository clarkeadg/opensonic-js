
import { get_object_instance } from "./base/objectdecorator"
import { enemy_get_observed_player } from "./../enemy"
import { bounding_box } from "./../../core/util"
import { video_get_backbuffer, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../../core/video"
import { IF_NONE } from "./../../core/global"
import { image_create, image_draw, image_line, image_clear, image_rgb } from "./../../core/image"

export const lockcamera_new = (decorated_machine, x1, y1, x2, y2) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;

  me.x1 = Math.min(x1, x2);
  me.y1 = Math.min(y1, y2);
  me.x2 = Math.max(x1, x2);
  me.y2 = Math.max(y1, y2);

  return obj;
} 

const init = (obj) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;
  let me = obj;
  let w, h;

  w = Math.abs(me.x2 - me.x1);
  h = Math.abs(me.y2 - me.y1);

  //if(w*h <= 0)
    //fatal_error("The rectangle passed to lock_camera must have a positive area");

  me.cute_image = create_cute_image(w, h);
  me.has_locked_somebody = false;

  decorated_machine.init(decorated_machine);
}

const release = (obj) => {
  //let dec = obj;
  //let decorated_machine = dec.decorated_machine;
  //decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj, team, team_size, brick_list, item_list, object_list) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  let object = obj.get_object_instance(obj);
  let player = enemy_get_observed_player(object);
  let me = obj;
  let act = object.actor, *ta;
  let rx, ry, rw, rh;
  let i;

  /* my rectangle, in world coordinates */
  rx = act.position.x + me.x1;
  ry = act.position.y + me.y1;
  rw = me.x2 - me.x1;
  rh = me.y2 - me.y1;

  /* only the observed player can enter this area */
  for(i=0; i<team_size; i++) {
      ta = team[i].actor;

    if(team[i] != player || (NULL != ta.carrying)) {
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
        level.lock_camera(rx, ry, rx+rw, ry+rh);
      }
    }
  }

  /* cage */
  if(me.has_locked_somebody) {
    ta = player.actor;
    if(ta.position.x < rx) {
      ta.position.x = rx;
      ta.speed.x = max(0.0, ta.speed.x);
      player.at_some_border = true;
    }
    if(ta.position.x > rx + rw) {
      ta.position.x = rx + rw;
      ta.speed.x = min(0.0, ta.speed.x);
      player.at_some_border = true;
    }
    ta.position.y = Math.min(ta.position.y, ry, ry + rh);
  }

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  if(level_editmode()) {
    let me = obj;
    let act = obj.get_object_instance(obj).actor;
    let x, y;

    x = (act.position.x + me.x1) - (camera_position.x - VIDEO_SCREEN_W/2);
    y = (act.position.y + me.y1) - (camera_position.y - VIDEO_SCREEN_H/2);
    image_draw(me.cute_image, video_get_backbuffer(), x, y, IF_NONE);
  }

  decorated_machine.render(decorated_machine, camera_position);
}

const create_cute_image = (w, h) => {
  let image = image_create(w, h);
  let color = image_rgb(255, 0, 0);

  image_clear(image, video_get_maskcolor());
  image_line(image, 0, 0, w-1, 0, color);
  image_line(image, 0, 0, 0, h-1, color);
  image_line(image, w-1, h-1, w-1, 0, color);
  image_line(image, w-1, h-1, 0, h-1, color);

  return image;
}
