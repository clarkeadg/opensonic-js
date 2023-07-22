import { engine_options_t } from "./engine"
import { logfile_message } from "./logfile"
import { 
  preferences_get_video_resolution,
  preferences_get_smooth_graphics,
  preferences_get_fullscreen,
  preferences_get_show_fps,
  preferences_get_language
} from "./preferences"

/**
 * commandline_parse()
 * Parses the command line arguments
 */
export const commandline_parse = (options:engine_options_t) => {

  let cmd:engine_options_t = {};

  /* preferences */
  cmd.video_resolution = preferences_get_video_resolution();
  cmd.smooth_graphics = preferences_get_smooth_graphics();
  cmd.fullscreen = preferences_get_fullscreen();
  cmd.show_fps = preferences_get_show_fps();
  cmd.language = preferences_get_language();       

  // params passes in main
  cmd.video_resolution = options.video_resolution ? options.video_resolution : cmd.video_resolution;
  cmd.smooth_graphics = options.smooth_graphics ? options.smooth_graphics : cmd.smooth_graphics;
  cmd.fullscreen = options.fullscreen ? options.fullscreen : cmd.fullscreen;
  cmd.show_fps = options.show_fps ? options.show_fps : cmd.show_fps;
  cmd.color_depth = options.color_depth ? options.color_depth : 32;
  cmd.level = options.level ? options.level : null;
  cmd.quest = options.quest ? options.quest : null;
  cmd.language = options.language ? options.language : cmd.language;

  // url parameters overide
  cmd.video_resolution = getParameterByName('video_resolution') ? +getParameterByName('video_resolution') : cmd.video_resolution;
  cmd.smooth_graphics = getParameterByName('smooth_graphics') ? true : cmd.smooth_graphics;
  cmd.fullscreen = getParameterByName('fullscreen') ? true : cmd.fullscreen;
  cmd.show_fps = getParameterByName('show_fps') ? true : cmd.show_fps;
  cmd.color_depth = getParameterByName('color_depth') ? +getParameterByName('color_depth') : cmd.color_depth;
  cmd.level = getParameterByName('level') ? getParameterByName('level') : cmd.level;
  cmd.quest = getParameterByName('quest') ? getParameterByName('quest') : cmd.quest;
  cmd.language = getParameterByName('language') ? getParameterByName('language') : cmd.language;

  return cmd;
}

/*
 * display_message()
 * Displays a message (printf format)
 */
const displayMessage = (msg:string) => {
  logfile_message(msg);
}

/*
 * getParameterByName()
 * Get url parameter
 */
const getParameterByName = (name:string) => {
  if (typeof window != "undefined") {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
  return null;
}
