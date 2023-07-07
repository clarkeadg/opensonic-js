
let hash = {};

/* sprites */

export const hashtable_spriteinfo_t_create = () => {
  hash.sprites = {};
  return hash.sprites;
};

export const hashtable_spriteinfo_t_add = (sprites, key, data) => {
  hash.sprites[key] = data;
};

export const hashtable_spriteinfo_t_find = (sprites, sprite_name) => {
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

export const hashtable_image_t_add = (images, key, data) => {
  images[key] = data;
};

/* sounds */

export const hashtable_sound_t_create = () => {
  hash.samples = {};
  return hash.samples;
};

export const hashtable_sound_t_add = (samples, key, data) => {
  samples[key] = data;
};

export const hashtable_sound_t_find = (samples, sample_name) => {
  return hash.samples[sample_name];
};

/* music */

export const hashtable_music_t_create = () => {
  hash.musics = {};
  return hash.musics;
};

export const hashtable_music_t_add = (musics, key, data) => {
  musics[key] = data;
};
