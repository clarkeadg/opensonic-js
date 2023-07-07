
import { sprite_get_animation } from "./../../core/sprite"
import { random } from "./../../core/util"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_animation_finished } from "./../actor"
import { IS_DEAD } from "./../item"

export const explosion_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  return item;
} 

const init = (item) => {
  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation("SD_EXPLOSION", random(2)));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  if(actor_animation_finished(item.actor))
    item.state = IS_DEAD;
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}
