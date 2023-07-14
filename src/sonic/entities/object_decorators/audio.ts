import { v2d_t } from "../../core/v2d"
import { objectmachine_t } from "./base/objectmachine"
import { objectdecorator_t, get_object_instance } from "./base/objectdecorator"
import { sound_t, music_t, sound_play_ex, music_set_volume, music_play, music_load } from "./../../core/audio"
import { INFINITY } from "./../../core/global"
import { clip } from "./../../core/util"
import { soundfactory_get } from "./../../core/soundfactory"
import { level_restore_music } from "./../../scenes/level"
import { brick_list_t } from "./../brick"
import { item_list_t } from "./../item"
import { player_t } from "./../player"
import { enemy_list_t } from "./../enemy"

export interface audiostrategy_t {
  update: Function
}

export interface objectdecorator_audio_t extends objectdecorator_t {
  strategy: audiostrategy_t
}

export interface playsamplestrategy_t extends audiostrategy_t {
  sfx: any,
  vol: number,
  pan: number,
  freq: number,
  loop: boolean
}

export interface playmusicstrategy_t extends audiostrategy_t {
  mus: any,
  loop: boolean
}

export interface setmusicvolumestrategy_t extends audiostrategy_t {
  vol: number
}

export interface playlevelmusicstrategy_t extends audiostrategy_t {}

export const objectdecorator_playsample_new = (decorated_machine:objectmachine_t, sample_name:string, vol:number, pan:number, freq:number, loop:boolean) =>
  make_decorator(decorated_machine, playsamplestrategy_new(sample_name, vol, pan, freq, loop))

export const objectdecorator_playmusic_new = (decorated_machine:objectmachine_t, music_name:string, loop:boolean) =>
  make_decorator(decorated_machine, playmusicstrategy_new(music_name, loop))

export const objectdecorator_playlevelmusic_new = (decorated_machine:objectmachine_t) =>
  make_decorator(decorated_machine, playlevelmusicstrategy_new())

export const objectdecorator_setmusicvolume_new = (decorated_machine:objectmachine_t, vol:number) =>
  make_decorator(decorated_machine, setmusicvolumestrategy_new(vol))


const init = (obj:objectmachine_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.init(decorated_machine);
}

const release = (obj:objectmachine_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  const me:objectdecorator_audio_t = <objectdecorator_audio_t>obj;

  //free(me->strategy);
  
  decorated_machine.release(decorated_machine);
  //free(obj);
}

const update = (obj:objectmachine_t, team:player_t[], team_size:number, brick_list:brick_list_t, item_list:item_list_t, object_list:enemy_list_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;
  const me:objectdecorator_audio_t = <objectdecorator_audio_t>obj;

  me.strategy.update(me.strategy);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj:objectmachine_t, camera_position:v2d_t) => {
  const dec:objectdecorator_t = <objectdecorator_t>obj;
  const decorated_machine:objectmachine_t = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
}  

const make_decorator = (decorated_machine:objectmachine_t, strategy:audiostrategy_t) => {

  const obj:objectmachine_t = {
    init,
    release,
    update,
    render,
    get_object_instance
  }

  const me:objectdecorator_audio_t = <objectdecorator_audio_t>obj;
  const dec:objectdecorator_t = <objectdecorator_t>me;

  dec.decorated_machine = decorated_machine;
  me.strategy = strategy;

  return obj;
}

const playsamplestrategy_new = (sample_name:string, vol:number, pan:number, freq:number, loop:boolean) => {
  const s:playsamplestrategy_t = {
    update: playsamplestrategy_update,
    sfx: soundfactory_get(sample_name),
    vol: Math.min(vol, 0.0, 1.0),
    pan: Math.min(pan, -1.0, 1.0),
    freq: freq,
    loop: loop
  };

  return <audiostrategy_t>s;
}

const playsamplestrategy_update = (s:audiostrategy_t) => {
  const me:playsamplestrategy_t = <playsamplestrategy_t>s;
  sound_play_ex(me.sfx);
  //sound_play_ex(me.sfx, me.vol, me.pan, me.freq, me.loop);
}

const playmusicstrategy_new = (music_name:string, loop:boolean) => {
  const s:playmusicstrategy_t = {
    update: playmusicstrategy_update,
    mus: music_load(music_name),
    loop: loop
  };

  return <audiostrategy_t>s;
}

const playmusicstrategy_update = (s:audiostrategy_t) => {
  const me:playmusicstrategy_t = <playmusicstrategy_t>s;
  music_play(me.mus, me.loop);
}

const playlevelmusicstrategy_new = () => {
  const s:playmusicstrategy_t = {
    update: playlevelmusicstrategy_update,
    mus: null,
    loop: true
  };
  return <audiostrategy_t>s;
}

const playlevelmusicstrategy_update = (s:audiostrategy_t) => {
  level_restore_music();
}

const setmusicvolumestrategy_new = (vol:number) => {
  const s:setmusicvolumestrategy_t = {
    update: setmusicvolumestrategy_update,
    vol: clip(vol, 0.0, 1.0)
  };

  return s;
}

const setmusicvolumestrategy_update = (s:audiostrategy_t) => {
  const me:setmusicvolumestrategy_t = <setmusicvolumestrategy_t>s;
  music_set_volume(me.vol);
}


