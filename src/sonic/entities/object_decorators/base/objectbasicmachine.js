
import { v2d_new } from "./../../../core/v2d"
import { actor_render } from "./../../actor"

export const objectbasicmachine_new = (object) => {
  let me = {};
  let obj = me;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance;
  obj.basic = true;
  me.object = object;

  return obj;
}

const init = (obj) => {
  //console.log('INIT: BASIC MACHINE',obj)
  //return obj;
}

const release = (obj) => {
  obj = null;
}

const update = (obj, team, team_size, brick_list, item_list, object_list) => {
  /*var dec = obj;
  var decorated_machine = dec.decorated_machine;
  if (decorated_machine)
    decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);*/
}

const render = (obj, camera_position) => {
  let act = obj.get_object_instance(obj).actor;
  let p = act.position;

  act.position = v2d_new( parseInt(act.position.x,10) , parseInt(act.position.y,10) );
  actor_render(act, camera_position);
  act.position = p;
}

const get_object_instance = (obj) => {
  let me = obj;
  return me.object;
}
