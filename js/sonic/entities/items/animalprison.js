
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { actor_image, actor_create, actor_render, actor_destroy, actor_change_animation, actor_animation_finished, actor_pixelperfect_collision } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { random, bounding_box } from "./../../core/util"
import { v2d_new } from "./../../core/v2d"
import { IT_EXPLOSION } from "./../item"
import { level_create_item, level_create_animal, level_clear } from "./../../scenes/level" 

export const animalprison_create = () => {    
  let item = {};
  let me = item;

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  me.state = null;

  return item;
}

const init = (item) => {
  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  set_state(item, state_idle_new());
  actor_change_animation(item.actor, sprite_get_animation("SD_ENDLEVEL", 0));
}

const release = (item) => {
  actor_destroy(item.actor);
  set_state(item, null);
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = item;
  me.state.handle(me.state, item, team, team_size);
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const set_state = (item, state) => {
  let me = item;

  //if(me.state != null)
  //  free(me.state);

  me.state = state;
}

const state_idle_new = () => {
  let base = {};
  let derived = base;

  base.handle = state_idle_handle;
  derived.being_hit = false;
  derived.hit_count = 0;

  return base;
} 

const state_exploding_new = () => {
  let base = {};
  let derived = base;

  base.handle = state_exploding_handle;
  derived.explode_timer = 0.0;
  derived.break_timer = 0.0;

  return base;
}

const state_releasing_new = () => {
  let base = {};
  base.handle = state_releasing_handle;
  return base;
}

const state_broken_new = () => {
  let base = {};
  base.handle = state_broken_handle;
  return base;
}

const state_idle_handle = (state, item, team, team_size) => {
  let i;
  let s = state;
  let act = item.actor;

  for(i=0; i<team_size; i++) {
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

const state_exploding_handle = (state, item, team, team_size) => {
  let s = state;
  let act = item.actor;
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

const state_releasing_handle = (state, item, team, team_size) => {
  let act = item.actor;

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

const state_broken_handle = (state, item, team, team_size) => {
  ; /* do nothing */
}

const got_hit_by_player = (item, player) => {
  if (!item || !player) return;

  let a = [];
  let b = [];
  let act = item.actor;
  let pl = player.actor;

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
