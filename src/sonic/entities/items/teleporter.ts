import { item_t, item_list_t } from "./../item"
import { brick_list_t } from "./../brick"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { input_ignore, input_restore } from "./../../core/input"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { v2d_t, v2d_new, v2d_add } from "./../../core/v2d"
import { actor_create, actor_render, actor_destroy, actor_change_animation } from "./../actor"
import { PLAYER_WALL_NONE } from "./../../entities/player"
import { level_set_camera_focus } from "./../../scenes/level"

export interface teleporter_t extends item_t {
  is_disabled: boolean,
  is_active: boolean,
  timer: number,
  who: any
}

export const teleporter_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

export const teleporter_activate = (teleporter:item_t, who:any) => {
  const me:teleporter_t = <teleporter_t>teleporter;
  const act = teleporter.actor;

  if(!me.is_active && !me.is_disabled) {
    me.is_active = true;
    me.who = who;

    input_ignore(who.actor.input);
    level_set_camera_focus(act);
    sound_play( soundfactory_get("teleporter") );
  }
}

const init = (item:item_t) => {
  const me:teleporter_t = <teleporter_t>item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_disabled = false;
  me.is_active = false;
  me.timer = 0.0;

  actor_change_animation(item.actor, sprite_get_animation("SD_TELEPORTER", 0));
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {
  const me:teleporter_t = <teleporter_t>item;
  const act = item.actor;
  const dt = timer_get_delta();
  let k = 0;

  if(me.is_active) {
    me.timer += dt;
    if(me.timer >= 3.0) {
      /* okay, teleport them all! */
      let who = me.who; /* who has activated the teleporter? */

      input_restore(who.actor.input);
      level_set_camera_focus(who.actor);

      for(let i=0; i<team_size; i++) {
        let player = team[i];
        if(player != who) {
          let position = v2d_add(act.position, v2d_new(-20 + 40*(k++), -30));
          teleport_player_to(player, position);
        }
      }

      me.is_active = false;
      me.is_disabled = true; /* the teleporter works only once */
    }
    else {
      ; /* the players are being teletransported... wait a little bit. */
    }

    actor_change_animation(act, sprite_get_animation("SD_TELEPORTER", 1));
  }
  else
    actor_change_animation(act, sprite_get_animation("SD_TELEPORTER", 0));
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

const teleport_player_to = (player:any, position:v2d_t) => {
  if (!player) return;
  player.actor.position = position;
  player.actor.speed = v2d_new(0,0);
  player.actor.is_jumping = false;
  player.flying = false;
  player.climbing = false;
  player.getting_hit = false;
  player.spring = false;
  player.actor.angle = 0;
  player.disable_wall = PLAYER_WALL_NONE;
  player.entering_loop = false;
  player.at_loopfloortop = false;
  player.bring_to_back = false;
}


