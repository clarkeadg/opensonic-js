
import { v2d_t, v2d_new } from "./../../../core/v2d"
import { actor_render } from "./../../actor"

export const objectbasicmachine_new = (object:any) => {
  let me = {
    init: init,
    release: release,
    update: update,
    render: render,
    get_object_instance: get_object_instance,
    basic: true,
    object: object
  };

  let obj = me;

  return obj;
}

const init = (obj:any) => {
  //console.log('INIT: BASIC MACHINE',obj)
  //return obj;
}

const release = (obj:any) => {
  obj = null;
}

const update = (obj:any, team:any, team_size:number, brick_list:any, item_list:any, object_list:any) => {}

const render = (obj:any, camera_position:v2d_t) => {
  let act = obj.get_object_instance(obj).actor;
  let p = act.position;

  act.position = v2d_new( parseInt(act.position.x,10) , parseInt(act.position.y,10) );
  actor_render(act, camera_position);
  act.position = p;
}

const get_object_instance = (obj:any) => {
  let me = obj;
  return me.object;
}
