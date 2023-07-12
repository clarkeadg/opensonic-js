
import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { level_call_dialogbox, level_hide_dialogbox } from "./../../scenes/level"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"

export interface objectdecorator_dialogbox_t extends objectdecorator_t {
  title: string,
  message: string,
  strategy: Function
}

export const objectdecorator_showdialogbox_new = (decorated_machine:objectmachine_t, title:string, message:string) => {
  return make_decorator(decorated_machine, title, message, show_dialog_box);
}

export const objectdecorator_hidedialogbox_new = (decorated_machine:objectmachine_t) => {
  return make_decorator(decorated_machine, "dead", "beef", hide_dialog_box);
}

const make_decorator = (decorated_machine:objectmachine_t, title:string, message:string, strategy:Function) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_dialogbox_t = <objectdecorator_dialogbox_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.title = title;
  me.message = message;
  me.strategy = strategy;

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
  const me:objectdecorator_dialogbox_t = <objectdecorator_dialogbox_t>obj;

  me.strategy(me);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

const show_dialog_box = (me:objectdecorator_dialogbox_t) => {
  level_call_dialogbox(me.title, me.message);
}

const hide_dialog_box = (me:objectdecorator_dialogbox_t) => {
  level_hide_dialogbox();
}

