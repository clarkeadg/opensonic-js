import { logfile_message } from "./logfile"
import { resourcemanager_getJsonFile } from "./resourcemanager"

let DEFAULT_LANGUAGE_FILEPATH = "data/languages/english.json";
//let DEFAULT_LANGUAGE_FILEPATH = "data/languages/deutsch.json";
//let DEFAULT_LANGUAGE_FILEPATH = "data/languages/dutch.json";
//let DEFAULT_LANGUAGE_FILEPATH = "data/languages/francais.json";
//let DEFAULT_LANGUAGE_FILEPATH = "data/languages/indonesian.json";
//let DEFAULT_LANGUAGE_FILEPATH = "data/languages/italiano.json";
//let DEFAULT_LANGUAGE_FILEPATH = "data/languages/polish.json";
//let DEFAULT_LANGUAGE_FILEPATH = "data/languages/ptbr.json";

interface strings_t {
  [key: string]: string
}

let strings:strings_t = {};

/**
 * lang_init()
 * Initializes the language module
 */
export const lang_init = (lang:string, cb:Function):void => {
  logfile_message("Initializing the language module");
  //strings = hashtable_stringadapter_t_create(stringadapter_destroy);
  DEFAULT_LANGUAGE_FILEPATH = lang ? lang : DEFAULT_LANGUAGE_FILEPATH;
  lang_loadfile(DEFAULT_LANGUAGE_FILEPATH)
  .then(function(){
    //console.log(langdata)
    //strings = langdata;
    logfile_message("lang_init() ok!");
    cb();
  });
};

/**
 * lang_release()
 * Releases the language module
 */
export const lang_release = ():void => {

};

/**
 * lang_loadfile()
 * Loads a language definition file
 */
export const lang_loadfile = (filepath:string):Promise<strings_t> => {
  return new Promise(function (fulfill, reject){

    logfile_message(`lang_loadfile(\"%s\")... ${filepath}`);

    resourcemanager_getJsonFile(filepath)
    .then(function(data:strings_t){
      strings = data;
      fulfill(data);
    });
  });
};

/**
 * lang_getstring()
 * Retrieves some string from the language definition file
 */
export const lang_getstring = (desired_key:string):string => {
  return strings[desired_key] || desired_key;
};

/**
 * lang_get()
 * Like lang_getstring(), but returns the string as a static char*
 */
export const lang_get = (desired_key:string):string => {
  return lang_getstring(desired_key);
};
