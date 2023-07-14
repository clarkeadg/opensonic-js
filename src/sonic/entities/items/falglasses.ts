import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { PI } from "./../../core/global"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { v2d_add } from "./../../core/v2d"
import { level_gravity } from "./../../scenes/level"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_particle_movement } from "./../actor"

export interface falglasses_t extends item_t {}

export const falglasses_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

export const falglasses_set_speed = (item:item_t, speed:number) => {
  if(item.actor != null)
    item.actor.speed = speed;
};

const init = (item:item_t) => {
  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation("SD_GLASSES", 4));
  item.actor.hot_spot.y *= 0.5;
}

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  const act = item.actor;
  const dt = timer_get_delta();

  act.angle += Math.sign(act.speed.x) * (6.0 * PI * dt);
  act.position = v2d_add(act.position, actor_particle_movement(act, level_gravity()));
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}
