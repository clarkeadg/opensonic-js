
import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { actor_corners, actor_handle_clouds } from "./../actor"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"

export interface objectdecorator_jump_t extends objectdecorator_t {
  jump_strength: number
}

export const objectdecorator_jump_new = (decorated_machine:objectmachine_t, jump_strength:number) => {
  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_jump_t = <objectdecorator_jump_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.jump_strength = jump_strength;

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
  const me:objectdecorator_jump_t = <objectdecorator_jump_t>obj;

  const object = obj.get_object_instance(obj);
  const act = object.actor;
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

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 


