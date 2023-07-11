
import { v2d_t } from "../../core/v2d"
import { get_object_instance } from "./base/objectdecorator"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"
import { level_add_to_score } from "./../../scenes/level"

export const addtoscore_new = (decorated_machine:any, score:number) => {
  const obj:any = {
    init: init,
    release: release,
    update: update,
    render: render,
    get_object_instance: get_object_instance,
    decorated_machine: decorated_machine,
    score: score
  }

  return obj;
}

const init = (obj:any) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  ; /* empty */

  decorated_machine.init(decorated_machine);
}

const release = (obj:any) => {
  //let dec = obj;
  //let decorated_machine = dec.decorated_machine;

  //; /* empty */

  //decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;
  let me = obj;

  level_add_to_score(me.score);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:any, camera_position:v2d_t) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  ; /* empty */

  decorated_machine.render(decorated_machine, camera_position);
}
