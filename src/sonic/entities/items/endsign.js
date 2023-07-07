
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { sprite_get_animation } from "./../../core/sprite"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_animation_finished, actor_pixelperfect_collision } from "./../actor"
import { level_clear } from "./../../scenes/level"

export const endsign_create = () => {
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
  item.bring_to_back = false;
  item.preserve = true;
  item.actor = actor_create();

  me.who = null;
  actor_change_animation(item.actor, sprite_get_animation("SD_ENDSIGN", 0));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = item;
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

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
} 


