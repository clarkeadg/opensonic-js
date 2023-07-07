
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { sprite_get_animation } from "./../../core/sprite"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_collision } from "./../actor"
import { IS_DEAD } from "./../item"
import { player_set_rings, player_get_rings } from "./../player"
import { level_add_to_secret_bonus, level_call_dialogbox } from "./../../scenes/level"
import { quest_setvalue, quest_getvalue, QUESTVALUE_BIGRINGS } from "./../../scenes/quest"

export const bigring_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  return item;
}

const init = (item) => {
  let me = item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_disappearing = false;
  actor_change_animation(item.actor, sprite_get_animation("SD_BLUERING", 0));
}

const release = (item) => {
  actor_destroy(item.actor);
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let i;

  for(i=0; i<team_size; i++) {
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

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}
