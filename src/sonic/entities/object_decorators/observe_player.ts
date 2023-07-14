import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { enemy_observe_player, enemy_observe_current_player, enemy_observe_active_player, enemy_get_observed_player } from "./../enemy"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"
import { player_t } from "./../player"
import { enemy_t, enemy_list_t } from "./../enemy"

export interface observeplayerstrategy_t {
  player_name: string,
  object: enemy_t,
  run: Function
}

export interface objectdecorator_observeplayer_t extends objectdecorator_t {
  strategy: observeplayerstrategy_t
}

export const objectdecorator_observeplayer_new = (decorated_machine:objectmachine_t, player_name:string) => {
  const object = decorated_machine.get_object_instance(decorated_machine);
  return make_decorator(decorated_machine, make_strategy(player_name, object, observe_player));
}

export const objectdecorator_observecurrentplayer_new = (decorated_machine:objectmachine_t) => {
  let object = decorated_machine.get_object_instance(decorated_machine);
  return make_decorator(decorated_machine, make_strategy("foo", object, observe_current_player));
}

export const objectdecorator_observeactiveplayer_new = (decorated_machine:objectmachine_t) => {
  let object = decorated_machine.get_object_instance(decorated_machine);
  return make_decorator(decorated_machine, make_strategy("bar", object, observe_active_player));
}

export const objectdecorator_observeallplayers_new = (decorated_machine:objectmachine_t) => {
  let object = decorated_machine.get_object_instance(decorated_machine);
  return make_decorator(decorated_machine, make_strategy("boo", object, observe_all_players));
}

const make_decorator = (decorated_machine:objectmachine_t, strategy:observeplayerstrategy_t) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_observeplayer_t = <objectdecorator_observeplayer_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.strategy = strategy;

  return obj;
}

const make_strategy = (player_name:string, object:enemy_t, run_func:Function) => {
  const x:observeplayerstrategy_t = {
    player_name: player_name,
    object: object,
    run: run_func
  };

  return x;
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
  const me:objectdecorator_observeplayer_t = <objectdecorator_observeplayer_t>obj;

  me.strategy.run(me.strategy, team, team_size);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}  

const observe_player = (strategy:observeplayerstrategy_t, team:player_t[], team_size:number) => {

  let player = null;

  //for(let i=0; i<team_size; i++) {
  //    if(str_icmp(team[i].name, strategy.player_name) == 0)
  //        player = team[i];
  //}

  //if(player == null)
  //  fatal_error("Can't observe player \"%s\": player does not exist!", strategy.player_name);

  enemy_observe_player(strategy.object, player);
}

const observe_current_player = (strategy:observeplayerstrategy_t, team:player_t[], team_size:number) => {
  enemy_observe_current_player(strategy.object);
}

const observe_active_player = (strategy:observeplayerstrategy_t, team:player_t[], team_size:number) => {
  enemy_observe_active_player(strategy.object);
}

const observe_all_players = (strategy:observeplayerstrategy_t, team:player_t[], team_size:number) => {
  const observed_player = enemy_get_observed_player(strategy.object);

  for(let i=0; i<team_size; i++) {
    if(team[i] == observed_player) {
      enemy_observe_player(strategy.object, team[(i+1)%team_size]);
      break;
    }
  }
}


