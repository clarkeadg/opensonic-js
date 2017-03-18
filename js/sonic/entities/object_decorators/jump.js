
import { get_object_instance } from "./base/objectdecorator"
import { actor_corners, actor_handle_clouds } from "./../actor"

export const jump_new = (decorated_machine, jump_strength) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;
  me.jump_strength = jump_strength;

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
  let act = object.actor;
  let down = null;
  let sqrsize = 2, diff = -4;

  /* sensors */
  actor_corners(act, sqrsize, diff, brick_list, null, null, null, null, down, null, null, null);
  actor_handle_clouds(act, diff, null, null, null, null, down, null, null, null);

  /* jump! */
  if(down != null)
    act.speed.y = -(me.jump_strength);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 


