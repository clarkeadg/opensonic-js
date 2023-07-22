import { item_t, item_list_t } from "./../item"
import { enemy_list_t } from "./../enemy"
import { player_t } from "./../player"
import { v2d_t } from "./../../core/v2d"
import { brick_list_t } from "./../brick"
import { door_open, door_close } from "./door"
import { teleporter_activate } from "./teleporter"
import { item_distance_t, find_closest_item } from "./util/itemutil"
import { IT_DOOR, IT_TELEPORTER } from "./../item"
import { sound_play } from "./../../core/audio"
import { sprite_get_animation } from "./../../core/sprite"
import { soundfactory_get } from "./../../core/soundfactory"
import { bounding_box } from "./../../core/util"
import { actor_create, actor_render, actor_destroy, actor_change_animation, actor_image } from "./../actor"

export interface switch_t extends item_t {
  is_pressed: boolean,
  partner: item_t
}

export const switch_create = () => {
  
  const item:item_t = {
    init,
    release,
    update,
    render
  }

  return item;
}

const init = (item:item_t) => {
  const me:switch_t = <switch_t>item;

  item.obstacle = false;
  item.bring_to_back = true;
  item.preserve = true;
  item.actor = actor_create();

  me.is_pressed = false;
  me.partner = null;

  actor_change_animation(item.actor, sprite_get_animation("SD_SWITCH", 0));
}

const release = (item:item_t) => {
  actor_destroy(item.actor);
}

const update = (item:item_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, enemy_list:enemy_list_t) => {
  const me:switch_t = <switch_t>item;
  let door:item_t = null;
  let teleporter:item_t = null;
  
  let d1:item_distance_t = { dist: 0 };
  let d2:item_distance_t = { dist: 0 };

  // I have no partner
  me.partner = null;

  // figuring out who is my partner
  door = find_closest_item(item, item_list, IT_DOOR, d1);
  teleporter = find_closest_item(item, item_list, IT_TELEPORTER, d2);
  if(door != null && d1.dist < d2.dist)
    me.partner = door;
  if(teleporter != null && d2.dist < d1.dist)
    me.partner = teleporter;

  // handle the logic. Which logic? That depends. Who is my partner, if any?
  if(me.partner == null)
    handle_logic(item, door, team, team_size, stepin_nothing, stepout_nothing);
  else if(me.partner == door)
    handle_logic(item, door, team, team_size, stepin_door, stepout_door);
  else if(me.partner == teleporter)
    handle_logic(item, teleporter, team, team_size, stepin_teleporter, stepout_teleporter);
}

const render = (item:item_t, camera_position:v2d_t) => {

  let me = item;

  /*if(level.editmode() && me.partner != null) {
    var p1, p2, offset;
    offset = v2d.subtract(camera.position, v2d.new_v2d(video.VIDEO_SCREEN_W/2, video.VIDEO_SCREEN_H/2));
    p1 = v2d.subtract(item.actor.position, offset);
    p2 = v2d.subtract(me.partner.actor.position, offset);
    image.line(video.get_backbuffer(), parseInt(p1.x,10), parseInt(p1.y,10), parseInt(p2.x,10), parseInt(p2.y,10), image.rgb(255, 0, 0));
  }*/

  actor_render(item.actor, camera_position);
}

const handle_logic = (item:item_t, other:item_t, team:player_t[], team_size:number, stepin:Function, stepout:Function) => {
  let nobody_is_pressing_me = true;
  const me:switch_t = <switch_t>item;
  const act = item.actor;

  // step in
  for(let i=0; i<team_size; i++) {
    let player = team[i];

    if(pressed_the_switch(item, player)) {
      nobody_is_pressing_me = false;
      if(!me.is_pressed) {
        stepin(other, player);
        sound_play( soundfactory_get("switch") );
        actor_change_animation(act, sprite_get_animation("SD_SWITCH", 1));
        me.is_pressed = true;
      }
    }
  }

  // step out
  if(nobody_is_pressing_me) {
    if(me.is_pressed) {
      stepout(other);
      actor_change_animation(act, sprite_get_animation("SD_SWITCH", 0));
      me.is_pressed = false;
    }
  }
}

const stepin_nothing = (door:item_t, who:player_t) => {}

const stepout_nothing = (door:item_t) => {}

const stepin_door = (door:item_t, who:player_t) => {
  door_open(door);
}

const stepout_door = (door:item_t) => {
  door_close(door);
}

const stepin_teleporter = (teleporter:item_t, who:player_t) => {
  teleporter_activate(teleporter, who);
}

const stepout_teleporter = (teleporter:item_t) => {}

/* returns true if the player has pressed the switch (item) */
const pressed_the_switch = (item:item_t, player:player_t) => {
  if (!item) return false;
  if (!player) return false;

  const a = [];
  const b = [];

  a[0] = item.actor.position.x - item.actor.hot_spot.x;
  a[1] = item.actor.position.y - item.actor.hot_spot.y;
  a[2] = a[0] + actor_image(item.actor).width;
  a[3] = a[1] + actor_image(item.actor).height;

  b[0] = player.actor.position.x - player.actor.hot_spot.x + actor_image(player.actor).width * 0.3;
  b[1] = player.actor.position.y - player.actor.hot_spot.y + actor_image(player.actor).height * 0.5;
  b[2] = b[0] + actor_image(player.actor).width * 0.4;
  b[3] = b[1] + actor_image(player.actor).height * 0.5;

  return (!player.dying && !player.climbing && !player.flying && bounding_box(a,b));
}


