
import { get_object_instance } from "./base/objectdecorator"
import { level_call_dialogbox, level_hide_dialogbox } from "./../../scenes/level"

export const showdialogbox_new = (decorated_machine, title, message) => {
  return make_decorator(decorated_machine, title, message, show_dialog_box);
}

export const hidedialogbox_new = (decorated_machine) => {
  return make_decorator(decorated_machine, "dead", "beef", hide_dialog_box);
}

const make_decorator = (decorated_machine, title, message, strategy) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;
  me.title = str_dup(title);
  me.message = str_dup(message);
  me.strategy = strategy;

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

const show_dialog_box = (me) => {
  level_call_dialogbox(me.title, me.message);
}

const hide_dialog_box = (me) => {
  level_hide_dialogbox();
}

