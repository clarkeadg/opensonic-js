
import { logfile_message } from "./logfile"

let data = {
  video_resolution: null,
  fullscreen: null,
  smooth_graphics: null,
  show_fps: null,
  language: null
};

export const preferences_init = function() {
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
export const preferences_set_video_resolution = (video_resolution) => { data.video_resolution = video_resolution; save(); };    
export const preferences_set_fullscreen = (fullscreen) => { data.fullscreen = fullscreen; save(); };    
export const preferences_set_smooth_graphics = (smooth_graphics) => { data.smooth_graphics = smooth_graphics; save(); };    
export const preferences_set_show_fps = (show_fps) => { data.show_fps = show_fps; save(); };    
export const preferences_set_language = (language) => { data.language = language; save(); };    

const set_defaults = () => {
  data.video_resolution = "TINY";
  data.fullscreen = false;
  data.smooth_graphics = false;
  data.show_fps = false;
  data.language = "data/languages/english.json";
};

const load = () => {
  set_defaults();

  if (typeof window != "undefined") {
    for(let key in data) {
      data[key] = window.localStorage.getItem(key) ? localStorage.getItem(key) : data[key];
      if (data[key] == "false") data[key] = false;
    }
  }

  console.log("PREFERENCES",data);
};

const save = () => {
  console.log('SAVE PREFERENCES')
  if (typeof window != "undefined") {
    for(let key in data) {
      console.log('SAVE PREVERFENCE', key, data)
      window.localStorage.setItem(key, data[key]);
    }
  } 
};
