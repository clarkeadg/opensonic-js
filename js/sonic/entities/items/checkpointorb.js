
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_pixelperfect_collision, actor_animation_finished } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { level_set_spawn_point } from "./../../scenes/level" 

export const checkpointorb_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  return item;
}

const init = (item) => {
  var me = item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_active = false;
  actor_change_animation(item.actor, sprite_get_animation("SD_CHECKPOINT", 0));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = item;
  let act = item.actor;
  let i;

  if(!me.is_active) {
    /* activating the checkpoint orb... */
    for(i=0; i<team_size; i++) {
      let player = team[i];
      if (player) {
        if(!player.dying && actor_pixelperfect_collision(player.actor, act)) {
          me.is_active = true; /* I'm active! */
          sound_play( soundfactory_get("checkpoint") );
          level_set_spawn_point(act.position);
          actor_change_animation(act, sprite_get_animation("SD_CHECKPOINT", 1));
          break;
        }
      }
    }
  }
  else {
    if(actor_animation_finished(act))
      actor_change_animation(act, sprite_get_animation("SD_CHECKPOINT", 2));
  }
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}


