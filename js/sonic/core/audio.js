
import { INFINITY, DATA_ROOT } from "./global"
import { resourcemanager_add_music, resourcemanager_add_sample } from "./resourcemanager"
import { logfile_message } from "./logfile"

let current_music = null;

export const audio_init = () => {};
export const audio_update = () => {};
export const audio_release = () => {};

/* music management */

export const music_load = (path) => {

  logfile_message("music_load('%s')", path);

  const audioElement = new Audio();
  audioElement.src = path;

  resourcemanager_add_music(path, audioElement);

  return audioElement;
}

export const music_play = (music, loop) => {

  if(music_is_playing())
    music_stop();

  if(music != null) {
    if (loop) {
      music.loop = true;
    } else {
      music.loop = false;
    }
    music.play();
  }

  current_music = music;
}

export const music_stop = () => {

  if(current_music != null) {
    current_music.pause();
  }

  current_music = null;
}

export const music_pause = () => {
  if(current_music != null && !(current_music.is_paused)) {
    current_music.is_paused = true;
    current_music.pause();
  }
}

export const music_resume = () => {
  if(current_music != null && current_music.is_paused) {
    current_music.is_paused = false;
    current_music.play();
  }
}

export const music_set_volume = (volume) => {
  if(current_music != null) {
    if (volume > 1) volume = 1;
    if (volume < 0) volume = 0;
    current_music.volume = volume;
  }
}

export const music_get_volume = () => {
  if(current_music != null)
    return current_music.volume;
  else
    return 0.0;
}

export const music_is_playing = () => {
  return (current_music != null) && !current_music.paused;
}

/* sample management */

export const sound_load = (key, path) => {
  path = DATA_ROOT + path;

  const audioElement = new Audio();
  audioElement.src = path;

  const audioElement2 = new Audio();
  audioElement2.src = path;

  const audioElement3 = new Audio();
  audioElement3.src = path;

  const audioElement4 = new Audio();
  audioElement4.src = path;

  resourcemanager_add_sample(key, audioElement);
  resourcemanager_add_sample(key+"2", audioElement2);
  resourcemanager_add_sample(key+"3", audioElement3);
  resourcemanager_add_sample(key+"4", audioElement4);

  return audioElement;
}

export const sound_play = (sample) => {
  sound_play_ex(sample, 1.0, 0.0, 1.0, 0);
}

export const sound_play_ex = (sample, vol, pan, freq, loop) => {
  if(sample && sample.play) {
    sample.play();
  }
}

export const sound_stop = (sample) => {
  if (sample) {
    sample.stop();
  }
}

export const sound_is_playing = (sample) => {
  if(sample) {
    return !sample.paused
  } else {
    return false;
  }
}
