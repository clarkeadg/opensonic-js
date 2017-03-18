
import { get_object_instance } from "./base/objectdecorator"
import { v2d_new, v2d_add } from "./../../core/v2d"
import { level_create_enemy } from "./../../scenes/level"

export const createchild_new = (decorated_machine, object_name, offset_x, offset_y, child_name) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;

  me.strategy = createchild_strategy;
  me.offset = v2d_new(offset_x, offset_y);
  me.object_name = object_name;
  me.child_name = child_name;
  me.new_state_name = null;

  return obj;
}

export const changechildstate_new = (decorated_machine, child_name, new_state_name) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = objectdecorator.get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;

  me.strategy = changechildstate_strategy;
  me.offset = v2d_new(0, 0);
  me.object_name = null;
  me.child_name = child_name;
  me.new_state_name = new_state_name;

  return obj;
}

export const changeparentstate_new = (decorated_machine, new_state_name) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = objectdecorator.get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;

  me.strategy = changeparentstate_strategy;
  me.offset = v2d_new(0, 0);
  me.object_name = null;
  me.child_name = null;
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

  me.strategy(me);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

const createchild_strategy = (me) => {
  let obj = me;
  let object = obj.get_object_instance(obj);
  let child;

  child = level_create_enemy(me.object_name, v2d_add(object.actor.position, me.offset));
  if(child != null)
    enemy_add_child(object, me.child_name, child);
}

const changechildstate_strategy = (me) => {
  let obj = me;
  let object = obj.get_object_instance(obj);
  let child;

  child = enemy_get_child(object, me.child_name);
  if(child != null)
      objectvm_set_current_state(child.vm, me.new_state_name);
}

const changeparentstate_strategy = (me) => {
  let obj = me;
  let object = obj.get_object_instance(obj);
  let parent;

  parent = enemy_get_parent(object);
  if(parent != null)
      objectvm_set_current_state(parent.vm, me.new_state_name);
}
