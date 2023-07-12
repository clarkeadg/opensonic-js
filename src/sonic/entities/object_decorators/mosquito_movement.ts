
import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { timer_get_delta } from "./../../core/timer"
import { v2d_add, v2d_subtract, v2d_multiply, v2d_normalize, v2d_magnitude } from "./../../core/v2d"
import { enemy_get_observed_player } from "./../enemy"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"

export interface objectdecorator_mosquitomovement_t extends objectdecorator_t {
  speed: number
}

export const mosquitomovement_new = (decorated_machine:objectmachine_t, speed:number) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_mosquitomovement_t = <objectdecorator_mosquitomovement_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.speed = speed;

  return obj;

  return me;
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
  const me:objectdecorator_mosquitomovement_t = <objectdecorator_mosquitomovement_t>obj;

  const object = obj.get_object_instance(obj);
  const player = enemy_get_observed_player(object);
  if (player) {
    let diff = v2d_subtract(player.actor.position, object.actor.position);

    if(v2d_magnitude(diff) >= 5.0) {
      const dt = timer_get_delta();
      let direction = v2d_normalize(diff);
      let ds = v2d_multiply(direction, me.speed * dt);
      object.actor.position = v2d_add(object.actor.position, ds);
    }
  }

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}  


