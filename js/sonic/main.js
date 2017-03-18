
import { engine_init } from "./core/engine"

engine_init({
  Xvideo_resolution: "TINY", // TINY NORMAL MAX
  Xsmooth_graphics: false,   // true false
  Xfullscreen: false,        // true false
  Xshow_fps: true,           // true false
  Xcolor_depth: 32,          // 8 16 24 32
  Xlevel: null,              // filepath
  Xlevel: "data/levels/blue_ocean_3.json",
  Xquest: null,              // filepath
  Xquest: "data/quests/tutorial.json", // this is not done
  Xlanguage: null,           // filepath
  Xlanguage: "data/languages/italiano.json"
});
