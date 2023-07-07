
const consoleLog = true;

/*
 * logfile_message()
 * Prints a message on the logfile
 * (printf() format)
 */
export const logfile_message = (msg:string) => {
  if (!consoleLog) return false;
  //if (arguments && arguments.length > 1) {
  //  return console.log(arguments[0],arguments[1]);
  //}
  console.log(msg);    
};   

/*
 * logfile_fatal_error()
 * Prints a fatal error message on the logfile
 * (printf() format)
 */
export const logfile_fatal_error = (msg:string) => {
  if (!consoleLog) return false;
  //if (arguments.length > 1) {
  //  return console.log('FATAL ERROR',arguments[0],arguments[1]);
  //}
  console.log('FATAL ERROR', msg);    
}; 