import { item_t, item_list_t } from "./../item"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sprite_get_animation } from "./../../core/sprite"
import { actor_create, actor_render, actor_destroy, actor_collision, actor_change_animation } from "./../actor"
import { SH_FIRESHIELD } from "./../player"
import { level_editmode } from "./../../scenes/level"

export interface danger_t extends item_t {
  sprite_name: string,
  player_is_vulnerable: any
}

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

const danger_create = (sprite_name:string, player_is_vulnerable:any) => {
  const item:item_t = {
    init,
    release,
    update,
    render
  }
  const me:danger_t = <danger_t>item;

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  me.sprite_name = sprite_name;
  me.player_is_vulnerable = player_is_vulnerable;

  return item;
}

const init = (item:item_t) => {
  const me:danger_t = <danger_t>item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation(me.sprite_name, 0));
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {
  const me:danger_t = <danger_t>item;
  const act = item.actor;

  for(let i=0; i<team_size; i++) {
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

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

const always_vulnerable = (player:any) => {
  return true;
}

const can_defend_against_fire = (player:any) => {
  return (player.shield_type != SH_FIRESHIELD);
}


