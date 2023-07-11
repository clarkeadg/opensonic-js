
import { v2d_t, v2d_new } from "./../../../core/v2d"
import { item_list_t } from "./../../item"
import { brick_list_t } from "./../../brick"
import { actor_render } from "./../../actor"
import { objectmachine_t } from "./objectmachine"

export interface objectbasicmachine_t extends objectmachine_t {
  object: any
}

export const objectbasicmachine_new = (object:any):objectmachine_t => {  
 
  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectbasicmachine_t = <objectbasicmachine_t>obj;

  me.object = object;

  return obj;
}

const init = (obj:objectmachine_t) => {
  //console.log('INIT: BASIC MACHINE',obj)
  //return obj;
}

const release = (obj:objectmachine_t) => {
  obj = null;
}

const update = (obj:objectmachine_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const act = obj.get_object_instance(obj).actor;
  const p = act.position;

  act.position = v2d_new( act.position.x, act.position.y );
  actor_render(act, camera_position);
  act.position = p;
}

const get_object_instance = (obj:objectmachine_t) => {
  const me:objectbasicmachine_t = <objectbasicmachine_t>obj;
  return me.object;
}
