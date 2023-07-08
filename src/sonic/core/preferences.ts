
import { logfile_message } from "./logfile"

interface PreferencesDictionary {
  [key: string]: any
}

let data:PreferencesDictionary = {
  video_resolution: "",
  fullscreen: false,
  smooth_graphics: false,
  show_fps: false,
  language: ""
};

/**
 * preferences_init()
 * Initializes this module
 */
export const preferences_init = ():void => {
  logfile_message("preferences_init()");
  load();
};

/* accessors */    
export const preferences_get_video_resolution = () => data.video_resolution   
export const preferences_get_fullscreen = () => data.fullscreen    
export const preferences_get_smooth_graphics = () => data.smooth_graphics 
export const preferences_get_show_fps = () => data.show_fps   
export const preferences_get_language = () => data.language

/* mutators */    
export const preferences_set_video_resolution = (video_resolution:string) => { data.video_resolution = video_resolution; save(); };    
export const preferences_set_fullscreen = (fullscreen:boolean) => { data.fullscreen = fullscreen; save(); };    
export const preferences_set_smooth_graphics = (smooth_graphics:boolean) => { data.smooth_graphics = smooth_graphics; save(); };    
export const preferences_set_show_fps = (show_fps:boolean) => { data.show_fps = show_fps; save(); };    
export const preferences_set_language = (language:string) => { data.language = language; save(); };    

/**
 * set_defaults()
 * Sets defaults preferences
 */
const set_defaults = ():void => {
  data.video_resolution = "TINY";
  data.fullscreen = false;
  data.smooth_graphics = false;
  data.show_fps = false;
  data.language = "data/languages/english.json";
};

/**
 * load()
 * Load settings from disk
 */
const load = ():void => {
  set_defaults();

  if (typeof window != "undefined") {
    for(let key in data) {
      let d = window.localStorage.getItem(key) ? localStorage.getItem(key) : data[key]; 
      if (d == "false") d = false;
      if (d == "true") d = true;
      data[key] = d; 
    }
  }

  console.log("PREFERENCES",data);
};

/**
 * save()
 * Save settings to disk
 */
const save = () => {
  console.log('SAVE PREFERENCES')
  if (typeof window != "undefined") {
    for(let key in data) {
      console.log('SAVE PREVERFENCE', key, data)
      const value = data[key];
      window.localStorage.setItem(key, data[key]);
    }
  } 
};
