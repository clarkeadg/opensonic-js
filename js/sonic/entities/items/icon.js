
import { image_create, image_clear } from "./../../core/image"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_image } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { random } from "./../../core/util"
import { v2d_new } from "./../../core/v2d"
import { IS_IDLE, IS_DEAD } from "./../item"
import { level_create_particle } from "./../../scenes/level"

export const icon_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;
  item.change_animation = icon_change_animation;

  return item;
}

export const icon_change_animation = (item, anim_id) => {
  actor_change_animation(item.actor, sprite_get_animation("SD_ICON", anim_id));
}

const init = (item) => {
  let me = item;

  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor_create();

  me.elapsed_time = 0.0;
  icon_change_animation(item, 0);
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = item;
  let act = item.actor;
  let dt = timer_get_delta();

  me.elapsed_time += dt;
  if(me.elapsed_time < 1.0) {
    /* rise */
    act.position.y -= 40.0 * dt;
  }
  else if(me.elapsed_time >= 2.5) {
    /* death */
    let i, j;
    let x = parseInt((act.position.x-act.hot_spot.x),10);
    let y = parseInt((act.position.y-act.hot_spot.y),10);
    let img = actor_image(act)
    let particle;

    /* particle party! :) */
    for(i=0; i<img.h; i++) {
      for(j=0; j<img.w; j++) {
        particle = image_create(1,1);
        image_clear(particle, 255, 255, 255);
        //image.clear(particle, image.getpixel(img, j, i));
        level_create_particle(particle, v2d_new(x+j, y+i), v2d_new((j-img.width/2) + (random(img.width)-img.width/2), i-random(img.height/2)), false);
      }
    }

    item.state = IS_DEAD;
  }
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}


