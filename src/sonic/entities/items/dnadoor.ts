import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { bounding_box } from "./../../core/util"
import { actor_create, actor_render, actor_destroy, actor_pixelperfect_collision, actor_change_animation, actor_image } from "./../actor"
import { PL_SONIC, PL_TAILS, PL_KNUCKLES } from "./../../entities/player"

export interface dnadoor_t extends item_t {
  authorized_player_type: number,
  is_vertical_door: boolean
}

export const surge_dnadoor_create = () => {
  return dnadoor_create(PL_SONIC, true);
}

export const neon_dnadoor_create = () => {
  return dnadoor_create(PL_TAILS, true);
}

export const charge_dnadoor_create = () => {
  return dnadoor_create(PL_KNUCKLES, true);
}

export const surge_horizontal_dnadoor_create = () => {
  return dnadoor_create(PL_SONIC, false);
}

export const neon_horizontal_dnadoor_create = () => {
  return dnadoor_create(PL_TAILS, false);
}

export const charge_horizontal_dnadoor_create = () => {
  return dnadoor_create(PL_KNUCKLES, false);
} 

const dnadoor_create = (authorized_player_type:number, is_vertical_door:boolean) => { 

  const item:item_t = {
    init,
    release,
    update,
    render
  }

  const me:dnadoor_t = <dnadoor_t>item;

  me.authorized_player_type = authorized_player_type;
  me.is_vertical_door = is_vertical_door;

  return item;
}

const init = (item:item_t) => {
  const me:dnadoor_t = <dnadoor_t>item;
  let sprite_name;
  let anim_id;

  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = true;
  item.actor = actor_create();

  anim_id = me.authorized_player_type;
  sprite_name = me.is_vertical_door ? "SD_DNADOOR" : "SD_HORIZONTALDNADOOR";
  actor_change_animation(item.actor, sprite_get_animation(sprite_name, anim_id));
}

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  const me:dnadoor_t = <dnadoor_t>item;
  const act = item.actor;
  let it;
  let block_anyway = false;
  let perfect_collision = false;
  const dt = timer_get_delta();
  let a = [];
  let b = [];
  let diff = 5;

  /* should we block the DNA Door? */
  item.obstacle = true;
  for(let i=0; i<team_size; i++) {
    let player = team[i];
    if (player) {
      if(!player.dying && !player.actor.carrying && !player.actor.carried_by && hittest(player, item)) {
        if(player.type == me.authorized_player_type) {
          item.obstacle = false;
          perfect_collision = actor_pixelperfect_collision(act, player.actor);
        }
        else
          block_anyway = true;
      }
    }
  }
  if(block_anyway)
    item.obstacle = true;

  /* cute effect */
  if(item.obstacle)
    act.alpha = Math.min(1.0, act.alpha + 2.0 * dt);
  else if(perfect_collision)
    act.alpha = Math.max(0.4, act.alpha - 2.0 * dt);

  /* cute effect propagation */
  if(perfect_collision) {
    a[0] = act.position.x - act.hot_spot.x - diff;
    a[1] = act.position.y - act.hot_spot.y - diff;
    a[2] = a[0] + actor_image(act).width + 2*diff;
    a[3] = a[1] + actor_image(act).height + 2*diff;
    for(it = item_list; it != null; it = it.next) {
      if(it.data.type == item.type) {
        b[0] = it.data.actor.position.x - it.data.actor.hot_spot.x - diff;
        b[1] = it.data.actor.position.y - it.data.actor.hot_spot.y - diff;
        b[2] = b[0] + actor_image(it.data.actor).width + 2*diff;
        b[3] = b[1] + actor_image(it.data.actor).height + 2*diff;
        if(bounding_box(a,b)) {
          if(it.data.actor.alpha < act.alpha)
            act.alpha = it.data.actor.alpha;
          else
            it.data.actor.alpha = act.alpha;
        }
      }
    }
  }
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

const hittest = (player:player_t, dnadoor:item_t) => {
  const a = [];
  const b = [];
  const offset = 3;
  const pl = player.actor;
  const act = dnadoor.actor;

  a[0] = pl.position.x - pl.hot_spot.x;
  a[1] = pl.position.y - pl.hot_spot.y;
  a[2] = a[0] + actor_image(pl).width;
  a[3] = a[1] + actor_image(pl).height;

  b[0] = act.position.x - act.hot_spot.x;
  b[1] = act.position.y - act.hot_spot.y - offset;
  b[2] = b[0] + actor_image(act).width;
  b[3] = b[1] + actor_image(act).height + offset;

  return bounding_box(a, b);
}
