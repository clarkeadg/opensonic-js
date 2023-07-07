
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { bounding_box } from "./../../core/util"
import { actor_create, actor_render, actor_destroy, actor_pixelperfect_collision, actor_change_animation, actor_image } from "./../actor"
import { IS_IDLE, IS_DEAD } from "./../item"
import { PL_SONIC, PL_TAILS, PL_KNUCKLES } from "./../../entities/player" 

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

const dnadoor_create = (authorized_player_type, is_vertical_door) => {
  let item = {};
  let me = item;

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  me.authorized_player_type = authorized_player_type;
  me.is_vertical_door = is_vertical_door;

  return item;
}

const init = (item) => {
  let me = item;
  let sprite_name;
  let anim_id;

  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = true;
  item.actor = actor_create();

  anim_id = parseInt(me.authorized_player_type,10);
  sprite_name = me.is_vertical_door ? "SD_DNADOOR" : "SD_HORIZONTALDNADOOR";
  actor_change_animation(item.actor, sprite_get_animation(sprite_name, anim_id));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = {};
  let act = item.actor;
  let it;
  let block_anyway = false;
  let perfect_collision = false;
  const dt = timer_get_delta();
  let a = [];
  let b = [];
  let diff = 5;
  let i;

  /* should we block the DNA Door? */
  item.obstacle = true;
  for(i=0; i<team_size; i++) {
    let player = team[i];
    if (player) {
      if(!player.dying && !player.actor_carrying && !player.actor_carried_by && hittest(player, item)) {
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
        b[0] = it.data.actor_position.x - it.data.actor_hot_spot.x - diff;
        b[1] = it.data.actor_position.y - it.data.actor_hot_spot.y - diff;
        b[2] = b[0] + actor_image(it.data.actor).width + 2*diff;
        b[3] = b[1] + actor_image(it.data.actor).height + 2*diff;
        if(bounding_box(a,b)) {
          if(it.data.actor_alpha < act.alpha)
            act.alpha = it.data.actor_alpha;
          else
            it.data.actor_alpha = act.alpha;
        }
      }
    }
  }
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}

const hittest = (player, dnadoor) => {
  let a = [];
  let b = [];
  let offset = 3;
  let pl = player.actor;
  let act = dnadoor.actor;

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


