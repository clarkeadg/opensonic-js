
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { actor_create, actor_render, actor_destroy, actor_change_animation } from "./../actor"
import { font_create, font_render, font_destroy, font_set_text } from "./../font"
import { IS_IDLE, IS_DEAD } from "./../item"

export const flyingtext_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;
  item.set_text = flyingtext_set_text;

  return item;
}

export const flyingtext_set_text = (item, text) => {
  const me = item;
  font_set_text(me.font, text);
}

const init = (item) => {
  let me = item;

  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor_create();

  me.elapsed_time = 0.0;
  me.font = font_create(0);
  font_set_text(me.font, "0");

  actor_change_animation(item.actor, sprite_get_animation("SD_RING", 0));
  item.actor.visible = false;
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = item
  const dt = timer_get_delta();

  me.elapsed_time += dt;
  if(me.elapsed_time < 0.5)
    item.actor.position.y -= 100.0 * dt;
  else if(me.elapsed_time > 2.0)
    item.state = IS_DEAD;
  me.font.position = item.actor.position;
}

const render = (item, camera_position) => {
  const me = item;
  font_render(me.font, camera_position);
}

const release = (item) => {
  const me = item;

  actor_destroy(item.actor);
  font_destroy(me.font);
}
