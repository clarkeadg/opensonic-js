
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_pixelperfect_collision } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { v2d_add, v2d_subtract, v2d_multiply, v2d_normalize } from "./../../core/v2d"

export const bumper_create = () => {
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

  me.getting_hit = false;
  actor_change_animation(item.actor, sprite_get_animation("SD_BUMPER", 0));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let me = item;
  let act = item.actor;
  let i;

  for(i=0; i<team_size; i++) {
    let player = team[i];
    if (player){
      if(!player.dying && actor_pixelperfect_collision(player.actor, act)) {
        if(!me.getting_hit) {
          me.getting_hit = true;
          actor_change_animation(act, sprite_get_animation("SD_BUMPER", 1));
          sound_play( soundfactory_get("bumper") );
          bump(item, player);
        }
      }
    }
  }

  if(me.getting_hit) {
    if(actor_animation_finished(act)) {
      me.getting_hit = false;
      actor_change_animation(act, sprite_get_animation("SD_BUMPER", 0));
    }
  }
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}

const bump = (bumper, player) => {
  /* law of conservation of linear momentum */
  const ec = 1.0; /* (coefficient of restitution == 1.0) => elastic collision */
  const mass_player = 1.0;
  const mass_bumper = 10000.0;
  const mass_ratio = mass_bumper / mass_player;
  let v0, approximation_speed, separation_speed;
  let act = bumper.actor;

  v0 = player.actor_speed; /* initial speed of the player */
  v0.x = (v0.x < 0) ? Math.min(-300, v0.x) : Math.max(300, v0.x);

  approximation_speed = v2d_multiply(
    v2d_normalize(
      v2d_subtract(act.position, player.actor_position)
    ),
    v2d_magnitude(v0)
  );

  separation_speed = v2d_multiply(approximation_speed, ec);

  player.actor_speed = v2d_multiply(
    v2d_add(
      v0,
      v2d_multiply(separation_speed, -mass_ratio)
    ),
    1.0/ (mass_ratio + 1.0)
  );

  act.speed = v2d_multiply(
    v2d_add(v0, separation_speed),
    1.0 / (mass_ratio + 1.0)
  );

  /* cute stuff */
  player.flying = false;
  player.landing = false;
  player.climbing = false;
  player.spring = false;
}


