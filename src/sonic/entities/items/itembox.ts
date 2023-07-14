
import { brick_list_t } from "./../brick"
import { item_t, item_list_t, IS_IDLE, IS_DEAD, IT_ICON, IT_EXPLOSION, IT_CRUSHEDBOX } from "./../item"
import { v2d_t, v2d_add, v2d_new } from "./../../core/v2d"
import { sprite_get_animation } from "./../../core/sprite"
import { sound_play, music_play, music_load } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { level_add_to_score, level_create_item, level_player_id, level_override_music } from "./../../scenes/level"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_collision } from "./../actor"
import { player_hit, player_set_lives, player_get_lives, player_set_rings, player_get_rings, player_attacking, player_bounce, SH_SHIELD, SH_FIRESHIELD, SH_THUNDERSHIELD, SH_WATERSHIELD, SH_ACIDSHIELD, SH_WINDSHIELD } from "./../player"
import { icon_change_animation } from "./icon"

export interface itembox_t extends item_t {
  anim_id: number,
  on_destroy: Function
}

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

const lifebox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player_set_lives( player_get_lives()+1 );
  level_override_music( soundfactory_get("1up") );
}

const ringbox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player_set_rings( player_get_rings()+10 );
  sound_play( soundfactory_get("ring") );
}

const starbox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player.invincible = true;
  player.invtimer = 0;
  music_play( music_load("data/music/invincible.mp4"), false );
}

const speedbox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player.got_speedshoes = true;
  player.speedshoes_timer = 0;
  music_play( music_load("data/music/speed.mp4"), false );
}

const glassesbox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player.got_glasses = true;
}

const shieldbox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player.shield_type = SH_SHIELD;
  sound_play( soundfactory_get("shield") );
}

const fireshieldbox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player.shield_type = SH_FIRESHIELD;
  sound_play( soundfactory_get("fire shield") );
}

const thundershieldbox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player.shield_type = SH_THUNDERSHIELD;
  sound_play( soundfactory_get("thunder shield") );
}

const watershieldbox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player.shield_type = SH_WATERSHIELD;
  sound_play( soundfactory_get("water shield") );
}

const acidshieldbox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player.shield_type = SH_ACIDSHIELD;
  sound_play( soundfactory_get("acid shield") );
}

const windshieldbox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
  player.shield_type = SH_WINDSHIELD;
  sound_play( soundfactory_get("wind shield") );
}

const trapbox_strategy = (item:item_t, player:any) => {
  player_hit(player);
}

const emptybox_strategy = (item:item_t, player:any) => {
  level_add_to_score(100);
} 

const itembox_create = (on_destroy:Function, anim_id:number) => {

  const item:item_t = {
    init,
    release,
    update,
    render
  }

  const me:itembox_t = <itembox_t>item;

  me.on_destroy = on_destroy;
  me.anim_id = anim_id;

  return item;
}

const init = (item:item_t) => {
  const me:itembox_t = <itembox_t>item;

  item.obstacle = true;
  item.bring_to_back = false;
  item.preserve = true;
  item.actor = actor_create();

  actor_change_animation(item.actor, sprite_get_animation("SD_ITEMBOX", me.anim_id));
}

const update = (item:item_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:any) => {

  const act = item.actor;
  const me:itembox_t = <itembox_t>item;

  for(let i=0; i<team_size; i++) {
    let player = team[i];
    if (player) {
      if(!(player.actor.is_jumping && player.actor.speed.y < -10)) {

        // the player is about to crash this box... 
        if(item.state === IS_IDLE && itembox_player_collision(item, player) && player_attacking(player)) {
          let icon = level_create_item(IT_ICON, v2d_add(act.position, v2d_new(0,-5)));
          icon_change_animation(icon, me.anim_id);
          level_create_item(IT_EXPLOSION, v2d_add(act.position, v2d_new(0,-20)));
          level_create_item(IT_CRUSHEDBOX, act.position);

          sound_play( soundfactory_get("destroy") );
          if(player.actor.is_jumping)
            player_bounce(player);

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

const render = (item:item_t, camera_position:v2d_t) => {
  actor_render(item.actor, camera_position);
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

const itembox_player_collision = (box:item_t, player:any) => {
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


