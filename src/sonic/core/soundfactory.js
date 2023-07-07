
import { sound_load, sound_is_playing } from "./audio"
import { hashtable_sound_t_find } from "./hashtable"
import { logfile_message } from "./logfile"
import { resourcemanager_getJsonFile } from "./resourcemanager"
//import { } from "./hashtable"

let samples = {};

export const soundfactory_init = function() {
  //samples = hashtable.factorysound_t_create(factorysound_destroy);
  load_samples_table();
};

export const soundfactory_release = function() {
  //samples = hashtable.factorysound_t_destroy(samples);
}

export const soundfactory_get = function(sound_name) {
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

const load_samples_table = () => {

  logfile_message("soundfactory: loading the samples table...");
  
  resourcemanager_getJsonFile("data/config/samples.json")
  .then(function(data){   
    traverse(data);
  });
}

const traverse = (stmt) => {    
  for (let s in stmt) {
    samples[s] = traverse_sound(s, stmt[s])
  }
}

const traverse_sound = (stmt, factorysound) => {
  const f = factorysound_create();
  f.data = sound_load(stmt, factorysound);
  f.data2 = sound_load(stmt, factorysound);
  return f;
}  

const factorysound_create = () => {
  const f = {};
  f.data = null;
  return f;
}

const factorysound_destroy = (f) => {
  f = null;
}
