import { audio_init, audio_update } from "./audio"
import { commandline_parse } from "./commandline"
import { input_init, input_update, input_render } from "./input"
import { lang_init } from "./lang"
import { preferences_init } from "./preferences"
import { quest_load } from "./quest"
import { resourcemanager_init } from "./resourcemanager"
import { scenestack_init, scenestack_top, scenestack_push  } from "./scene"
import { screenshot_init, screenshot_update } from "./screenshot"
import { soundfactory_init } from "./soundfactory"
import { sprite_init } from "./sprite"
import { storyboard_init, storyboard_get_scene, 
  SCENE_INTRO,
  SCENE_LEVEL,
  SCENE_PAUSE,
  SCENE_GAMEOVER,
  SCENE_QUEST,
  SCENE_ENDOFDEMO,
  SCENE_MENU,
  SCENE_QUESTOVER,
  SCENE_CONFIRMBOX,
  SCENE_LANGSELECT,
  SCENE_CREDITS,
  SCENE_OPTIONS,
  SCENE_STAGESELECT
} from "./storyboard"
import { timer_init, timer_update } from "./timer"
import { runAnimation } from "./util"
import { video_init, video_render } from "./video"
import { level_setfile } from "./../scenes/level"
import { player_set_lives, player_set_score, PLAYER_INITIAL_LIVES } from "./../entities/player"
import { enemy_objects_init } from "./../entities/enemy"
import { font_init } from "./../entities/font"

export interface engine_options_t {
  video_resolution?: number,
  smooth_graphics?: boolean,
  fullscreen?: boolean,
  show_fps?: boolean,
  color_depth?: number,
  level?: string,
  quest?: string
  language?: string
}

/**
 * engine_init()
 * Initializes all the subsystems of
 * the game engine
 */
export const engine_init = async (options:engine_options_t) => {  
  const cmd = commandline_parse(options);
  console.log('ENGINE OPTIONS', cmd)
  
  init_basic_stuff();
  init_managers(cmd);
  await sprite_init()
  font_init();
  await init_accessories(cmd);
  init_game_data();
  push_initial_scene(cmd);
  engine_mainloop();
};

/**
 * engine_mainloop()
 * A classic main loop
 */
const engine_mainloop = () => {
  runAnimation(()=>{
    timer_update();
    input_update();
    //audio_update();

    const scn = scenestack_top();
    if (scn) {
      scn.update();
      if(scn == scenestack_top()) {
        scn.render();
      }
    }
    screenshot_update();
    video_render();
    input_render();
  });
}

/**
 * init_basic_stuff()
 * Initializes the basic stuff, such as Allegro.
 * Call this before anything else.
 */
const init_basic_stuff = () => {
  preferences_init();
}

/**
 * init_managers()
 * Initializes the managers
 */
const init_managers = (cmd:engine_options_t) => {
  timer_init();
  video_init(get_window_title(), cmd.video_resolution, cmd.smooth_graphics, cmd.fullscreen, cmd.color_depth, cmd.show_fps);
  audio_init();
  input_init();
  resourcemanager_init();
}

/**
 * init_accessories()
 * Initializes the accessories
 */
const init_accessories = async (cmd:engine_options_t) => {
  soundfactory_init();
  enemy_objects_init();
  storyboard_init();
  screenshot_init();
  await lang_init(cmd.language);
  scenestack_init();
}

/**
 * init_game_data()
 * Initializes the game data
 */
const init_game_data = () => {
  player_set_lives(PLAYER_INITIAL_LIVES);
  player_set_score(0);
}

/**
 * push_initial_scene()
 * Decides which scene should be pushed into the scene stack
 */
const push_initial_scene = async (cmd:engine_options_t) => {
  if(cmd.level) {
      level_setfile(cmd.level);
      scenestack_push(storyboard_get_scene(SCENE_LEVEL));
  }
  /*else if(cmd.quest) {
    const q = await quest_load(cmd.quest);
    //quest.run(q, true);
    scenestack_push(storyboard_get_scene(SCENE_QUEST));
    //quest_run(q, false);
    //jump_to = storyboard_get_scene(SCENE_QUEST);
    //jump_to = storyboard_get_scene(SCENE_LEVEL);
    //input_ignore(input);
    //video_fadefx_out(image.rgb(0,0,0), 0.5);
  }*/
  else {
    scenestack_push(storyboard_get_scene(SCENE_INTRO));
    //scenestack_push(storyboard_get_scene(SCENE_LEVEL));
    //scenestack_push(storyboard_get_scene(SCENE_PAUSE));
    //scenestack_push(storyboard_get_scene(SCENE_GAMEOVER));
    //scenestack_push(storyboard_get_scene(SCENE_QUEST));
    //scenestack_push(storyboard_get_scene(SCENE_ENDOFDEMO));
    //scenestack_push(storyboard_get_scene(SCENE_MENU));
    //scenestack_push(storyboard_get_scene(SCENE_QUESTOVER));
    //scenestack_push(storyboard_get_scene(SCENE_CONFIRMBOX));
    //scenestack_push(storyboard_get_scene(SCENE_LANGSELECT));
    //scenestack_push(storyboard_get_scene(SCENE_CREDITS));
    //scenestack_push(storyboard_get_scene(SCENE_OPTIONS));
    //scenestack_push(storyboard_get_scene(SCENE_STAGESELECT));
  }
}

/**
 * get_window_title()
 * Returns the title of the window
 */
const get_window_title = () => {
  return '';
}

