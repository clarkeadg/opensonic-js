
import {
  IS_IDLE,
  IS_DEAD,
  IT_ICON,
  IT_EXPLOSION,
  IT_CRUSHEDBOX
} from "./../item"

import {
  SH_NONE,
  SH_SHIELD,
  SH_FIRESHIELD,
  SH_THUNDERSHIELD,
  SH_WATERSHIELD,
  SH_ACIDSHIELD,
  SH_WINDSHIELD
} from "./../player"

import { v2d_add, v2d_new } from "./../../core/v2d"
import { sprite_get_animation } from "./../../core/sprite"
import { sound_play, music_play, music_load } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { level_add_to_score, level_create_item, level_player_id, level_override_music } from "./../../scenes/level"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_collision } from "./../actor"
import { player_set_lives, player_get_lives, player_set_rings, player_get_rings, player_attacking } from "./../player"

export const lifebox_create = () => {
  return itembox_create(lifebox_strategy, 0);
}

export const ringbox_create = () => {
  return itembox_create(ringbox_strategy, 3);
}

export const starbox_create = () => {
  return itembox_create(starbox_strategy, 4);
}

export const speedbox_create = () => {
  return itembox_create(speedbox_strategy, 5);
}

export const glassesbox_create = () => {
  return itembox_create(glassesbox_strategy, 6);
}

export const shieldbox_create = () => {
  return itembox_create(shieldbox_strategy, 7);
}

export const trapbox_create = () => {
  return itembox_create(trapbox_strategy, 8);
}

export const emptybox_create = () => {
  return itembox_create(emptybox_strategy, 9);
}

export const fireshieldbox_create = () => {
  return itembox_create(fireshieldbox_strategy, 11);
}

export const thundershieldbox_create = () => {
  return itembox_create(thundershieldbox_strategy, 12);
}

export const watershieldbox_create = () => {
  return itembox_create(watershieldbox_strategy, 13);
}

export const acidshieldbox_create = () => {
   return itembox_create(acidshieldbox_strategy, 14);
}

export const windshieldbox_create = () => {
  return itembox_create(windshieldbox_strategy, 15);
}

const lifebox_strategy = (item, player) => {
  level_add_to_score(100);
  player_set_lives( player_get_lives()+1 );
  level_override_music( soundfactory_get("1up") );
}

const ringbox_strategy = (item, player) => {
  level_add_to_score(100);
  player_set_rings( player_get_rings()+10 );
  sound_play( soundfactory_get("ring") );
}

const starbox_strategy = (item, player) => {
  level_add_to_score(100);
  player.invincible = true;
  player.invtimer = 0;
  music_play( music_load("data/music/invincible.mp4"), 0 );
}

const speedbox_strategy = (item, player) => {
  level_add_to_score(100);
  player.got_speedshoes = true;
  player.speedshoes_timer = 0;
  music_play( music_load("data/music/speed.mp4"), 0 );
}

const glassesbox_strategy = (item, player) => {
  level_add_to_score(100);
  player.got_glasses = true;
}

const shieldbox_strategy = (item, player) => {
  level_add_to_score(100);
  player.shield_type = SH_SHIELD;
  sound_play( soundfactory_get("shield") );
}

const fireshieldbox_strategy = (item, player) => {
  level_add_to_score(100);
  player.shield_type = SH_FIRESHIELD;
  sound_play( soundfactory_get("fire shield") );
}

const thundershieldbox_strategy = (item, player) => {
  level_add_to_score(100);
  player.shield_type = SH_THUNDERSHIELD;
  sound_play( soundfactory_get("thunder shield") );
}

const watershieldbox_strategy = (item, player) => {
  level_add_to_score(100);
  player.shield_type = SH_WATERSHIELD;
  sound_play( soundfactory_get("water shield") );
}

const acidshieldbox_strategy = (item, player) => {
  level_add_to_score(100);
  player.shield_type = SH_ACIDSHIELD;
  sound_play( soundfactory_get("acid shield") );
}

const windshieldbox_strategy = (item, player) => {
  level_add_to_score(100);
  player.shield_type = SH_WINDSHIELD;
  audio.sound_play( soundfactory_get("wind shield") );
}

const trapbox_strategy = (item, player) => {
  player_hit(player);
}

const emptybox_strategy = (item, player) => {
  level_add_to_score(100);
} 

const itembox_create = (on_destroy, anim_id) => {
  let item = {};
  let me = item;

  item.init = init;
  item.release = release;
  item.update = update;
  item.render = render;

  me.on_destroy = on_destroy;
  me.anim_id = anim_id;

  return item;
}

const init = (item) => {
  let me = item;

  item.obstacle = true;
  item.bring_to_back = false;
  item.preserve = true;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation("SD_ITEMBOX", me.anim_id));
}

const update = (item, team, team_size, brick_list, item_list, enemy_list) => {
  let i;
  let act = item.actor;
  let me = item;

  for(i=0; i<team_size; i++) {
    let player = team[i];
    if (player) {
      if(!(player.actor.is_jumping && player.actor.speed.y < -10)) {

        //console.log(Player)

        // the player is about to crash this box... 
        if(item.state === IS_IDLE && itembox_player_collision(item, player) && player_attacking(player)) {
          console.log('ITEM BOX HIT')
          let icon = level_create_item(IT_ICON, v2d_add(act.position, v2d_new(0,-5)));
          icon.change_animation(icon, me.anim_id);
          level_create_item(IT_EXPLOSION, v2d_add(act.position, v2d_new(0,-20)));
          level_create_item(IT_CRUSHEDBOX, act.position);

          sound_play( soundfactory_get("destroy") );
          if(player.actor.is_jumping)
            player.bounce(player);

          me.on_destroy(item, player);
          item.state = IS_DEAD;
        }

      }
    }
  }

  // animation 
  me.anim_id = me.anim_id < team.length ? level_player_id() : me.anim_id;
  actor_change_animation(item.actor, sprite_get_animation("SD_ITEMBOX", me.anim_id));
}

const render = (item, camera_position) => {
  actor_render(item.actor, camera_position);
}

const release = (item) => {
  actor_destroy(item.actor);
}

const itembox_player_collision = (box, player) => {
  /* fake bricks are created on top of
   * the item boxes. Therefore, boxes need to
   * be adjusted in order to handle collisions
   * with the player properly */
  let collided;
  let act = box.actor;
  let oldpos = act.position;

  // hack 
  /*act.position.y -= 5; // jump fix 
  if(player.spin) { // spindash through multiple boxes 
    if(player.actor.position.x < act.position.x && player.actor.speed.x > 0)
      act.position.x -= 15;
    else if(player.actor.position.x > act.position.x && player.actor.speed.x < 0)
      act.position.x += 15;
  }*/

  // collision detection 
  collided = actor_collision(box.actor, player.actor);

  // unhack 
  box.actor.position = oldpos;

  /* done! */
  return collided;
}


