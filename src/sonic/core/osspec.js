
export const osspec_isTouch = () => {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
};

export const osspec_canGamepad = () => {
  if (typeof(navigator) == "undefined") return false;
  return "getGamepads" in navigator;
};
