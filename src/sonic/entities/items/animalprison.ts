import { item_t, item_list_t } from "./../item"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { actor_image, actor_create, actor_render, actor_destroy, actor_change_animation, actor_animation_finished, actor_pixelperfect_collision } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { random, bounding_box } from "./../../core/util"
import { v2d_new } from "./../../core/v2d"
import { IT_EXPLOSION } from "./../item"
import { level_create_item, level_create_animal, level_clear } from "./../../scenes/level"

/* Basic state (abstract) */
export interface state_t {
  handle: Function
}

/* Idle state: waiting to be hit... */
export interface state_idle_t extends state_t {
  being_hit: boolean,
  hit_count: number
}

/* After the animal prison got hit a few times, it explodes for a little while */
export interface state_exploding_t extends state_t {
  explode_timer: number,
  break_timer: number
}

/* After it explodes, it must release the little animals ;) */
export interface state_releasing_t extends state_t {}

/* This is finally broken */
export interface state_broken_t extends state_t {}

/* animalprison class */
export interface animalprison_t extends item_t {
  state: any
}

export const animalprison_create = () => {    

  const item:item_t = {
    init,
    release,
    update,
    render
  }

  const me:animalprison_t = <animalprison_t>item;

  me.state = null;

  return item;
}

const init = (item:item_t) => {
  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  set_state(item, state_idle_new());
  actor_change_animation(item.actor, sprite_get_animation("SD_ENDLEVEL", 0));
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
  set_state(item, null);
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {
  const me:animalprison_t = <animalprison_t>item;
  me.state.handle(me.state, item, team, team_size);
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const set_state = (item:item_t, state:state_t,) => {
  const me:animalprison_t = <animalprison_t>item;

  //if(me.state != null)
  //  free(me.state);

  me.state = state;
}

const state_idle_new = () => {
  const base:state_t = {
    handle: state_idle_handle
  };
  const derived:state_idle_t = <state_idle_t>base;

  derived.being_hit = false;
  derived.hit_count = 0;

  return base;
} 

const state_exploding_new = () => {
  const base:state_t = {
    handle: state_exploding_handle
  };
  const derived:state_exploding_t = <state_exploding_t>base;

  base.handle = state_exploding_handle;
  derived.explode_timer = 0.0;
  derived.break_timer = 0.0;

  return base;
}

const state_releasing_new = () => {
  const base:state_t = {
    handle: state_releasing_handle
  };
  return base;
}

const state_broken_new = () => {
  const base:state_t = {
    handle: state_broken_handle
  };
  return base;
}

const state_idle_handle = (state:state_t, item:item_t, team:any, team_size:number) => {
  const s:state_idle_t = <state_idle_t>state;
  const act = item.actor;

  for(let i=0; i<team_size; i++) {
    let player = team[i];
    if(got_hit_by_player(item, player) && !s.being_hit) {
      /* oh no! the player is attacking this object! */
      s.being_hit = true;
      actor_change_animation(act, sprite_get_animation("SD_ENDLEVEL", 1));
      sound_play( soundfactory_get("boss hit") );
      player.bounce(player);
      player.actor.speed.x *= -0.5;

      if(++(s.hit_count) >= 3) /* 3 hits and you're done */
        set_state(item, state_exploding_new());
    }
  }

  /* after getting hit, restore the animation */
  if(actor_animation_finished(act) && s.being_hit) {
    actor_change_animation(act, sprite_get_animation("SD_ENDLEVEL", 0));
    s.being_hit = false;
  }
}

const state_exploding_handle = (state:state_t, item:item_t, team:any, team_size:number) => {
  const s:state_exploding_t = <state_exploding_t>state;
  const act = item.actor;
  const dt = timer_get_delta();

  s.explode_timer += dt;
  s.break_timer += dt;

  /* keep exploding for a while... */
  if(s.explode_timer >= 0.1) {
    let pos = v2d_new(
      act.position.x - act.hot_spot.x + random(actor_image(act).width),
      act.position.y - act.hot_spot.y + random(actor_image(act).height/2)
    );
    level_create_item(IT_EXPLOSION, pos);
    sound_play( soundfactory_get("explode") );

    s.explode_timer = 0.0;
  }

  /* okay, I can't explode anymore */
  if(s.break_timer >= 2.0)
    set_state(item, state_releasing_new());
}

const state_releasing_handle = (state:state_t, item:item_t, team:any, team_size:number) => {
  const act = item.actor;

  /* release the animals! */
  for(let i=0; i<20; i++) {
    let pos = v2d_new(
      act.position.x - act.hot_spot.x + random(actor_image(act).width),
      act.position.y - act.hot_spot.y + random(actor_image(act).height/2)
    );
    level_create_animal(pos);
  }

  /* congratulations! you have just cleared the level! */
  level_clear(act);

  /* sayonara bye bye */
  actor_change_animation(act, sprite_get_animation("SD_ENDLEVEL", 2));
  set_state(item, state_broken_new());
}

const state_broken_handle = (state:state_t, item:item_t, team:any, team_size:number) => {
  ; /* do nothing */
}

const got_hit_by_player = (item:item_t, player:any) => {
  if (!item || !player) return;

  const a = [];
  const b = [];
  const act = item.actor;
  const pl = player.actor;

  a[0] = pl.position.x - pl.hot_spot.x;
  a[1] = pl.position.y - pl.hot_spot.y;
  a[2] = a[0] + actor_image(pl).width;
  a[3] = a[1] + actor_image(pl).height;

  b[0] = act.position.x - act.hot_spot.x + 5;
  b[1] = act.position.y - act.hot_spot.y;
  b[2] = b[0] + actor_image(act).width - 10;
  b[3] = b[1] + actor_image(act).height/2;

  return (player.attacking(player) && bounding_box(a,b) && actor_pixelperfect_collision(act,pl));
}
