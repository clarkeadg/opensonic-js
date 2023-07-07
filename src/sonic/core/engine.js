
import { audio_init, audio_update } from "./audio"
import { commandline_parse } from "./commandline"
import { input_init, input_update, input_render } from "./input"
import { lang_init } from "./lang"
import { preferences_init } from "./preferences"
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
import { player_init, player_set_lives, player_set_score, PLAYER_INITIAL_LIVES } from "./../entities/player"
import { enemy_objects_init } from "./../entities/enemy"
import { font_init } from "./../entities/font"

export const engine_init = (options) => {

  init_basic_stuff();
  const cmd = commandline_parse(options);
  console.log('COMMAND LINE', cmd)

  init_managers(cmd);

  sprite_init()
  .then(function(){
    font_init();
    init_accessories(cmd,function(){
      init_game_data();
      push_initial_scene(cmd);
      mainloop();
    });
  });
};

const mainloop = () => {
  let scn;

  runAnimation(function(step) {
    timer_update(step);
    input_update();
    //audio_update();

    scn = scenestack_top();
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

const init_basic_stuff = () => {
  preferences_init();
}

const init_managers = (cmd) => {
  timer_init();
  video_init(get_window_title(), cmd.video_resolution, cmd.smooth_graphics, cmd.fullscreen, cmd.color_depth, cmd.show_fps);
  audio_init();
  input_init();
  resourcemanager_init();
}

const init_accessories = (cmd,cb) => {
  soundfactory_init();
  enemy_objects_init();
  storyboard_init();
  screenshot_init();
  lang_init(cmd.language, function(){
    scenestack_init();
    cb();
  });
}

const init_game_data = () => {
  player_set_lives(PLAYER_INITIAL_LIVES);
  player_set_score(0);
}

const push_initial_scene = (cmd) => {
  if(cmd.custom_level) {
      level_setfile(cmd.custom_level_path);
      scenestack_push(storyboard_get_scene(SCENE_LEVEL));
  }
  /*else if(cmd.custom_quest) {
    Quest.load(cmd.custom_quest_path)
    .then(function(q){
      //quest.run(q, true);
      scenestack_push(storyboard_get_scene(SCENE_QUEST));
      //quest_run(q, false);
      //jump_to = storyboard_get_scene(SCENE_QUEST);
      //jump_to = storyboard_get_scene(SCENE_LEVEL);
      //input_ignore(input);
      //video_fadefx_out(image.rgb(0,0,0), 0.5);
    });
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

const get_window_title = () => {
  return '';
}

