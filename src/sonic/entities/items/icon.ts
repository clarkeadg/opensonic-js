import { item_t, item_list_t } from "./../item"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { image_create, image_clear } from "./../../core/image"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_image } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { random } from "./../../core/util"
import { v2d_new } from "./../../core/v2d"
import { IS_IDLE, IS_DEAD } from "./../item"
import { level_create_particle } from "./../../scenes/level"

export interface icon_t extends item_t {
  elapsed_time: 0.0
}

export const icon_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

export const icon_change_animation = (item:item_t, anim_id:number) => {
  actor_change_animation(item.actor, sprite_get_animation("SD_ICON", anim_id));
}

const init = (item:item_t) => {
  const me:icon_t = <icon_t>item;

  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor_create();

  me.elapsed_time = 0.0;
  icon_change_animation(item, 0);
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {
  const me:icon_t = <icon_t>item;
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
    let x = act.position.x-act.hot_spot.x;
    let y = act.position.y-act.hot_spot.y;
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

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}


