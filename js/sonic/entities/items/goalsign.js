
import { actor_create, actor_render, actor_destroy, actor_change_animation } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { IT_ENDSIGN } from "./../item"
import { find_closest_item } from "./util/itemutil"

export const goalsign_create = () => {
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

  actor_change_animation(item.actor, sprite_get_animation("SD_GOAL", 0));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
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

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}
