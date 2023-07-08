
import { DATA_ROOT } from "./global"
import { image_load } from "./image"
import { logfile_message } from "./logfile"
import { resourcemanager_getJsonFile } from "./resourcemanager"

const QUEST_MAXLEVELS   = 1024;
const QUESTIMAGE_WIDTH  = 100;
const QUESTIMAGE_HEIGHT = 75;

interface quest_t {
  file:string,
  name:string,
  author:string,
  version:string,
  description:string,
  image:string,
  level_count:number
  levels: string[],
  level_path: string[],
  show_ending:boolean
}

/*
 * load_quest()
 * Loads and returns a quest from a file
 * (abs_path must be an ABSOLUTE path)
 */
export const quest_load = (abs_path:string):Promise<quest_t> => {

  return new Promise(function (fulfill, reject){
    let q:quest_t = {
      file: abs_path,
      name: "",
      author: "",
      version: "",
      description: "",
      image: null,
      level_count: 0,
      levels: [],
      level_path: [],
      show_ending: false
    };

    logfile_message(`quest_load('%s') ${abs_path}`);

    /* default values */
    

    resourcemanager_getJsonFile(abs_path)
    .then(traverse_quest)
    .then(function(questdata:quest_t ){

      if (questdata) {
        q = questdata;
      }

      /* success! */
      logfile_message("load_quest() ok!");
      //console.log(q)

      fulfill(q);
    });

   });
}

/*
 * unload_quest()
 * Unloads a quest
 */
export const quest_unload = ():null => {
  /*qst.file = null;
  qst.name = null;
  qst.author = null;
  qst.version = null;
  qst.description = null;

  for(i=0; i<qst.level_count; i++)
    qst.level_path[i] = null;

  image.destroy(qst.image);
  qst = null;*/
  return null;
}

/* returns the quest image */
const load_quest_image = (file:string) => {
  return new Promise(function (fulfill, reject){

    const no_image = "data/images/null.png";
    let s = file ? file : no_image;
    s = DATA_ROOT + s;

    image_load(s)
    .then(function(img){
      fulfill(img);
    });
  });
}

/* interprets a statement from a .json file */
const traverse_quest = (data:quest_t) => {
  return new Promise(function (fulfill, reject){
    let q:quest_t = {
      file: "",
      name: data.name || "",
      author: data.author || "Open Sonic",
      version: data.version || "0",
      description: data.description || "",
      show_ending: data.show_ending || false,
      image: "",
      levels: data.levels || [],
      level_count: data.levels ? data.levels.length : 0,
      level_path: data.levels || []
    };

    load_quest_image(data.image)
    .then(function(thumb:string) {
      q.image = thumb;
      fulfill(q);
    });
  });
}
