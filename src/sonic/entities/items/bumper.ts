import { item_t, item_list_t } from "./../item"
import { v2d_t, v2d_add, v2d_subtract, v2d_multiply, v2d_normalize, v2d_magnitude } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_animation_finished, actor_pixelperfect_collision } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"

export interface bumper_t extends item_t {
  getting_hit: boolean
}

export const bumper_create = () => {
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

const init = (item:item_t) => {
  const me:bumper_t = <bumper_t>item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.getting_hit = false;
  actor_change_animation(item.actor, sprite_get_animation("SD_BUMPER", 0));
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {
  const me:bumper_t = <bumper_t>item;
  const act = item.actor;

  for(let i=0; i<team_size; i++) {
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

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

const bump = (bumper:item_t, player:any) => {
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


