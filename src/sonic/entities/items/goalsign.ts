import { item_t, item_list_t } from "./../item"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { actor_create, actor_render, actor_destroy, actor_change_animation } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { IT_ENDSIGN } from "./../item"
import { find_closest_item } from "./util/itemutil"

export interface goalsign_t extends item_t {}

export const goalsign_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

const init = (item:item_t) => {
  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation("SD_GOAL", 0));
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {
  let anim;

  const endsign = find_closest_item(item, item_list, IT_ENDSIGN, null);
  if(endsign != null) {
    if(endsign.actor.position.x > item.actor.position.x)
      anim = 0;
    else
      anim = 1;
  }
  else
    anim = 0;

  actor_change_animation(item.actor, sprite_get_animation("SD_GOAL", anim));
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}
