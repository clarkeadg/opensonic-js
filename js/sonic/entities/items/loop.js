
import { find_closest_item } from "./util/itemutil"
import { IT_LOOPFLOORTOP } from "./../item"
import { PLAYER_WALL_NONE, PLAYER_WALL_TOP, PLAYER_WALL_RIGHT, PLAYER_WALL_BOTTOM, PLAYER_WALL_LEFT } from "./../player"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_collision } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"

export const loopright_create = () => create(loopright_strategy, "SD_LOOPRIGHT")
export const looptop_create = () =>  create(looptop_strategy, "SD_LOOPMIDDLE")
export const loopleft_create = () => create(loopleft_strategy, "SD_LOOPLEFT")
export const loopnone_create = () => create(loopnone_strategy, "SD_LOOPNONE")
export const loopfloor_create = () => create(loopfloor_strategy, "SD_LOOPFLOOR")
export const loopfloornone_create = () => create(loopfloornone_strategy, "SD_LOOPFLOORNONE")
export const loopfloortop_create = () => create(loopfloortop_strategy, "SD_LOOPFLOORTOP")

const create = (strategy, sprite_name) => {
  let item = {};
  let me = item;

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  me.on_collision = strategy;
  me.sprite_name = sprite_name;

  return item;
}

const init = (item) => {
  let me = item;

  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = true;
  item.actor = actor_create();

  item.actor = actor_change_animation(item.actor, sprite_get_animation(me.sprite_name, 0));
}

const release = (item) => {
  //var me = item;
  //free(me.sprite_name);
  //actor.destroy(item.actor);
} 

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = item;
  let act = item.actor;
  let i;

  //console.log('LOOP UPDATE')

  //act.visible = level_editmode();
  act.visible = false;
  for(i=0; i<team_size; i++) {
    let player = team[i];
    if (player) {
      if(actor_collision(act, player.actor)) {
        //console.log('LOOP COLLISION')
        player.at_loopfloortop = is_player_at_closest_loopfloortop(item, item_list, player);
        me.on_collision(player);
      }
    }
  }
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const is_player_at_closest_loopfloortop = (item, item_list, player) => {
  let obj = find_closest_item(item, item_list, IT_LOOPFLOORTOP, null);
  return (obj != null) ? actor_collision(player.actor, obj.actor) : false;
}

const loopright_strategy = (player) => {
  //console.log('loopright_strategy')
  player.disable_wall |= PLAYER_WALL_LEFT;
  player.entering_loop = true;
  player.bring_to_back = false;
}

const looptop_strategy = (player) => {
  //console.log('looptop_strategy')
  if(!player.flying) {
    let b = (player.actor.speed.x > 0);
    player.disable_wall &= ~(PLAYER_WALL_LEFT | PLAYER_WALL_RIGHT);
    player.disable_wall |= b ? PLAYER_WALL_RIGHT : PLAYER_WALL_LEFT;
    player.bring_to_back = b;
  }
}

const loopleft_strategy = (player) => {
 // console.log('loopleft_strategy')
  player.disable_wall |= PLAYER_WALL_RIGHT;
  player.entering_loop = true;
  player.bring_to_back = true;
}

const loopnone_strategy = (player) => {
  //console.log('loopnone_strategy')
  if(!player.entering_loop) {
    player.disable_wall = PLAYER_WALL_NONE;
    player.bring_to_back = false;
  }
}

const loopfloor_strategy = (player) => {
  //console.log('loopfloor_strategy')
  if(!player.at_loopfloortop && !player.flying) {
    player.disable_wall |= PLAYER_WALL_BOTTOM;
    player.entering_loop = true;
    player.bring_to_back = true;
  }
}

const loopfloornone_strategy = (player) => {
  //console.log('loopfloornone_strategy')
  if(!player.at_loopfloortop && !player.entering_loop && !player.flying) {
   // console.log('111111')
    player.disable_wall &= ~PLAYER_WALL_BOTTOM;
    player.bring_to_back = false;
  }
}

const loopfloortop_strategy = (player) => {
  //console.log('loopfloortop_strategy')
  if(!player.flying) {
    if(player.disable_wall & PLAYER_WALL_BOTTOM) {
      /* behave like looptop */
      let b = (player.actor.speed.x > 0.0);
      player.disable_wall &= ~(PLAYER_WALL_LEFT | PLAYER_WALL_RIGHT);
      player.disable_wall |= b ? PLAYER_WALL_RIGHT : PLAYER_WALL_LEFT;
      player.bring_to_back = true;
    }
    else {
      /* lock the left & right walls (only the floor will be disabled) */
      player.disable_wall &= ~(PLAYER_WALL_LEFT | PLAYER_WALL_RIGHT);
      player.bring_to_back = true;
    }
  }
}  


