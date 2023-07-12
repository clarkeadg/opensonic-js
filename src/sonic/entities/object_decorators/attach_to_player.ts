import { v2d_t, v2d_new, v2d_add } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { enemy_get_observed_player } from "./../enemy"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"

export interface objectdecorator_attachtoplayer_t extends objectdecorator_t {
  offset: v2d_t
}

export const attachtoplayer_new = (decorated_machine:objectmachine_t, offset_x:number, offset_y:number) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_attachtoplayer_t = <objectdecorator_attachtoplayer_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.offset = v2d_new(offset_x, offset_y);

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
  const me:objectdecorator_attachtoplayer_t = <objectdecorator_attachtoplayer_t>obj;
  const object = obj.get_object_instance(obj);
  const player = enemy_get_observed_player(object);

  object.actor.position = v2d_add(player.actor.position, me.offset);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 
