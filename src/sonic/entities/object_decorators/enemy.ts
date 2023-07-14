
import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { v2d_new, v2d_add } from "./../../core/v2d"
import { sound_play } from "./../../core/audio"
import { soundfactory_get } from "./../../core/soundfactory"
import { player_bounce, player_attacking } from "./../player"
import { actor_pixelperfect_collision } from "./../actor"
import { IT_EXPLOSION } from "./../item"
import { ES_DEAD, enemy_list_t } from "./../enemy"
import { level_add_to_score, level_create_animal, level_create_item } from "./../../scenes/level"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"
import { player_t, player_hit } from "./../player"

export interface objectdecorator_object_t extends objectdecorator_t {
  score: number
}

export const objectdecorator_enemy_new = (decorated_machine:objectmachine_t, score:number) => {
  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_object_t = <objectdecorator_object_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.score = score;

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
  const me:objectdecorator_object_t = <objectdecorator_object_t>obj;

  const object = obj.get_object_instance(obj);

  /* player x object collision */
  for(let i=0; i<team_size; i++) {
    let player = team[i];
    if (player) {
      if(actor_pixelperfect_collision(object.actor, player.actor)) {
        if(player_attacking(player) || player.invincible) {
          // I've been defeated 
          if(player.actor.is_jumping)
              player_bounce(player);
          level_add_to_score(me.score);
          level_create_item(IT_EXPLOSION, v2d_add(object.actor.position, v2d_new(0,-15)));
          level_create_animal(object.actor.position);
          sound_play( soundfactory_get("destroy") );
          object.state = ES_DEAD;
        }
        else {
          // The player has been hit by me
          player_hit(player);
        }
      }
    }
  }

  if (decorated_machine)
    decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 
