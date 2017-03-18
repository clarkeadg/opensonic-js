
import { level_setfile } from "./level"
import { scenestack_push, scenestack_pop } from "./../core/scene"
import { quest_unload } from "./../core/quest"
import { clip } from "./../core/util"
import { storyboard_get_scene, SCENE_LEVEL, SCENE_MENU, SCENE_ENDOFDEMO, SCENE_QUESTOVER } from "./../core/storyboard"
import { logfile_message } from "./../core/logfile"
import { player_set_lives, player_set_score, PLAYER_INITIAL_LIVES } from "./../entities/player"

/* private data */
const QUESTVALUE_MAX           = 3;

let current_quest;
let current_level;
let abort_quest;
let go_back_to_menu;
let questvalue = {
  TOTALTIME: 0,
  BIGRINGS: 0,
  GLASSES: 0
};
let lastname = "NO_QUEST_NAME";

export const quest_init = () => {
  let i;

  abort_quest = false;
  for(i=0; i<QUESTVALUE_MAX; i++)
    questvalue[i] = 0;
}

export const quest_update = () => {

  /* invalid quest */
  if(current_quest.level_count == 0) {
    logfile_message("Quest '%s' has no levels.", current_quest.file);
    game_quit();
    return;
  }

  /* quest manager */
  if((current_level < current_quest.level_count) && !abort_quest) {
    //console.log(current_quest)
    /* next level... */
    level_setfile(current_quest.level_path[current_level]);
    scenestack_push(storyboard_get_scene(SCENE_LEVEL));
    current_level++;
  }
  else {
    /* the user has cleared the quest! */
    scenestack_pop();
    //if(go_back_to_menu) { /* if it's not a standalone quest */
        if(abort_quest) {
          scenestack_push(storyboard_get_scene(SCENE_MENU));
        } else if(current_quest.show_ending) {
          scenestack_push(storyboard_get_scene(SCENE_ENDOFDEMO));
        } else {
          scenestack_push(storyboard_get_scene(SCENE_QUESTOVER));
        }
    //}
    return;
  }
};

export const quest_render = () => {};

export const quest_release = () => {
  quest_unload(current_quest);
}

export const quest_run = (qst, standalone_quest) => {
  if (typeof standalone_quest == 'undefined') standalone_quest = false;
  current_quest = qst;
  go_back_to_menu = !standalone_quest;
  player_set_lives(PLAYER_INITIAL_LIVES);
  player_set_score(0);
  logfile_message("Running quest %s, '%s'...", qst.file, qst.name);
  quest_setlevel(0);
}

export const quest_setlevel = (lev) => {
  current_level = Math.max(0, lev);
}

export const quest_abort = () => {
  abort_quest = true;
}

export const quest_getname = () => {
  return lastname;
}

export const quest_setvalue = (key, value) => {
  let k = clip(parseInt(key,10), 0, QUESTVALUE_MAX-1);
  questvalue[k] = value;
}

export const quest_getvalue = (key) => {
  let k = clip(parseInt(key,10), 0, QUESTVALUE_MAX-1);
  return questvalue[k];
}
