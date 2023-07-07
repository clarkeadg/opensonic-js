
import { get_object_instance } from "./base/objectdecorator"
import { sprite_get_animation } from "./../../core/sprite"
import { actor_change_animation } from "./../actor"

export const setanimation_new = (decorated_machine, sprite_name, animation_id) => {
  let me = {};

  me.init = init;
  me.release = release;
  me.update = update;
  me.render = render;
  me.get_object_instance = get_object_instance; /* inherits from superclass */
  me.decorated_machine = decorated_machine;
  me.anim = sprite_get_animation(sprite_name, animation_id);

  return me;
}

const init = (obj) => {    
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  change_the_animation(obj);

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
  let decorated_machine = dec;

  change_the_animation(obj);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}

const change_the_animation = (obj) => {
  let me = obj;
  let object = obj.get_object_instance(obj);

  actor_change_animation(object.actor, me.anim);
}
