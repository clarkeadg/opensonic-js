
/*
 * osspec_isTouch()
 * Check if device has touch screen
 */
export const osspec_isTouch = ():boolean => {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
};

/*
 * osspec_canGamepad()
 * Check if device has a gamepad
 */
export const osspec_canGamepad = ():boolean => {
  if (typeof(navigator) == "undefined") return false;
  return "getGamepads" in navigator;
};
