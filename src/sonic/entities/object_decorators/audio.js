
import { get_object_instance } from "./base/objectdecorator"
import { sound_play, music_set_volume, music_play, music_load } from "./../../core/audio"
import { INFINITY } from "./../../core/global"
import { soundfactory_get } from "./../../core/soundfactory"
import { level_restore_music } from "./../../scenes/level"

export const playsample_new = (decorated_machine, sample_name, vol, pan, freq, loop) =>
  make_decorator(decorated_machine, playsamplestrategy_new(sample_name, vol, pan, freq, loop))

export const playmusic_new = (decorated_machine, music_name, loop) =>
  make_decorator(decorated_machine, playmusicstrategy_new(music_name, loop))

export const playlevelmusic_new = (decorated_machine) =>
  make_decorator(decorated_machine, playlevelmusicstrategy_new())

export const setmusicvolume_new = (decorated_machine, vol) =>
  make_decorator(decorated_machine, setmusicvolumestrategy_new(vol))


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

  me.strategy.update(me.strategy);

  decorated_machine.update(decorated_machine, team, team_size, brick_list, item_list, object_list);
}

const render = (obj, camera_position) => {
  let dec = obj;
  let decorated_machine = dec.decorated_machine;

  decorated_machine.render(decorated_machine, camera_position);
} 

const make_decorator = (decorated_machine, strategy) => {
  let me = {};
  let dec = me;
  let obj = dec;

  obj.init = init;
  obj.release = release;
  obj.update = update;
  obj.render = render;
  obj.get_object_instance = get_object_instance; /* inherits from superclass */
  dec.decorated_machine = decorated_machine;
  me.strategy = strategy;

  return obj;
}

const playsamplestrategy_new = (sample_name, vol, pan, freq, loop) => {
  let s = {};
  s.update = playsamplestrategy_update;

  s.sfx = soundfactory_get(sample_name);
  s.vol = Math.min(vol, 0.0, 1.0);
  s.pan = Math.min(pan, -1.0, 1.0);
  s.freq = freq;
  s.loop = (loop >= 0) ? loop : INFINITY;

  return s;
}

const playsamplestrategy_update = (s) => {
  let me = s;
  sound_play(me.sfx, me.vol, me.pan, me.freq, me.loop);
}

const playmusicstrategy_new = (music_name, loop) => {
  let s = {};
  s.update = playmusicstrategy_update;

  s.mus = music_load(music_name);
  s.loop = (loop >= 0) ? loop : INFINITY;

  return s;
}

const playmusicstrategy_update = (s) => {
  let me = s;
  music_play(me.mus, me.loop);
}

const playlevelmusicstrategy_new = () => {
  let s = {};
  s.update = playlevelmusicstrategy_update;
  return s;
}

const playlevelmusicstrategy_update = (s) => {
  level_restore_music();
}

const setmusicvolumestrategy_new = (vol) => {
  let s = {};
  s.update = setmusicvolumestrategy_update;

  s.vol = Math.min(vol, 0.0, 1.0);

  return s;
}

const setmusicvolumestrategy_update = (s) => {
  let me = s;
  music_set_volume(me.vol);
}


