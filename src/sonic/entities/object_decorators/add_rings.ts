
import { v2d_t } from "../../core/v2d"
import { get_object_instance } from "./base/objectdecorator"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"
import { player_set_rings, player_get_rings } from "./../player"

export const addrings_new = (decorated_machine:any, rings:number) => {
  const obj:any = {
    init: init,
    release: release,
    update: update,
    render: render,
    get_object_instance: get_object_instance,
    decorated_machine: decorated_machine,
    rings: rings
  }

  return obj;
}

const init = (obj:any) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.init(decorated_machine);
}

const release = (obj:any) => {
  //var dec = obj;
  //var decorated_machine = dec.decorated_machine;
  //decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj:any, team:any, team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:any) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;
  let me = obj;

  player_set_rings( player_get_rings() + me.rings );

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:any, camera_position:v2d_t) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 


