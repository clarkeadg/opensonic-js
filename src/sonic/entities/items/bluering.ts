import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { sprite_get_animation } from "./../../core/sprite"
import { actor_collision, actor_create, actor_render, actor_destroy, actor_change_animation, actor_animation_finished } from "./../actor"
import { IS_DEAD } from "./../item"
import { player_set_rings, player_get_rings } from "./../player"
import { level_editmode, level_player } from "./../../scenes/level"

export interface bluering_t extends item_t {
  is_disappearing: boolean
}

export const bluering_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

const init = (item:item_t) => {
  const me:bluering_t = <bluering_t>item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_disappearing = false;
  actor_change_animation(item.actor, sprite_get_animation("SD_BLUERING", 0));
}

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  const player = level_player();
  const me:bluering_t = <bluering_t>item;
  const act = item.actor;

  act.visible = (player.got_glasses || level_editmode());

  if(!me.is_disappearing) {
    if(!player.dying && player.got_glasses && actor_collision(act, player.actor)) {
      /* the player is capturing this ring */
      actor_change_animation(act, sprite_get_animation("SD_BLUERING", 1));
      player_set_rings( player_get_rings() + 5 );
      sound_play( soundfactory_get("blue ring") );
      me.is_disappearing = true;
    }
  }
  else {
    if(actor_animation_finished(act)) {
      /* ouch, I've been caught! It's time to disappear... */
      item.state = IS_DEAD;
    }
  }
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

