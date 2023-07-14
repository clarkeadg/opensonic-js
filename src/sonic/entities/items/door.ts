import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { timer_get_delta } from "./../../core/timer"
import { actor_create, actor_move, actor_render, actor_destroy, actor_change_animation, actor_image } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"

export interface door_t extends item_t {
  is_closed: boolean
}

export const door_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

export const door_open = (door:item_t) => {
  const me:door_t = <door_t>door;
  me.is_closed = false;
  sound_play( soundfactory_get("open door") );
}

export const door_close = (door:item_t) => {
  const me:door_t = <door_t>door;
  me.is_closed = true;
  sound_play( soundfactory_get("close door") );
}

const init = (item:item_t) => {
  const me:door_t = <door_t>item;

  item.obstacle = true;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_closed = true;
  actor_change_animation(item.actor, sprite_get_animation("SD_DOOR", 0));
}

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  const me:door_t = <door_t>item;
  let act = item.actor;
  let speed = 2000.0;
  const dt = timer_get_delta();

  if(me.is_closed) {
    act.position.y = Math.min(act.position.y + speed*dt, act.spawn_point.y);
  } else {   
    act.position.y = Math.max(act.position.y - speed*dt, act.spawn_point.y - actor_image(act).height * 0.8);
  }
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}


