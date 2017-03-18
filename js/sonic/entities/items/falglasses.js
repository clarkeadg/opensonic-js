
import { PI } from "./../../core/global"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { v2d_add } from "./../../core/v2d"
import { level_gravity } from "./../../scenes/level"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_particle_movement } from "./../actor"

export const falglasses_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  return item;
}

export const falglasses_set_speed = (item, speed) => {
  if(item.actor != null)
    item.actor.speed = speed;
};

const init = (item) => {
  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor.create();

  actor_change_animation(item.actor, sprite_get_animation("SD_GLASSES", 4));
  item.actor.hot_spot.y *= 0.5;
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let act = item.actor;
  const dt = timer_get_delta();

  act.angle += Math.sign(act.speed.x) * (6.0 * PI * dt);
  act.position = v2d_add(act.position, actor_particle_movement(act, level_gravity()));
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}
