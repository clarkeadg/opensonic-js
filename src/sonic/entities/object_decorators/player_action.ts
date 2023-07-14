import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { enemy_get_observed_player } from "./../enemy"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"
import { player_t } from "./../player"
import { enemy_list_t } from "./../enemy"

export interface objectdecorator_playeraction_t extends objectdecorator_t {
  update: Function
}

export const objectdecorator_springfyplayer_new = (decorated_machine:objectmachine_t) => make_decorator(decorated_machine, springfy)

export const objectdecorator_rollplayer_new = (decorated_machine:objectmachine_t) => make_decorator(decorated_machine, roll)

const make_decorator = (decorated_machine:objectmachine_t, update_strategy:Function) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_playeraction_t = <objectdecorator_playeraction_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.update = update_strategy;

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
  const me:objectdecorator_playeraction_t = <objectdecorator_playeraction_t>obj;

  const player = enemy_get_observed_player(obj.get_object_instance(obj));

  me.update(player);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

const springfy = (player:player_t) => {
  player.spring = true;
  player.spin = false;

  player.flying = false;
  player.climbing = false;
  player.landing = false;
  player.getting_hit = false;
  player.is_fire_jumping = false;
}

const roll = (player:player_t) => {
  player.spin = true;
  player.spring = false;

  player.flying = false;
  player.climbing = false;
  player.landing = false;
  player.getting_hit = false;
  player.is_fire_jumping = false;
}

