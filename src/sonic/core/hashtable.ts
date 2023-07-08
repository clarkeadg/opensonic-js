
let hash:any = {};

/* sprites */

export const hashtable_spriteinfo_t_create = () => {
  hash.sprites = {};
  return hash.sprites;
};

export const hashtable_spriteinfo_t_add = (sprites:any, key:string, data:any) => {
  hash.sprites[key] = data;
};

export const hashtable_spriteinfo_t_find = (sprites:any, sprite_name:string,) => {
  console.log(hash.sprites,sprite_name)
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

export const hashtable_image_t_add = (images:any, key:string, data:any) => {
  images[key] = data;
};

/* sounds */

export const hashtable_sound_t_create = () => {
  hash.samples = {};
  return hash.samples;
};

export const hashtable_sound_t_add = (samples:any, key:string, data:any) => {
  samples[key] = data;
};

export const hashtable_sound_t_find = (samples:any, sample_name:string,) => {
  return hash.samples[sample_name];
};

/* music */

export const hashtable_music_t_create = () => {
  hash.musics = {};
  return hash.musics;
};

export const hashtable_music_t_add = (musics:any, key:string, data:any) => {
  musics[key] = data;
};
