import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { sprite_get_animation } from "./../../core/sprite"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_collision } from "./../actor"
import { IS_DEAD } from "./../item"
import { player_set_rings, player_get_rings } from "./../player"
import { level_add_to_secret_bonus, level_call_dialogbox } from "./../../scenes/level"
import { quest_setvalue, quest_getvalue, QUESTVALUE_BIGRINGS } from "./../../scenes/quest"

export interface bigring_t extends item_t {}

export const bigring_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

const init = (item:item_t) => {
  let me = item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation("SD_BLUERING", 0));
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  for(let i=0; i<team_size; i++) {
    let player = team[i];
    if(player && !player.dying && actor_collision(player.actor, item.actor)) {
      item.state = IS_DEAD;
      player_set_rings( player_get_rings() + 50 );
      level_add_to_secret_bonus(5000);
      sound_play( soundfactory_get("big ring") );
      level_call_dialogbox("$BONUSMSG_TITLE", "$BONUSMSG_TEXT");
      quest_setvalue(QUESTVALUE_BIGRINGS, quest_getvalue(QUESTVALUE_BIGRINGS) + 1);
    }
  }
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}
