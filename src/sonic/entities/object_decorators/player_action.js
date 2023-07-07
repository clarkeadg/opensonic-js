
import { get_object_instance } from "./base/objectdecorator"
import { enemy_get_observed_player } from "./../enemy"

export const springfyplayer_new = (decorated_machine) => make_decorator(decorated_machine, springfy)

export const rollplayer_new = (decorated_machine) => make_decorator(decorated_machine, roll)

const make_decorator(decorated_machine, update_strategy) {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;
  me.update = update_strategy;

  return obj;
} 

const init(obj) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.init(decorated_machine);
}

const release(obj) => {
  //let dec = obj;
  //let decorated_machine = dec.decorated_machine;
  //decorated_machine.release(decorated_machine);
  //free(obj);
}

const update(obj, team, team_size, brick_list, item_list, object_list) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;
  let me = obj;

  let player = enemy_get_observed_player(obj.get_object_instance(obj));

  me.update(player);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render(obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}

const springfy(player) => {
  player.spring = true;
  player.spin = false;

  player.flying = false;
  player.climbing = false;
  player.landing = false;
  player.getting_hit = false;
  player.is_fire_jumping = false;
}

const roll(player) => {
  player.spin = true;
  player.spring = false;

  player.flying = false;
  player.climbing = false;
  player.landing = false;
  player.getting_hit = false;
  player.is_fire_jumping = false;
}

