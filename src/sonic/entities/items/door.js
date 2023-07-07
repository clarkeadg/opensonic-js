
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { timer_get_delta } from "./../../core/timer"
import { actor_create, actor_move, actor_render, actor_destroy, actor_change_animation, actor_image } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"

export const door_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  return item;
}

export const door_open = (door) => {
  let me = door;
  me.is_closed = false;
  sound_play( soundfactory_get("open door") );
}

export const door_close = (door) => {
  let me = door;
  me.is_closed = true;
  sound_play( soundfactory_get("close door") );
}

const init = (item) => {
  let me = item;

  item.obstacle = true;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_closed = true;
  actor_change_animation(item.actor, sprite_get_animation("SD_DOOR", 0));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = item;
  let act = item.actor;
  let speed = 2000.0;
  const dt = timer_get_delta();

  if(me.is_closed) {
    act.position.y = parseInt(Math.min(act.position.y + speed*dt, act.spawn_point.y),10);
  } else {   
    act.position.y = parseInt(Math.max(act.position.y - speed*dt, act.spawn_point.y - actor_image(act).height * 0.8),10);
  }
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}


