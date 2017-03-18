
const consoleLog = true;

export const logfile_message = (msg) => {
  if (!consoleLog) return false;
  if (arguments.length > 1) {
    return console.log(arguments[0],arguments[1]);
  }
  console.log(msg);    
};   

export const logfile_fatal_error = (msg) => {
  if (!consoleLog) return false;
  if (arguments.length > 1) {
    return console.log('FATAL ERROR',arguments[0],arguments[1]);
  }
  console.log('FATAL ERROR',msg);    
}; 