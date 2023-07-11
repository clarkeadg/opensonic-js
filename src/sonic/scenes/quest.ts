
import { level_setfile } from "./level"
import { scenestack_push, scenestack_pop } from "./../core/scene"
import { quest_t, quest_unload } from "./../core/quest"
import { clip } from "./../core/util"
import { storyboard_get_scene, SCENE_LEVEL, SCENE_MENU, SCENE_ENDOFDEMO, SCENE_QUESTOVER } from "./../core/storyboard"
import { logfile_message } from "./../core/logfile"
import { player_set_lives, player_set_score, PLAYER_INITIAL_LIVES } from "./../entities/player"

export enum questvalue_t {
  QUESTVALUE_TOTALTIME = 0,   /* total quest time, in seconds */
  QUESTVALUE_BIGRINGS,    /* how many big rings has the player got so far? */
  QUESTVALUE_GLASSES      /* how many magic glasses has the player got so far? */
};

export const { QUESTVALUE_TOTALTIME, QUESTVALUE_BIGRINGS, QUESTVALUE_GLASSES } = questvalue_t;

/* private data */
const QUESTVALUE_MAX           = 3;

let current_quest:quest_t = null;
let current_level = 0;
let abort_quest = false;
let go_back_to_menu = false;
let questvalue: number[] = [];

let lastname = "NO_QUEST_NAME";

/**
 * quest_init()
 * Initializes the quest scene. Remember to load
 * some quest before running this scene!
 */
export const quest_init = () => {
  let i;

  abort_quest = false;
  for(i=0; i<QUESTVALUE_MAX; i++)
    questvalue[i] = 0;
}

/**
 * quest_update()
 * Updates the quest manager
 */
export const quest_update = () => {

  /* invalid quest */
  if(current_quest.level_count == 0) {
    logfile_message(`Quest '%s' has no levels. ${current_quest.file}`);
    //game_quit();
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

/**
 * quest_render()
 * Actually, this function does nothing
 */
export const quest_render = () => {};

/**
 * quest_release()
 * Releases the quest scene
 */
export const quest_release = () => {
  quest_unload(current_quest);
}

export const quest_run = (qst:quest_t, standalone_quest:boolean) => {
  if (typeof standalone_quest == 'undefined') standalone_quest = false;
  current_quest = qst;
  go_back_to_menu = !standalone_quest;
  player_set_lives(PLAYER_INITIAL_LIVES);
  player_set_score(0);
  logfile_message(`Running quest %s, '%s'... ${qst.file} ${qst.name}`);
  quest_setlevel(0);
}

export const quest_setlevel = (lev:number) => {
  current_level = Math.max(0, lev);
}

export const quest_abort = () => {
  abort_quest = true;
}

export const quest_getname = () => {
  return lastname;
}

export const quest_setvalue = (key:questvalue_t, value:number) => {
  let k = clip(key, 0, QUESTVALUE_MAX-1);
  questvalue[k] = value;
}

export const quest_getvalue = (key:number) => {
  let k = clip(key, 0, QUESTVALUE_MAX-1);
  return questvalue[k];
}
