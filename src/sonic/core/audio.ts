
import { INFINITY, DATA_ROOT } from "./global"
import { resourcemanager_add_music, resourcemanager_add_sample } from "./resourcemanager"
import { logfile_message } from "./logfile"

export interface music_t extends HTMLAudioElement {}

export interface sound_t extends HTMLAudioElement {}

let current_music:music_t = null;

/**
 * audio_init()
 * Initializes the Audio Manager
 */
export const audio_init = () => {};

/**
 * audio_update()
 * Updates the audio manager
 */
export const audio_update = () => {};

/**
 * audio_release()
 * Releases the audio manager
 */
export const audio_release = () => {};

/* music management */

/**
 * music_load()
 * Loads a music from a file
 */
export const music_load = (path:string) => {

  logfile_message(`music_load("${path}")`);

  const audioElement:HTMLAudioElement = new Audio();
  audioElement.src = path;

  resourcemanager_add_music(path, audioElement);

  return audioElement;
}

/**
 * music_play()
 * Plays the given music and loops [loop] times.
 * Set loop equal to INFINITY to make it loop forever.
 */
export const music_play = (music:music_t, loop:boolean) => {

  if(music_is_playing())
    music_stop();

  if(music != null) {
    if (loop) {
      music.loop = true;
    } else {
      music.loop = false;
    }
    try {
      music.play();
    } catch(e) {}
  }

  current_music = music;
}

/**
 * music_stop()
 * Stops the current music (if any)
 */
export const music_stop = () => {

  if(current_music != null) {
    current_music.pause();
  }

  current_music = null;
}

/**
 * music_pause()
 * Pauses the current music
 */
export const music_pause = () => {
  if(current_music != null && !(current_music.paused)) {
    current_music.pause();
  }
}

/**
 * music_resume()
 * Resumes the current music
 */
export const music_resume = () => {
  if(current_music != null && current_music.paused) {
    current_music.play();
  }
}

/**
 * music_set_volume()
 * Changes the volume of the current music.
 * 0.0f (quiet) <= volume <= 1.0f (loud)
 * default = 1.0f
 */
export const music_set_volume = (volume:number) => {
  if(current_music != null) {
    if (volume > 1) volume = 1;
    if (volume < 0) volume = 0;
    current_music.volume = volume;
  }
}

/**
 * music_get_volume()
 * Returns the volume of the current music.
 * 0.0f <= volume <= 1.0f
 */
export const music_get_volume = () => {
  if(current_music != null)
    return current_music.volume;
  else
    return 0.0;
}

/**
 * music_is_playing()
 * Returns TRUE if a music is playing, FALSE
 * otherwise.
 */
export const music_is_playing = () => {
  return (current_music != null) && !current_music.paused;
}

/* sample management */

/**
 * sound_load()
 * Loads a sample from a file
 */
export const sound_load = (key:string, path:string) => {
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

/**
 * sound_play()
 * Plays the given sample
 */
export const sound_play = (sample:sound_t) => {
  sound_play_ex(sample);
}

/**
 * sound_play_ex()
 * Plays the given sample with extra options! :)
 *
 * 0.0 <= volume <= 1.0
 * (left speaker) -1.0 <= pan <= 1.0 (right speaker)
 * 1.0 = default frequency
 * 0 = no loops
 */
export const sound_play_ex = (sample:sound_t) => {
  if(sample && sample.play) {
    sample.play();
  }
}

/**
 * sound_stop()
 * Stops a sample
 */
export const sound_stop = (sample:sound_t) => {
  if (sample) {
    sample.pause();
  }
}

/*
 * sound_is_playing()
 * Checks if a given sound is playing or not
 */
export const sound_is_playing = (sample:sound_t) => {
  if(sample) {
    return !sample.paused
  } else {
    return false;
  }
}
