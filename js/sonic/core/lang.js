
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

let strings = {};

export const lang_init = (lang, cb) => {
  logfile_message("Initializing the language module");
  //strings = hashtable_stringadapter_t_create(stringadapter_destroy);
  DEFAULT_LANGUAGE_FILEPATH = lang ? lang : DEFAULT_LANGUAGE_FILEPATH;
  lang_loadfile(DEFAULT_LANGUAGE_FILEPATH)
  .then(function(langdata){
    console.log(langdata)
    //strings = langdata;
    logfile_message("lang_init() ok!");
    cb();
  });
};

export const lang_release = () => {

};

export const lang_loadfile = (filepath) => {
  return new Promise(function (fulfill, reject){

    logfile_message("lang_loadfile(\"%s\")...", filepath);

    resourcemanager_getJsonFile(filepath)
    .then(function(data){
      strings = data;
      fulfill(data);
    });
  });
};

export const lang_getstring = (desired_key, str, str_size) => {
  return strings[desired_key] || desired_key;
};

export const lang_get = (desired_key) => {
  return lang_getstring(desired_key);
};
