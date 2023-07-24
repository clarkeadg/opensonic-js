import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { actor_create, actor_move, actor_platform_movement, actor_render, actor_destroy, actor_change_animation, actor_corners, actor_handle_clouds } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { random } from "./../../core/util"
import { input_create_computer, input_simulate_button_down, IB_FIRE1 } from "./../../core/input"
import { EPSILON } from "./../../core/global"
import { IF_NONE, IF_HFLIP } from "./../../core/image"
import { IS_DEAD } from "./../item"
import { level_gravity } from "./../../scenes/level"

export interface animal_t extends item_t {
  animal_id: number,
  is_running: boolean
}

const MAX_ANIMALS                = 12;

export const animal_create = () => {

  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

const init = (item:item_t) => {
  const me:animal_t = <animal_t>item;

  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor_create();
  item.actor.maxspeed = 145 + (random(21));
  item.actor.input = input_create_computer();

  me.is_running = false;
  me.animal_id = random(MAX_ANIMALS);
  actor_change_animation(item.actor, sprite_get_animation("SD_ANIMAL", 0));
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  const me:animal_t = <animal_t>item;
  const act = item.actor;
  let up, down, left, right;
  let upright, downright, downleft, upleft;
  let sqrsize = 2, diff = -2;
  let animation_id = 2*me.animal_id + (me.is_running?1:0);

  input_simulate_button_down(act.input, IB_FIRE1);
  act.jump_strength = (200 + random(50)) * 1.3;

  if(act.speed.x > EPSILON) {
    act.speed.x = act.maxspeed;
    act.mirror = IF_NONE;
  }
  else if(act.speed.x < -EPSILON) {
    act.speed.x = -act.maxspeed;
    act.mirror = IF_HFLIP;
  }

  actor_change_animation(act, sprite_get_animation("SD_ANIMAL", animation_id));
  const corners = actor_corners(act, sqrsize, diff, brick_list, up, null, right, null, down, null, left, null);
  up = corners.up;
  upright = corners.upright;
  right = corners.right;
  downright = corners.downright;
  down = corners.down; 
  downleft = corners.downleft;
  left = corners.left;
  upleft = corners.upleft;

  const corners2 = actor_handle_clouds(act, diff, up, null, right, null, down, null, left, null);
  up = corners2.up;
  upright = corners2.upright;
  right = corners2.right;
  downright = corners2.downright;
  down = corners2.down; 
  downleft = corners2.downleft;
  left = corners2.left;
  upleft = corners2.upleft;

  if(down && !me.is_running) {
    me.is_running = true;
    act.speed.x = (random(2)?-1:1) * act.maxspeed;
  }

  if(left && !up)
    act.speed.x = act.maxspeed;

  if(right && !up)
    act.speed.x = -act.maxspeed;

  if(!me.is_running && ((down && up) || (left && right)))
    item.state = IS_DEAD; // i'm stuck! 

  actor_move(act, actor_platform_movement(act, brick_list, level_gravity()));
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}
