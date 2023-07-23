import { DATA_ROOT } from "./global"
import { data_quest_t } from "./data"
import { image_t, image_load } from "./image"
import { logfile_message } from "./logfile"
import { resourcemanager_getJsonFile } from "./resourcemanager"

const QUEST_MAXLEVELS   = 1024;
const QUESTIMAGE_WIDTH  = 100;
const QUESTIMAGE_HEIGHT = 75;

export interface quest_t {
  file: string,
  name: string,
  author: string,
  version: string,
  description: string,
  image: HTMLImageElement,
  level_count: number
  levels: string[],
  level_path: string[],
  show_ending: boolean
}

/*
 * load_quest()
 * Loads and returns a quest from a file
 * (abs_path must be an ABSOLUTE path)
 */
export const quest_load = async (abs_path:string):Promise<quest_t> => {
  logfile_message(`quest_load("${abs_path}")`); 

  const data = await resourcemanager_getJsonFile(abs_path);
  const questdata = await traverse_quest(<data_quest_t>data);

  /* success! */
  logfile_message("load_quest() ok!");

  return questdata;
}

/*
 * unload_quest()
 * Unloads a quest
 */
export const quest_unload = (qst:quest_t):null => {
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
const load_quest_image = async (file:string) => {
  const no_image = "data/images/null.png";
  let s = file ? file : no_image;
  s = DATA_ROOT + s;

  const img = await image_load(s);
  return img;
}

/* interprets a statement from a .json file */
const traverse_quest = async (data:data_quest_t) => {
  const q:quest_t = {
    file: "",
    name: data.name || "",
    author: data.author || "Open Sonic",
    version: data.version || "0",
    description: data.description || "",
    show_ending: data.show_ending || false,
    image: null,
    levels: data.levels || [],
    level_count: data.levels ? data.levels.length : 0,
    level_path: data.levels || []
  };
  const thumb = await load_quest_image(data.image);
  q.image = <HTMLImageElement>thumb;
  return(q);
}
