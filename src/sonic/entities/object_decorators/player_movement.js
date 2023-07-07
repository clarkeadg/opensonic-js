
import { get_object_instance } from "./base/objectdecorator"
import { enemy_get_observed_player } from "./../enemy"

export const enableplayermovement_new = (decorated_machine) => {
  return make_decorator(decorated_machine, true);
}

export const disableplayermovement_new = (decorated_machine) => {
  return make_decorator(decorated_machine, false);
}

const make_decorator = (decorated_machine, enable) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;
  me.enable = enable;

  return obj;
}

const init = (obj) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.init(decorated_machine);
}

const release = (obj) => {
  //let dec = obj;
  //let decorated_machine = dec.decorated_machine;
  //decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj, team, team_size, brick_list, item_list, object_list) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;
  let me = obj;

  let player = enemy_get_observed_player(obj.get_object_instance(obj));

  player.disable_movement = !me.enable;

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

