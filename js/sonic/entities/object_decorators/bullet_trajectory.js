
import { get_object_instance } from "./base/objectdecorator"
import { v2d_new, v2d_multiply, v2d_add } from "./../../core/v2d"
import { timer_get_delta } from "./../../core/timer"

export const bullettrajectory_new = (decorated_machine, speed_x, speed_y) => {
  let me = {};

  me.init = init;
  me.release = release;
  me.update = update;
  me.render = render;
  me.get_object_instance = get_object_instance; /* inherits from superclass */
  me.decorated_machine = decorated_machine;
  me.speed = v2d_new(speed_x, speed_y);

  return me;
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

  let object = obj.get_object_instance(obj);
  let dt = timer_get_delta();
  let ds;

  ds = v2d_multiply(me.speed, dt);
  object.actor.position = v2d_add(object.actor.position, ds);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}
