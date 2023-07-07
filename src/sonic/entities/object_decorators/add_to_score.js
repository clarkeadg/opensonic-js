
import { get_object_instance } from "./base/objectdecorator"
import { level_add_to_score } from "./../../scenes/level"

export const addtoscore_new = (decorated_machine, score) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;
  me.score = score;

  return obj;
}

const init = (obj) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  ; /* empty */

  decorated_machine.init(decorated_machine);
}

const release = (obj) => {
  //let dec = obj;
  //let decorated_machine = dec.decorated_machine;

  //; /* empty */

  //decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj, team, team_size, brick_list, item_list, object_list) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;
  let me = obj;

  level_add_to_score(me.score);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  ; /* empty */

  decorated_machine.render(decorated_machine, camera_position);
}
