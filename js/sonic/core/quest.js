
import { DATA_ROOT } from "./global"
import { image_load } from "./image"
import { logfile_message } from "./logfile"
import { resourcemanager_getJsonFile } from "./resourcemanager"

const QUEST_MAXLEVELS   = 1024;
const QUESTIMAGE_WIDTH  = 100;
const QUESTIMAGE_HEIGHT = 75;

export const quest_load = (abs_path) => {

  return new Promise(function (fulfill, reject){
    let q = {};

    logfile_message("load_quest('%s')", abs_path);

    /* default values */
    q.file = abs_path;
    q.name = "";
    q.author = "";
    q.version = "";
    q.description = "";
    q.image = null;
    q.level_count = 0;
    q.show_ending = false;

    resourcemanager_getJsonFile(abs_path)
    .then(traverse_quest)
    .then(function(questdata){

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

export const quest_unload = (qst) => {
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

const load_quest_image = (file) => {
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

const traverse_quest = (data) => {
  return new Promise(function (fulfill, reject){
    let q = {};

    q.name = data.name || "";
    q.author = data.author || "Open Sonic";
    q.version = data.version || "0";
    q.description = data.description || "";
    q.show_ending = data.show_ending || false;
    q.level_count = data.levels ? data.levels.length : 0;
    q.level_path = data.levels || [];

    load_quest_image(data.image)
    .then(function(thumb) {
      q.image = thumb;
      fulfill(q);
    });
  });
}
