
import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { v2d_new, v2d_add } from "./../../core/v2d"
import { level_create_enemy } from "./../../scenes/level"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"
import { enemy_add_child, enemy_get_child, enemy_get_parent } from "./../enemy"
import { object_vm_set_current_state } from "./../object_vm"

export interface objectdecorator_children_t extends objectdecorator_t {
  object_name: string,
  offset: v2d_t,
  child_name: string,
  new_state_name: string,
  strategy: Function
}

export const createchild_new = (decorated_machine:objectmachine_t, object_name:string, offset_x:number, offset_y:number, child_name:string) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_children_t = <objectdecorator_children_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.strategy = createchild_strategy;
  me.offset = v2d_new(offset_x, offset_y);
  me.object_name = object_name;
  me.child_name = child_name;
  me.new_state_name = null;

  return obj;
}

export const changechildstate_new = (decorated_machine:objectmachine_t, child_name:string, new_state_name:string) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_children_t = <objectdecorator_children_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.strategy = changechildstate_strategy;
  me.offset = v2d_new(0, 0);
  me.object_name = null;
  me.child_name = child_name;
  me.new_state_name = new_state_name;

  return obj;
}

export const changeparentstate_new = (decorated_machine:objectmachine_t, new_state_name:string) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_children_t = <objectdecorator_children_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.strategy = changeparentstate_strategy;
  me.offset = v2d_new(0, 0);
  me.object_name = null;
  me.child_name = null;
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
  const me:objectdecorator_children_t = <objectdecorator_children_t>obj;

  me.strategy(me);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

const createchild_strategy = (me:objectdecorator_children_t) => {
  const obj:objectmachine_t = <objectmachine_t>me;
  const object = obj.get_object_instance(obj);  
  const child = level_create_enemy(me.object_name, v2d_add(object.actor.position, me.offset));
  
  if(child != null)
    enemy_add_child(object, me.child_name, child);
}

const changechildstate_strategy = (me:objectdecorator_children_t) => {
  const obj:objectmachine_t = <objectmachine_t>me;
  const object = obj.get_object_instance(obj);  
  const child = enemy_get_child(object, me.child_name);

  if(child != null)
      object_vm_set_current_state(child.vm, me.new_state_name);
}

const changeparentstate_strategy = (me:objectdecorator_children_t) => {
  const obj:objectmachine_t = <objectmachine_t>me;
  const object = obj.get_object_instance(obj); 
  const parent = enemy_get_parent(object);
  
  if(parent != null)
      object_vm_set_current_state(parent.vm, me.new_state_name);
}
