import { item_t, item_list_t } from "./../item"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_pixelperfect_collision, actor_animation_finished } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { level_set_spawn_point } from "./../../scenes/level" 

export interface checkpointorb_t extends item_t {
  is_active: boolean
}

export const checkpointorb_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

const init = (item:item_t) => {
  const me:checkpointorb_t = <checkpointorb_t>item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_active = false;
  actor_change_animation(item.actor, sprite_get_animation("SD_CHECKPOINT", 0));
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {
  const me:checkpointorb_t = <checkpointorb_t>item;
  const act = item.actor;

  if(!me.is_active) {
    /* activating the checkpoint orb... */
    for(let i=0; i<team_size; i++) {
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

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}


