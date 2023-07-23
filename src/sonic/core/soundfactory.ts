
import { sound_load, sound_is_playing } from "./audio"
import { hashtable_sound_t_find } from "./hashtable"
import { logfile_message } from "./logfile"
import { resourcemanager_getJsonFile } from "./resourcemanager"
//import { } from "./hashtable"

export interface samples_t {
  [key: string]: any
}

type sound_t  = {};

interface factorysound_t {
  data: sound_t,
  data2: sound_t
}

let samples:samples_t = {};

/**
 * soundfactory_init()
 * Initializes the sound factory
 */
export const soundfactory_init = ():void => {
  //samples = hashtable.factorysound_t_create(factorysound_destroy);
  load_samples_table();
};

/**
 * soundfactory_release()
 * Releases the sound factory
 */
export const soundfactory_release = ():void  => {
  //samples = hashtable.factorysound_t_destroy(samples);
}

/**
 * soundfactory_get()
 * Given a sound name, returns the corresponding sound effect
 */
export const soundfactory_get = (sound_name:string) => {
  let f = hashtable_sound_t_find(samples, sound_name);
  if (sound_is_playing(f)) {
    f = hashtable_sound_t_find(samples, sound_name+"2");
    if (sound_is_playing(f)) {
      f = hashtable_sound_t_find(samples, sound_name+"3");
      if (sound_is_playing(f)) {
        f = hashtable_sound_t_find(samples, sound_name+"4");
      }
    }
  }
  return f;    
}

/* loads the samples table */
const load_samples_table = async () => {
  logfile_message("soundfactory: loading the samples table...");  
  const data:samples_t = await resourcemanager_getJsonFile("data/config/samples.json");
  traverse(data);
}

/* traverses a sound configuration file */
const traverse = (data:samples_t):void => {    
  for (let s in data) {
    samples[s] = traverse_sound(s, data[s])
  }
}

/* traverses a sound block */
const traverse_sound = (stmt:string, factorysound:string):factorysound_t => {
  const f = factorysound_create();
  f.data = sound_load(stmt, factorysound);
  f.data2 = sound_load(stmt, factorysound);
  return f;
}  

/* creates a new factorysound object */
const factorysound_create = ():factorysound_t => {
  const f:factorysound_t = {
    data: null,
    data2: null
  };
  return f;
}

/* destroys a factory sound */
const factorysound_destroy = (f:factorysound_t):void => {
  f = null;
}
