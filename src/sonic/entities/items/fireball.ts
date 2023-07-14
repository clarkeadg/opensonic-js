import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t, player_hit } from "./../player"
import { v2d_t, v2d_new } from "./../../core/v2d"
import { brick_list_t, brick_t } from "./../brick"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { IF_VFLIP, IF_NONE } from "./../../core/global"
import { random } from "./../../core/util"
import { actor_create, actor_move, actor_collision, actor_particle_movement, actor_render, actor_destroy, actor_change_animation, actor_animation_finished, actor_image, actor_corners, actor_handle_clouds } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { IS_DEAD, IT_FIREBALL } from "./../item"
import { SH_FIRESHIELD } from "./../player"
import { level_gravity, level_create_item } from "./../../scenes/level"

export interface fireball_t extends item_t {
  run: Function
}

export const fireball_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

const init = (item:item_t) => {
  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor_create();

  fireball_set_behavior(item, falling_behavior);
  actor_change_animation(item.actor, sprite_get_animation("SD_FIREBALL", 0));
}

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {

  const act = item.actor;
  const me:fireball_t = <fireball_t>item;

  /* hit the player */
  for(let i=0; i<team_size; i++) {
    let player = team[i];
    if(!player.dying && actor_collision(act, player.actor)) {
      item.state = IS_DEAD;
      if(player.shield_type != SH_FIRESHIELD)
        player_hit(player);
    }
  }

  /* my behavior */
  me.run(item, brick_list);
}

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
} 

const fireball_set_behavior = (fireball:item_t, behavior:Function) => {
  const me:fireball_t = <fireball_t>fireball;
  me.run = behavior;
}

const falling_behavior = (fireball:item_t, brick_list:brick_list_t) => {
  let i, n;
  let sqrsize = 2, diff = -2;
  const act = fireball.actor;
  let down:brick_t = null;

  /* movement & animation */
  act.speed.x = 0.0;
  act.mirror = (act.speed.y < 0.0) ? IF_VFLIP : IF_NONE;
  actor_move(act, actor_particle_movement(act, level_gravity()));
  actor_change_animation(act, sprite_get_animation("SD_FIREBALL", 0));

  /* collision detection */
  actor_corners(act, sqrsize, diff, brick_list, null, null, null, null, down, null, null, null);
  actor_handle_clouds(act, diff, null, null, null, null, down, null, null, null);
  if(down) {
    /* I have just touched the ground */
    fireball_set_behavior(fireball, disappearing_behavior);
    sound_play( soundfactory_get("fire2") );

    /* create small fire balls */
    n = 2 + random(3);
    for(i=0; i<n; i++) {
      let obj = level_create_item(IT_FIREBALL, act.position);
      fireball_set_behavior(obj, smallfire_behavior);
      obj.actor.speed = v2d_new((i/n)*400.0-200.0, -120.0-random(240.0));
    }
  }
}

const disappearing_behavior = (fireball:item_t, brick_list:brick_list_t) => {
  const act = fireball.actor;

  actor_change_animation(act, sprite_get_animation("SD_FIREBALL", 1));
  if(actor_animation_finished(act))
    fireball.state = IS_DEAD;
}

const smallfire_behavior = (fireball:item_t, brick_list:brick_list_t) => {
  let sqrsize = 2, diff = -2;
  const act = fireball.actor;
  let down:brick_t = null;

  /* movement & animation */
  actor_move(act, actor_particle_movement(act, level_gravity()));
  actor_change_animation(act, sprite_get_animation("SD_FIREBALL", 2));

  /* collision detection */
  actor_corners(act, sqrsize, diff, brick_list, null, null, null, null, down, null, null, null);
  actor_handle_clouds(act, diff, null, null, null, null, down, null, null, null);
  if(down && act.speed.y > 0.0)
    fireball.state = IS_DEAD;
}


