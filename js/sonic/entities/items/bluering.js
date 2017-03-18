
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { sprite_get_animation } from "./../../core/sprite"
import { actor_collision, actor_create, actor_render, actor_destroy, actor_change_animation, actor_animation_finished } from "./../actor"
import { IS_DEAD } from "./../item"
import { player_set_rings, player_get_rings } from "./../player"
import { level_editmode, level_player } from "./../../scenes/level"

export const bluering_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  return item;
}

const init = (item) => {
  let me = item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_disappearing = false;
  actor_change_animation(item.actor, sprite_get_animation("SD_BLUERING", 0));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let player = level_player();
  let me = item;
  let act = item.actor;

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

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}

