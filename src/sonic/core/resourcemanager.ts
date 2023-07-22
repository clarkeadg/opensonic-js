import { DATA_ROOT } from "./global"
import { 
  hashtable_spriteinfo_t_create,
  hashtable_spriteinfo_t_add,
  hashtable_spriteinfo_t_find,
  hashtable_image_t_create,
  hashtable_image_t_add,
  hashtable_sound_t_create,
  hashtable_sound_t_add,
  hashtable_sound_t_find,
  hashtable_music_t_create,
  hashtable_music_t_add
} from "./hashtable"
import { music_t, sound_t } from "./audio"

let images:any = {};
let samples:any = {};
let musics:any = {};
let dataCache:any = {};

export const resourcemanager_getJsonFiles = (files:string[]) => {
  return Promise.all(files.map(resourcemanager_getJsonFile));
};

export const resourcemanager_getJsonFile = (file:string) => {
  file = DATA_ROOT + file;
  return new Promise(function (fulfill, reject){
    //console.log('GETTING FILE: ',file)
    if (dataCache[file]) {
      //console.log('FILE CACHED',dataCache[file]);
      fulfill(dataCache[file]);
      return;
    }
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    //rawFile.open("GET", file+"?"+d.getTime(), true);
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
      //console.log(rawFile)
      if (rawFile.readyState === 4) {
      //if (rawFile.readyState === 4 && rawFile.status == "200") {
        var rs = {};
        try {
          rs = JSON.parse(rawFile.responseText);
        } catch(e) {
          //console.log('error parsing json',file)
        }
        dataCache[file] = rs;
        //console.log('FULFILL PROMOSE', rs)
        fulfill(rs);
      }
    }
    rawFile.send(null);
  });
};

export const resourcemanager_init = () => {
  images = hashtable_image_t_create();
  samples = hashtable_sound_t_create();
  musics = hashtable_music_t_create();
};

export const resourcemanager_add_image = (key:string, data:any) => {
  hashtable_image_t_add(images, key, data);
};

export const resourcemanager_add_sample = (key:string, data:sound_t) => {
  hashtable_sound_t_add(samples, key, data);
};

export const resourcemanager_add_music = (key:string, data:music_t) => {
  hashtable_music_t_add(musics, key, data);
};
