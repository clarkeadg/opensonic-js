
import { get_object_instance } from "./base/objectdecorator"
import { v2d_subtract, v2d_magnitude } from "./../../core/v2d"
import { INFINITY_FLT } from "./../../core/global"

export const changeclosestobjectstate_new = (decorated_machine, object_name, new_state_name) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;

  me.object_name = object_name;
  me.new_state_name = new_state_name;

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

  let object = obj.get_object_instance(obj);
  let target = find_closest_object(object, object_list, me.object_name, null);

  if(target != null)
    objectvm_set_current_state(target.vm, me.new_state_name);


  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}

const find_closest_object = (me, list, desired_name, distance) => {
  let min_dist = INFINITY_FLT;
  let it;
  let ret = null;
  let v;

  for(it=list; it; it=it.next) { /* this list must be small enough */
    if(str_icmp(it.data.name, desired_name) == 0) {
      v = v2d_subtract(it.data.actor.position, me.actor.position);
      if(v2d_magnitude(v) < min_dist) {
        ret = it.data;
        min_dist = v2d_magnitude(v);
      }
    }
  }

  if(distance)
    distance = min_dist;

  return ret;
}
