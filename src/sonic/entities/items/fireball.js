
import { IF_VFLIP, IF_NONE } from "./../../core/global"
import { random } from "./../../core/util"
import { v2d_new } from "./../../core/v2d"
import { actor_create, actor_move, actor_collision, actor_particle_movement, actor_render, actor_destroy, actor_change_animation, actor_animation_finished, actor_image, actor_corners, actor_handle_clouds } from "./../actor"
import { sprite_get_animation } from "./../../core/sprite"
import { IS_DEAD, IT_FIREBALL } from "./../item"
import { SH_FIRESHIELD } from "./../player"
import { level_gravity } from "./../../scenes/level"

export const fireball_create = () => {
  let item = {};

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  return item;
}

const init = (item) => {
  item.obstacle = false;
  item.bring_to_back = false;
  item.preserve = false;
  item.actor = actor_create();

  fireball_set_behavior(item, falling_behavior);
  actor_change_animation(item.actor, sprite_get_animation("SD_FIREBALL", 0));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let i;
  let act = item.actor;
  let me = item;

  /* hit the player */
  for(i=0; i<team_size; i++) {
    let player = team[i];
    if(!player.dying && actor_collision(act, player.actor)) {
      item.state = IS_DEAD;
      if(player.shield_type != SH_FIRESHIELD)
        player.hit(player);
    }
  }

  /* my behavior */
  me.run(item, brick_list);
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
} 

const fireball_set_behavior = (fireball, behavior) => {
  let me = fireball;
  me.run = behavior;
}

const falling_behavior = (fireball, brick_list) => {
  let i, n;
  let sqrsize = 2, diff = -2;
  let act = fireball.actor;
  let down;

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
      obj.actor_speed = v2d_new((i/n)*400.0-200.0, -120.0-util.random(240.0));
    }
  }
}

const disappearing_behavior = (fireball, brick_list) => {
  let act = fireball.actor;

  actor_change_animation(act, sprite_get_animation("SD_FIREBALL", 1));
  if(actor_animation_finished(act))
    fireball.state = IS_DEAD;
}

const smallfire_behavior = (fireball, brick_list) => {
  let sqrsize = 2, diff = -2;
  let act = fireball.actor;
  let down;

  /* movement & animation */
  actor_move(act, actor_particle_movement(act, level_gravity()));
  actor_change_animation(act, sprit_get_animation("SD_FIREBALL", 2));

  /* collision detection */
  actor_corners(act, sqrsize, diff, brick_list, null, null, null, null, down, null, null, null);
  actor_handle_clouds(act, diff, null, null, null, null, down, null, null, null);
  if(down && act.speed.y > 0.0)
    fireball.state = IS_DEAD;
}


