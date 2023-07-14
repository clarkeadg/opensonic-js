import { scene_t } from "./scene"
import { confirmbox_init, confirmbox_update, confirmbox_render, confirmbox_release } from "./../scenes/confirmbox"
import { credits_init, credits_update, credits_render, credits_release } from "./../scenes/credits"
import { endofdemo_init, endofdemo_update, endofdemo_render, endofdemo_release } from "./../scenes/endofdemo"
import { gameover_init, gameover_update, gameover_render, gameover_release } from "./../scenes/gameover"
import { intro_init, intro_update, intro_render, intro_release } from "./../scenes/intro"
import { langselect_init, langselect_update, langselect_render, langselect_release } from "./../scenes/langselect"
import { level_init, level_update, level_render, level_release } from "./../scenes/level"
import { menu_init, menu_update, menu_render, menu_release } from "./../scenes/menu"
import { options_init, options_update, options_render, options_release } from "./../scenes/options"
import { pause_init, pause_update, pause_render, pause_release } from "./../scenes/pause"
import { quest_init, quest_update, quest_render, quest_release } from "./../scenes/quest"
import { questover_init, questover_update, questover_render, questover_release } from "./../scenes/questover"
import { stageselect_init, stageselect_update, stageselect_render, stageselect_release } from "./../scenes/stageselect"

const STORYBOARD_CAPACITY = 256;

export const SCENE_INTRO         = 0;
export const SCENE_LEVEL         = 1;
export const SCENE_PAUSE         = 2;
export const SCENE_GAMEOVER      = 3;
export const SCENE_QUEST         = 4;
export const SCENE_ENDOFDEMO     = 5;
export const SCENE_MENU          = 6;
export const SCENE_QUESTOVER     = 7;
export const SCENE_CONFIRMBOX    = 8;
export const SCENE_LANGSELECT    = 9;
export const SCENE_CREDITS       = 10;
export const SCENE_OPTIONS       = 11;
export const SCENE_STAGESELECT   = 12;

let storyboard:scene_t[] = [];

/**
 * storyboard_init()
 * Initializes the storyboard
 */
export const storyboard_init = () => {

  /* initializing... */
  for(let i=0; i<STORYBOARD_CAPACITY; i++)
    storyboard[i] = null;

  /* registering the scenes */
  storyboard[SCENE_LEVEL] = scene_create(level_init, level_update, level_render,level_release);
  storyboard[SCENE_PAUSE] = scene_create(pause_init, pause_update, pause_render, pause_release);
  storyboard[SCENE_GAMEOVER] = scene_create(gameover_init, gameover_update, gameover_render, gameover_release);
  storyboard[SCENE_QUEST] = scene_create(quest_init, quest_update, quest_render, quest_release);
  storyboard[SCENE_MENU] = scene_create(menu_init, menu_update, menu_render, menu_release);
  storyboard[SCENE_INTRO] = scene_create(intro_init, intro_update, intro_render, intro_release);
  storyboard[SCENE_ENDOFDEMO] = scene_create(endofdemo_init, endofdemo_update, endofdemo_render, endofdemo_release);
  storyboard[SCENE_QUESTOVER] = scene_create(questover_init, questover_update, questover_render, questover_release);
  storyboard[SCENE_CONFIRMBOX] = scene_create(confirmbox_init, confirmbox_update, confirmbox_render, confirmbox_release);
  storyboard[SCENE_LANGSELECT] = scene_create(langselect_init, langselect_update, langselect_render, langselect_release);
  storyboard[SCENE_CREDITS] = scene_create(credits_init, credits_update, credits_render, credits_release);
  storyboard[SCENE_OPTIONS] = scene_create(options_init, options_update, options_render, options_release);
  storyboard[SCENE_STAGESELECT] = scene_create(stageselect_init, stageselect_update, stageselect_render, stageselect_release);
}

/**
 * storyboard_release()
 * Releases the storyboard
 */
export const storyboard_release = () => {
  for(let i=0; i<STORYBOARD_CAPACITY; i++) {
    if(storyboard[i])
      scene_destroy(storyboard[i]);
  }
}

/**
 * storyboard_get_scene()
 * Gets a scene from the storyboard.
 */
export const storyboard_get_scene = (id:number) => {
  //const scene_id = STORYBOARD_CAPACITY-1;
  //console.log('GET SCENE', id)
  return storyboard[id];
}

const scene_create = (init:any, update:any, render:any, release:any):scene_t => {
  const scene:scene_t = {
    init,
    update,
    render,
    release
  }
  return scene;
}

const scene_destroy = (scn:scene_t) => {
  scn = null
}
