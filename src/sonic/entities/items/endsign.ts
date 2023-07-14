import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { sprite_get_animation } from "./../../core/sprite"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_animation_finished, actor_pixelperfect_collision } from "./../actor"
import { level_clear } from "./../../scenes/level"

export interface endsign_t extends item_t {
  who: player_t
}

export const endsign_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

const init = (item:item_t) => {
  const me:endsign_t = <endsign_t>item;

  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = true;
  item.actor = actor_create();

  me.who = null;
  actor_change_animation(item.actor, sprite_get_animation("SD_ENDSIGN", 0));
}

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  const me:endsign_t = <endsign_t>item;
  let act = item.actor;

  if(me.who == null) {
    /* I haven't been touched yet */
    let i;

    for(i=0; i<team_size; i++) {
      let player = team[i];
      if (player) {
        if(!player.dying && actor_pixelperfect_collision(player.actor, act)) {
          me.who = player; /* I have just been touched by 'player' */
          sound_play( soundfactory_get("end sign") );
          actor_change_animation(act, sprite_get_animation("SD_ENDSIGN", 1));
          level_clear(item.actor);
        }
      }
    }
  }
  else {
      /* me.who has touched me! */
    if(actor_animation_finished(act)) {
      const anim_id = 2 + me.who.type; /* yeah, this is 'safe' :P */
      actor_change_animation(act, sprite_get_animation("SD_ENDSIGN", anim_id));
    }
  }
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
} 


