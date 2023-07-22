import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { actor_create, actor_destroy, actor_change_animation } from "./../actor"
import { font_t, font_create, font_render, font_destroy, font_set_text } from "./../font"
import { IS_DEAD } from "./../item"

export interface flyingtext_t extends item_t {
  font: font_t,
  elapsed_time: 0.0
}

export const flyingtext_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

export const flyingtext_set_text = (item:item_t, text:string) => {
  const me:flyingtext_t = <flyingtext_t>item;
  font_set_text(me.font, text);
}

const init = (item:item_t) => {
  const me:flyingtext_t = <flyingtext_t>item;

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

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  const me:flyingtext_t = <flyingtext_t>item;
  const dt = timer_get_delta();

  me.elapsed_time += dt;
  if(me.elapsed_time < 0.5)
    item.actor.position.y -= 100.0 * dt;
  else if(me.elapsed_time > 2.0)
    item.state = IS_DEAD;
  me.font.position = item.actor.position;
}

const render = (item:item_t, camera_position:v2d_t) => {
  const me:flyingtext_t = <flyingtext_t>item;
  font_render(me.font, camera_position);
}

const release = (item:item_t) => {
  const me:flyingtext_t = <flyingtext_t>item;

  actor_destroy(item.actor);
  font_destroy(me.font);
}
