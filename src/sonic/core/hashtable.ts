import { music_t, sound_t } from "./audio"
import { image_t } from "./image"
import { images_t, musics_t, samples_t } from "./resourcemanager"
import { spriteinfo_t, sprites_t } from "./sprite"

export interface hashtable_t {
  sprites: sprites_t,
  images: images_t,
  samples: samples_t,
  musics: musics_t
}

let hash:hashtable_t = {
  sprites: {},
  images: {},
  samples: {},
  musics: {}
};

/* sprites */

export const hashtable_spriteinfo_t_create = () => {
  hash.sprites = {};
  return hash.sprites;
};

export const hashtable_spriteinfo_t_add = (sprites:sprites_t, key:string, data:spriteinfo_t) => {
  hash.sprites[key] = data;
};

export const hashtable_spriteinfo_t_find = (sprites:sprites_t, sprite_name:string,) => {
  //(hash.sprites,sprite_name)
  return hash.sprites[sprite_name];
};

export const hashtable_sprites = () => {
  return hash.sprites;
};

/* images */

export const hashtable_image_t_create = () => {
  hash.images = {};
  return hash.images;
};

export const hashtable_image_t_add = (images:images_t, key:string, data:image_t) => {
  images[key] = data;
};

/* sounds */

export const hashtable_sound_t_create = () => {
  hash.samples = {};
  return hash.samples;
};

export const hashtable_sound_t_add = (samples:samples_t, key:string, data:sound_t) => {
  samples[key] = data;
};

export const hashtable_sound_t_find = (samples:samples_t, sample_name:string,) => {
  return hash.samples[sample_name];
};

/* music */

export const hashtable_music_t_create = () => {
  hash.musics = {};
  return hash.musics;
};

export const hashtable_music_t_add = (musics:musics_t, key:string, data:music_t) => {
  musics[key] = data;
};
