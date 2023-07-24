import { DATA_ROOT } from "./global"
import { 
  hashtable_image_t_create,
  hashtable_image_t_add,
  hashtable_sound_t_create,
  hashtable_sound_t_add,
  hashtable_music_t_create,
  hashtable_music_t_add
} from "./hashtable"
import { music_t, sound_t } from "./audio"
import { image_t } from "./image"

export interface images_t {
  [key: string]: image_t
}

export interface samples_t {
  [key: string]: sound_t
}

export interface musics_t {
  [key: string]: music_t
}

export interface data_cache_t {
  [key: string]: images_t|samples_t|musics_t
}

let images:images_t;
let samples:samples_t;
let musics:musics_t;
let dataCache:data_cache_t = {};

export const resourcemanager_getJsonFiles = (files:string[]) => {
  return Promise.all(files.map(resourcemanager_getJsonFile));
};

export const resourcemanager_getJsonFile = async (file:string) => {
  let data = {};
  try {
    const res = await fetch(`${DATA_ROOT}${file}`);
    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {    
    console.log("err", err)   
  } finally {
    return data;
  }
};

export const resourcemanager_init = () => {
  images = hashtable_image_t_create();
  samples = hashtable_sound_t_create();
  musics = hashtable_music_t_create();
};

export const resourcemanager_add_image = (key:string, data:image_t) => {
  hashtable_image_t_add(images, key, data);
};

export const resourcemanager_add_sample = (key:string, data:sound_t) => {
  hashtable_sound_t_add(samples, key, data);
};

export const resourcemanager_add_music = (key:string, data:music_t) => {
  hashtable_music_t_add(musics, key, data);
};
