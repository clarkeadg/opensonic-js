
import { item_t, item_list_t } from "./../item"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sprite_get_animation } from "./../../core/sprite"
import { actor_create, actor_render, actor_destroy, actor_change_animation } from "./../actor"

export interface crushedbox_t extends item_t {}

export const crushedbox_create = () => {
   
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

const init = (item:item_t) => {
  //const me:crushedbox_t = <crushedbox_t>item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation("SD_ITEMBOX", 10));
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {

}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

