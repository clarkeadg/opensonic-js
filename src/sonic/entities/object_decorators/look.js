
import { get_object_instance } from "./base/objectdecorator"
import { IF_HFLIP } from "./../../core/global"
import { enemy_get_observed_player } from "./../enemy"

export const lookleft_new = (decorated_machine, score) => look_new(decorated_machine, look_left)
export const lookright_new = (decorated_machine, score) => look_new(decorated_machine, look_right)
export const lookatplayer_new = (decorated_machine, score) => look_new(decorated_machine, look_at_player)
export const lookatwalkingdirection_new = (decorated_machine, score) => look_new(decorated_machine, look_at_walking_direction)

const look_new = (decorated_machine, look_strategy) => {
  let me = {};
  let dec = me;
  let obj = dec;

  me.init = init;
  me.release = release;
  me.update = update;
  me.render = render;
  me.get_object_instance = get_object_instance; /* inherits from superclass */
  me.decorated_machine = decorated_machine;
  me.look_strategy = look_strategy;

  return me;
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

  if (team[0]) {
    me.look_strategy(me,team[0]);
  }

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list); 
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

const look_left = (me) => {
  let obj = me;
  let object = obj.get_object_instance(obj);

  object.actor.mirror &= ~IF_HFLIP;
}

const look_right = (me) => {
  let obj = me;
  let object = obj.get_object_instance(obj);

  object.actor.mirror |= IF_HFLIP;
}

const look_at_player = (me) => {
  let obj = me;
  let object = obj.get_object_instance(obj);
  let player = enemy_get_observed_player(object);

  if (player) {
    if(object.actor.position.x < player.actor.position.x)
      object.actor.mirror &= ~IF_HFLIP;
    else
      object.actor.mirror |= IF_HFLIP;
  }
}

const look_at_walking_direction = (me) => {
  let obj = me;
  let object = obj.get_object_instance(obj);

  if(object.actor.position.x > me.old_x)
    object.actor.mirror &= ~IF_HFLIP;
  else
    object.actor.mirror |= IF_HFLIP;

  me.old_x = object.actor.position.x;
}


