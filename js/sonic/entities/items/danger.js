
import { sprite_get_animation } from "./../../core/sprite"
import { actor_create, actor_render, actor_destroy, actor_collision, actor_change_animation } from "./../actor"
import { SH_FIRESHIELD } from "./../item"
import { level_editmode } from "./../../scenes/level" 

export const horizontaldanger_create = () => {
  return danger_create("SD_DANGER", always_vulnerable);
}

export const verticaldanger_create = () => {
  return danger_create("SD_VERTICALDANGER", always_vulnerable);
}

export const horizontalfiredanger_create = () => {
  return danger_create("SD_FIREDANGER", can_defend_against_fire);
}

export const verticalfiredanger_create = () => {
  return danger_create("SD_VERTICALFIREDANGER", can_defend_against_fire);
}

const danger_create = (sprite_name, player_is_vulnerable) => {
  let item = {};
  let me = item;

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  me.sprite_name = sprite_name;
  me.player_is_vulnerable = player_is_vulnerable;

  return item;
}

const init = (item) => {
  let me = item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation(me.sprite_name, 0));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let i;
  let me = item;
  let act = item.actor;

  for(i=0; i<team_size; i++) {
    let player = team[i];
    if (player) {
      if(!player.dying && !player.blinking && !player.invincible && actor_collision(act, player.actor)) {
        if(me.player_is_vulnerable(player))
          player.hit(player);
      }
    }
  }

  act.visible = level_editmode();
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}

const always_vulnerable = (player) => {
  return true;
}

const can_defend_against_fire = (player) => {
  return (player.shield_type != SH_FIRESHIELD);
}


