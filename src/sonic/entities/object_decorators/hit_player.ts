
import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { enemy_get_observed_player } from "./../enemy"
import { player_hit } from "./../player"
import { SH_WATERSHIELD, SH_THUNDERSHIELD, SH_FIRESHIELD, SH_ACIDSHIELD } from "./../player"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"

export interface objectdecorator_hitplayer_t extends objectdecorator_t {
  should_hit_the_player: Function
}

export const hitplayer_new = (decorated_machine:objectmachine_t) => make_decorator(decorated_machine, hit_strategy)
export const burnplayer_new = (decorated_machine:objectmachine_t) => make_decorator(decorated_machine, burn_strategy)
export const shockplayer_new = (decorated_machine:objectmachine_t) => make_decorator(decorated_machine, shock_strategy)
export const acidplayer_new = (decorated_machine:objectmachine_t) => make_decorator(decorated_machine, acid_strategy)

const make_decorator = (decorated_machine:objectmachine_t, strategy:Function) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_hitplayer_t = <objectdecorator_hitplayer_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.should_hit_the_player = strategy;

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
  const me:objectdecorator_hitplayer_t = <objectdecorator_hitplayer_t>obj;

  const player = enemy_get_observed_player(obj.get_object_instance(obj));

  if(!player.invincible && me.should_hit_the_player(player))
    player_hit(player);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

const hit_strategy = (p:any) => true

const burn_strategy = (p:any) => p.shield_type != SH_FIRESHIELD && p.shield_type != SH_WATERSHIELD

const shock_strategy = (p:any) => p.shield_type != SH_THUNDERSHIELD

const acid_strategy = (p:any) => p.shield_type != SH_ACIDSHIELD

