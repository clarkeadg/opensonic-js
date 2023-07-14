import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { find_closest_item } from "./util/itemutil"
import { IT_LOOPFLOORTOP } from "./../item"
import { PLAYER_WALL_NONE, PLAYER_WALL_TOP, PLAYER_WALL_RIGHT, PLAYER_WALL_BOTTOM, PLAYER_WALL_LEFT } from "./../player"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_collision } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"

export interface loop_t extends item_t {
  sprite_name: string,
  on_collision: Function
}

export const loopright_create = () => create(loopright_strategy, "SD_LOOPRIGHT")
export const looptop_create = () =>  create(looptop_strategy, "SD_LOOPMIDDLE")
export const loopleft_create = () => create(loopleft_strategy, "SD_LOOPLEFT")
export const loopnone_create = () => create(loopnone_strategy, "SD_LOOPNONE")
export const loopfloor_create = () => create(loopfloor_strategy, "SD_LOOPFLOOR")
export const loopfloornone_create = () => create(loopfloornone_strategy, "SD_LOOPFLOORNONE")
export const loopfloortop_create = () => create(loopfloortop_strategy, "SD_LOOPFLOORTOP")

const create = (strategy:Function, sprite_name:string) => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  const me:loop_t = <loop_t>item;

  me.on_collision = strategy;
  me.sprite_name = sprite_name;

  return item;
}

const init = (item:item_t) => {
  const me:loop_t = <loop_t>item;

  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = true;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation(me.sprite_name, 0));
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
} 

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  const me:loop_t = <loop_t>item;
  const act = item.actor;

  //console.log('LOOP UPDATE')

  //act.visible = level_editmode();
  act.visible = false;
  for(let i=0; i<team_size; i++) {
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

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const is_player_at_closest_loopfloortop = (item:item_t, item_list:item_list_t, player:player_t) => {
  let obj = find_closest_item(item, item_list, IT_LOOPFLOORTOP, null);
  return (obj != null) ? actor_collision(player.actor, obj.actor) : false;
}

const loopright_strategy = (player:player_t) => {
  //console.log('loopright_strategy')
  player.disable_wall |= PLAYER_WALL_LEFT;
  player.entering_loop = true;
  player.bring_to_back = false;
}

const looptop_strategy = (player:player_t) => {
  //console.log('looptop_strategy')
  if(!player.flying) {
    let b = (player.actor.speed.x > 0);
    player.disable_wall &= ~(PLAYER_WALL_LEFT | PLAYER_WALL_RIGHT);
    player.disable_wall |= b ? PLAYER_WALL_RIGHT : PLAYER_WALL_LEFT;
    player.bring_to_back = b;
  }
}

const loopleft_strategy = (player:player_t) => {
 // console.log('loopleft_strategy')
  player.disable_wall |= PLAYER_WALL_RIGHT;
  player.entering_loop = true;
  player.bring_to_back = true;
}

const loopnone_strategy = (player:player_t) => {
  //console.log('loopnone_strategy')
  if(!player.entering_loop) {
    player.disable_wall = PLAYER_WALL_NONE;
    player.bring_to_back = false;
  }
}

const loopfloor_strategy = (player:player_t) => {
  //console.log('loopfloor_strategy')
  if(!player.at_loopfloortop && !player.flying) {
    player.disable_wall |= PLAYER_WALL_BOTTOM;
    player.entering_loop = true;
    player.bring_to_back = true;
  }
}

const loopfloornone_strategy = (player:player_t) => {
  //console.log('loopfloornone_strategy')
  if(!player.at_loopfloortop && !player.entering_loop && !player.flying) {
   // console.log('111111')
    player.disable_wall &= ~PLAYER_WALL_BOTTOM;
    player.bring_to_back = false;
  }
}

const loopfloortop_strategy = (player:player_t) => {
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
