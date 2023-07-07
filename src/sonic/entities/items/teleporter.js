
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { input_ignore, input_restore } from "./../../core/input"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { v2d_new, v2d_add } from "./../../core/v2d"
import { actor_create, actor_render, actor_destroy, actor_change_animation } from "./../actor"
import { PLAYER_WALL_NONE } from "./../../entities/player"
import { level_set_camera_focus } from "./../../scenes/level"

export const teleporter_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  return item;
}

export const teleporter_activate = (teleporter, who) => {
  let me = teleporter;
  let act = teleporter.actor;

  if(!me.is_active && !me.is_disabled) {
    me.is_active = true;
    me.who = who;

    input_ignore(who.actor.input);
    level_set_camera_focus(act);
    sound_play( soundfactory_get("teleporter") );
  }
}

const init = (item) => {
  let me = item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_disabled = false;
  me.is_active = false;
  me.timer = 0.0;

  actor_change_animation(item.actor, sprite_get_animation("SD_TELEPORTER", 0));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = item;
  let act = item.actor;
  const dt = timer_get_delta();
  let i, k = 0;

  if(me.is_active) {
    me.timer += dt;
    if(me.timer >= 3.0) {
      /* okay, teleport them all! */
      let who = me.who; /* who has activated the teleporter? */

      input_restore(who.actor.input);
      level_set_camera_focus(who.actor);

      for(i=0; i<team_size; i++) {
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

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}

const teleport_player_to = (player, position) => {
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


