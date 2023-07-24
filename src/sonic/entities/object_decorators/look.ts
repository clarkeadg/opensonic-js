import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { IF_HFLIP } from "./../../core/image"
import { enemy_get_observed_player, enemy_list_t } from "./../enemy"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"
import { player_t } from "./../player"

export interface objectdecorator_look_t extends objectdecorator_t {
  old_x: number,
  look_strategy: Function
}

export const objectdecorator_lookleft_new = (decorated_machine:objectmachine_t) => look_new(decorated_machine, look_left)
export const objectdecorator_lookright_new = (decorated_machine:objectmachine_t) => look_new(decorated_machine, look_right)
export const objectdecorator_lookatplayer_new = (decorated_machine:objectmachine_t) => look_new(decorated_machine, look_at_player)
export const objectdecorator_lookatwalkingdirection_new = (decorated_machine:objectmachine_t) => look_new(decorated_machine, look_at_walking_direction)

const look_new = (decorated_machine:objectmachine_t, look_strategy:Function) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_look_t = <objectdecorator_look_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.look_strategy = look_strategy;

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

const update = (obj:objectmachine_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:enemy_list_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  const me:objectdecorator_look_t = <objectdecorator_look_t>obj;

  me.look_strategy(me);  

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list); 
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}  

const look_left = (me:objectdecorator_look_t) => {
  const obj:objectmachine_t = <objectmachine_t>me;
  const object = obj.get_object_instance(obj);

  object.actor.mirror &= ~IF_HFLIP;
}

const look_right = (me:objectdecorator_look_t) => {
  const obj:objectmachine_t = <objectmachine_t>me;
  const object = obj.get_object_instance(obj);

  object.actor.mirror |= IF_HFLIP;
}

const look_at_player = (me:objectdecorator_look_t) => {
  const obj:objectmachine_t = <objectmachine_t>me;
  const object = obj.get_object_instance(obj);
  const player = enemy_get_observed_player(object);

  if (player) {
    if(object.actor.position.x < player.actor.position.x)
      object.actor.mirror &= ~IF_HFLIP;
    else
      object.actor.mirror |= IF_HFLIP;
  }
}

const look_at_walking_direction = (me:objectdecorator_look_t) => {
  const obj:objectmachine_t = <objectmachine_t>me;
  const object = obj.get_object_instance(obj);

  if(object.actor.position.x > me.old_x)
    object.actor.mirror &= ~IF_HFLIP;
  else
    object.actor.mirror |= IF_HFLIP;

  me.old_x = object.actor.position.x;
}


