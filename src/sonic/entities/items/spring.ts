import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { EPSILON } from "./../../core/global"
import { sound_play } from "./../../core/audio"
import { IF_HFLIP } from "./../../core/image"
import { soundfactory_get } from "./../../core/soundfactory"
import { sprite_get_animation } from "./../../core/sprite"
import { timer_get_delta } from "./../../core/timer"
import { v2d_new } from "./../../core/v2d"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_animation_finished, actor_pixelperfect_collision, actor_move } from "./../actor"

export interface spring_t extends item_t {
  strength: v2d_t,
  sprite_name: string,
  bang_timer: number,
  is_bumping: boolean,
  on_bump: Function
}

const SPRING_BANG_TIMER          = 0.2;

export const yellowspring_create = () =>   create(classicspring_strategy,  "SD_YELLOWSPRING",   v2d_new(0,-500))
export const tryellowspring_create = () => create(volatilespring_strategy, "SD_TRYELLOWSPRING", v2d_new(400,-600))
export const ryellowspring_create = () =>  create(volatilespring_strategy, "SD_RYELLOWSPRING",  v2d_new(600,0)) 
export const bryellowspring_create = () => create(volatilespring_strategy, "SD_BRYELLOWSPRING", v2d_new(400,600))
export const byellowspring_create = () =>  create(volatilespring_strategy, "SD_BYELLOWSPRING",  v2d_new(0,500))
export const blyellowspring_create = () => create(volatilespring_strategy, "SD_BLYELLOWSPRING", v2d_new(-400,600))
export const lyellowspring_create = () =>  create(volatilespring_strategy, "SD_LYELLOWSPRING",  v2d_new(-600,0))
export const tlyellowspring_create = () => create(volatilespring_strategy, "SD_TLYELLOWSPRING", v2d_new(-400,-600))
export const redspring_create = () =>      create(classicspring_strategy,  "SD_REDSPRING",      v2d_new(0,-750))
export const trredspring_create = () =>    create(volatilespring_strategy, "SD_TRREDSPRING",    v2d_new(800,-1000))
export const rredspring_create = () =>     create(volatilespring_strategy, "SD_RREDSPRING",     v2d_new(1200,0))
export const brredspring_create = () =>    create(volatilespring_strategy, "SD_BRREDSPRING",    v2d_new(800,1000))
export const bredspring_create = () =>     create(volatilespring_strategy, "SD_BREDSPRING",     v2d_new(0,750))
export const blredspring_create = () =>    create(volatilespring_strategy, "SD_BLREDSPRING",    v2d_new(-800,1000))
export const lredspring_create = () =>     create(volatilespring_strategy, "SD_LREDSPRING",     v2d_new(-1200,0))
export const tlredspring_create = () =>    create(volatilespring_strategy, "SD_TLREDSPRING",    v2d_new(-800,-1000))
export const bluespring_create = () =>     create(classicspring_strategy,  "SD_BLUESPRING",     v2d_new(0,-1500))
export const trbluespring_create = () =>   create(volatilespring_strategy, "SD_TRBLUESPRING",   v2d_new(1800,-1500))
export const rbluespring_create = () =>    create(volatilespring_strategy, "SD_RBLUESPRING",    v2d_new(2000,0))
export const brbluespring_create = () =>   create(volatilespring_strategy, "SD_BRBLUESPRING",   v2d_new(1800,1500))
export const bbluespring_create = () =>    create(volatilespring_strategy, "SD_BBLUESPRING",    v2d_new(0,1500))
export const blbluespring_create = () =>   create(volatilespring_strategy, "SD_BLBLUESPRING",   v2d_new(-1800,1500))
export const lbluespring_create = () =>    create(volatilespring_strategy, "SD_LBLUESPRING",    v2d_new(-2000,0))
export const tlbluespring_create = () =>   create(volatilespring_strategy, "SD_TLBLUESPRING",   v2d_new(-1800,-1500))

const create = (strategy:Function, sprite_name:string, strength:v2d_t) => {

  const item:item_t = {
    init,
    release,
    update,
    render
  }

  const me:spring_t = <spring_t>item;

  me.on_bump = strategy;
  me.sprite_name = sprite_name;
  me.strength = strength;

  return item;
}

const init = (item:item_t) => {
  const me:spring_t = <spring_t>item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_bumping = false;
  me.bang_timer = 0.0;
  actor_change_animation(item.actor, sprite_get_animation(me.sprite_name, 0));
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  const me:spring_t = <spring_t>item;
  const dt = timer_get_delta();

  // bump! 
  me.bang_timer += dt;
  for(let i=0; i<team_size; i++) {
    let player = team[i];
    if (player) {
      if(!player.dying && actor_pixelperfect_collision(player.actor, item.actor))
        me.on_bump(item, player);
    }
  }

  // restore default animation 
  if(me.is_bumping) {
    if(actor_animation_finished(item.actor)) {
      actor_change_animation(item.actor, sprite_get_animation(me.sprite_name, 0));
      me.is_bumping = false;
    }
  }
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

/* activates if you jump on it */
const classicspring_strategy = (item:item_t, player:player_t) => {
  if(player.actor.speed.y >= 1.0 && !player.actor.carrying && !player.actor.carried_by)
    activate_spring(<spring_t>item, player);
}

/* activates when touched */
const volatilespring_strategy = (item:item_t, player:player_t) => {
  activate_spring(<spring_t>item, player);
} 

const springfy_player = (player:player_t, strength:v2d_t) => {
  const dt = timer_get_delta();
  let same_signal = [];
  let different_signal = [];

  same_signal[0] = (strength.x * player.actor.speed.x >= 0.0);
  same_signal[1] = (strength.y * player.actor.speed.y >= 0.0);
  different_signal[0] = (strength.x * player.actor.speed.x <= 0.0) && (Math.abs(strength.x) > EPSILON);
  different_signal[1] = (strength.y * player.actor.speed.y <= 0.0) && (Math.abs(strength.y) > EPSILON);

  if(Math.abs(strength.y) > EPSILON)
    player.spring = true;

  player.flying = false;
  player.climbing = false;
  player.landing = false;
  player.getting_hit = false;
  player.is_fire_jumping = false;

  if(
    (Math.abs(strength.x) > Math.abs(player.actor.speed.x) && same_signal[0]) ||
    different_signal[0]
  )
    player.actor.speed.x = strength.x;

  if(
    (Math.abs(strength.y) > Math.abs(player.actor.speed.y) && same_signal[1]) ||
    different_signal[1]
  ) {
    player.actor.speed.y = strength.y;
    player.actor.position.y += player.actor.speed.y * dt; /* hack: leave the ground! */
  }
}

const activate_spring = (spring:spring_t, player:player_t) => {
  const item:item_t = <item_t>spring;

  spring.is_bumping = true;
  springfy_player(player, spring.strength);
  actor_change_animation(item.actor, sprite_get_animation(spring.sprite_name, 1));

  if(spring.strength.x > EPSILON)
    player.actor.mirror &= ~IF_HFLIP;
  else if(spring.strength.x < -EPSILON)
    player.actor.mirror |= IF_HFLIP;

  if(spring.bang_timer > SPRING_BANG_TIMER) {
    sound_play( soundfactory_get("spring") );
    spring.bang_timer = 0.0;
  }
} 
