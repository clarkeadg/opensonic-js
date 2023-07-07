
import { get_object_instance } from "./base/objectdecorator"
import { timer_get_delta } from "./../../core/timer"
import { v2d_add, v2d_subtract, v2d_multiply, v2d_normalize, v2d_magnitude } from "./../../core/v2d"
import { enemy_get_observed_player } from "./../enemy"

export const mosquitomovement_new = (decorated_machine, speed) => {
  let me = {};
  let dec = me;
  let obj = dec;

  me.init = init;
  me.release = release;
  me.update = update;
  me.render = render;
  me.get_object_instance = get_object_instance; /* inherits from superclass */
  me.decorated_machine = decorated_machine;
  me.speed = speed;

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

  let object = obj.get_object_instance(obj);
  let player = enemy_get_observed_player(object);
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

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}  


