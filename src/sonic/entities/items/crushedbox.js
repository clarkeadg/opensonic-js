
import { sprite_get_animation } from "./../../core/sprite"
import { actor_create, actor_render, actor_destroy, actor_change_animation } from "./../actor"

export const crushedbox_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  return item;
}

const init = (item) => {
  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation("SD_ITEMBOX", 10));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {

}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}

