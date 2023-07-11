import { item_t, item_list_t } from "./../item"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sound_play, sound_is_playing } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { INFINITY_FLT } from "./../../core/global"
import { bounding_box } from "./../../core/util"
import { timer_get_delta } from "./../../core/timer"
import { actor_image, actor_create, actor_render, actor_destroy, actor_change_animation, actor_animation_finished, actor_collision, actor_move } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { player_hit } from "./../player"

export interface spikes_t extends item_t {
  collision: Function,
  anim_id: number,
  timer: number,
  cycle_length: number,
  hidden: boolean
}

export const floorspikes_create = () => create(floor_strategy, 0, INFINITY_FLT)
export const ceilingspikes_create = () => create(ceiling_strategy, 2, INFINITY_FLT)
export const leftwallspikes_create = () => create(leftwall_strategy, 1, INFINITY_FLT)
export const rightwallspikes_create = () => create(rightwall_strategy, 3, INFINITY_FLT)
export const periodic_floorspikes_create = () => create(floor_strategy, 0, 5.0)
export const periodic_ceilingspikes_create = () => create(ceiling_strategy, 2, 5.0)
export const periodic_leftwallspikes_create = () => create(leftwall_strategy, 1, 5.0)
export const periodic_rightwallspikes_create = () => create(rightwall_strategy, 3, 5.0)

const create = (collision:Function, anim_id:number, cycle_length:number) => {

  const item:item_t = {
    init,
    release,
    update,
    render
  }

  const me:spikes_t = <spikes_t>item;

  me.collision = collision;
  me.anim_id = anim_id;
  me.cycle_length = cycle_length;

  return item;
}

const init = (item:item_t) => {
  const me:spikes_t = <spikes_t>item;

  item.obstacle = true;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.timer = 0.0;
  me.hidden = false;

  actor_change_animation(item.actor, sprite_get_animation("SD_SPIKES", me.anim_id));
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {
  const me:spikes_t = <spikes_t>item;
  const dt = timer_get_delta();

  // change state 
  me.timer += dt;
  if(me.timer >= me.cycle_length * 0.5) {
    me.timer = 0.0;
    me.hidden = !me.hidden;
    sound_play(soundfactory_get(
        me.hidden ? "spikes disappearing" : "spikes appearing"
      )
    );
  }
  item.obstacle = !me.hidden;
  item.actor.visible = !me.hidden;

  // spike collision 
  if(!me.hidden) {
    for(let i=0; i<team_size; i++) {
      let player = team[i];
      if (player) {
        if(!player.dying && !player.blinking && !player.invincible) {
          if(me.collision(item, player)) {
            let s = soundfactory_get("spikes hit");
            if(!sound_is_playing(s))
              sound_play(s);
            player_hit(player);
          }
        }
      }
    }
  }
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const hittest = (player:any, rect:number[]) => {
  const a = [];
  const b = [];
  const pl = player.actor;

  a[0] = pl.position.x - pl.hot_spot.x;
  a[1] = pl.position.y - pl.hot_spot.y;
  a[2] = a[0] + actor_image(pl).width;
  a[3] = a[1] + actor_image(pl).height;

  return bounding_box(a, rect);
}

const floor_strategy = (spikes:item_t, player:any) => {
  let b = [];
  let feet;
  let act = spikes.actor;

  b[0] = act.position.x - act.hot_spot.x + 5;
  b[1] = act.position.y - act.hot_spot.y - 5;
  b[2] = b[0] + actor_image(act).width - 10;
  b[3] = b[1] + 10;

  feet = player.actor.position.y - player.actor.hot_spot.y + actor_image(player.actor).height;
  return hittest(player, b) && feet < (act.position.y - act.hot_spot.y + actor_image(act).height/2);
}

const ceiling_strategy = (spikes:item_t, player:any) => {
  let b = [];
  let act = spikes.actor;

  b[0] = act.position.x - act.hot_spot.x + 5;
  b[1] = act.position.y - act.hot_spot.y + actor_image(act).height - 5;
  b[2] = b[0] + actor_image(act).width - 10;
  b[3] = b[1] + 10;

  return hittest(player, b);
}

const leftwall_strategy = (spikes:item_t, player:any) => {
  let b = [];
  let act = spikes.actor;

  b[0] = act.position.x - act.hot_spot.x + actor_image(act).width - 5;
  b[1] = act.position.y - act.hot_spot.y + 5;
  b[2] = b[0] + 10;
  b[3] = b[1] + actor_image(act).height - 10;

  return hittest(player, b);
}

const rightwall_strategy = (spikes:item_t, player:any) => {
  let b = [];
  let act = spikes.actor;

  b[0] = act.position.x - act.hot_spot.x - 5;
  b[1] = act.position.y - act.hot_spot.y + 5;
  b[2] = b[0] + 10;
  b[3] = b[1] + actor_image(act).height - 10;

  return hittest(player, b);
}


