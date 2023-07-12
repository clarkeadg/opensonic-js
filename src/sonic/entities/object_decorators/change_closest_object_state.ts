
import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { v2d_subtract, v2d_magnitude } from "./../../core/v2d"
import { INFINITY_FLT } from "./../../core/global"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"
import { object_vm_set_current_state } from "./../object_vm"

export interface objectdecorator_changeclosestobjectstate_t extends objectdecorator_t {
  object_name: string,
  new_state_name: string
}

export const changeclosestobjectstate_new = (decorated_machine:objectmachine_t, object_name:string, new_state_name:string) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_changeclosestobjectstate_t = <objectdecorator_changeclosestobjectstate_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.object_name = object_name;
  me.new_state_name = new_state_name;

  return obj;
}

const init = (obj:objectmachine_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.init(decorated_machine);
}

const release = (obj:objectmachine_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  
  decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj:objectmachine_t, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  const me:objectdecorator_changeclosestobjectstate_t = <objectdecorator_changeclosestobjectstate_t>obj;

  const object = obj.get_object_instance(obj);
  const target = find_closest_object(object, object_list, me.object_name, null);

  if(target != null)
  object_vm_set_current_state(target.vm, me.new_state_name);


  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

const find_closest_object = (me:any, list:any, desired_name:string, distance:number) => {
  let min_dist = INFINITY_FLT;
  let it;
  let ret = null;
  let v;

  for(it=list; it; it=it.next) { /* this list must be small enough */
    if(it.data.name == desired_name) {
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
