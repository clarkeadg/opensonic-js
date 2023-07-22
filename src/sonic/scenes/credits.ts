
import { v2d_new } from "./../core/v2d"
import { INFINITY } from "./../core/global"
import { video_get_backbuffer, video_clearDisplay, video_fadefx_over, video_fadefx_is_fading, video_fadefx_in, video_fadefx_out, VIDEO_SCREEN_W, VIDEO_SCREEN_H } from "./../core/video"
import { music_load, music_play, music_is_playing, sound_play } from "./../core/audio"
import { lang_get } from "./../core/lang"
import { input_t, input_destroy, input_button_pressed, input_create_user, IB_FIRE3, IB_FIRE4 } from "./../core/input"
import { image_destroy, image_rgb, image_create } from "./../core/image"
import { timer_get_delta, timer_get_ticks } from "./../core/timer"
import { scenestack_pop } from "./../core/scene"
import { soundfactory_get } from "./../core/soundfactory"
import { font_t, font_destroy, font_render, font_set_width, font_get_charsize, font_get_charspacing, font_set_text, font_get_text, font_create } from "./../entities/font"
import { bgtheme_t, background_unload, background_render_fg, background_render_bg, background_update, background_load } from "./../entities/background"

let credits_text = [
  "<color=ffff00>$CREDITS_ENGINE</color>\n\n",

  "<color=ffff00>$CREDITS_ACTIVE</color>\n\n",

  "Alexandre Martins:\n$CREDITS_ALEXANDRE\n\n",

  "Di Rodrigues:\n$CREDITS_DI\n\n",

  "Colin:\n$CREDITS_COLIN\n\n",

  "Mateus Reis:\n$CREDITS_MATEUSREIS\n\n",

  "Christopher Martinus:\n$CREDITS_CHRISTOPHER\n\n",

  "Celdecea:\n$CREDITS_CELDECEA\n\n",

  "Christian Zigotzky:\n$CREDITS_XENO\n\n",

  "Joepotato28:\n$CREDITS_JOE\n\n",

  "Arthur Blot:\n$CREDITS_ARTHURBLOT\n\n",

  "Reimund Renner:\n$CREDITS_REIMUND\n\n",

  "Szymon Weihs:\n$CREDITS_SZYMON\n\n",

  "Tomires:\n$CREDITS_TOMIRES\n\n",

  "Sascha de waal:\n$CREDITS_SSDW\n\n",

  "Francesco Sciusco:\n$CREDITS_FRANCESCO\n\n",

  "<color=ffff00>$CREDITS_THANKS</color>\n\n",

  "SourceForge.net\n",
  "allegro.cc\n",
  "OpenGameArt.org\n",
  "GagaGames.com.br\n",
  "Rsonist88\n",
  "PlayDeb.net\n\n",

  "<color=ffff00>$CREDITS_RETIRED</color>\n\n",

  "Neoblast:\n$CREDITS_NEOBLAST\n\n",

  "Bastian von Halem:\n$CREDITS_BASTIAN\n\n",

  "Lainz:\n$CREDITS_LAINZ\n\n",

  "Jogait:\n$CREDITS_JOGAIT\n\n"
]

const CREDITS_BGFILE       = "data/themes/credits.bg.json";
const OPTIONS_MUSICFILE    = "data/music/options.mp4";

let box:ImageData;
let quit = false;
let title:font_t;
let text:font_t;
let back:font_t;
let input:input_t;
let line_count = 0;
let bgtheme:bgtheme_t;

/**
 * credits_init()
 * Initializes the scene
 */
export const credits_init = () => {
  let p;

  /* initializing stuff... */
  quit = false;
  input = input_create_user();

  title = font_create(4);
  //console.log(title)
  font_set_text(title, lang_get("CREDITS_TITLE"));
  //title.position.x = (VIDEO_SCREEN_W - strlen(font_get_text(title))*font_get_charsize(title).x)/2;
  //title.position.x = (VIDEO_SCREEN_W - font_get_text(title).length*font_get_charsize(title).x)/2;
  title.position.x = (VIDEO_SCREEN_W/2) - 100;
  title.position.y = 5;

  back = font_create(8);
  font_set_text(back, lang_get("CREDITS_KEY"));
  back.position.x = 10;
  back.position.y = VIDEO_SCREEN_H - font_get_charsize(back).y - 5;

  text = font_create(8);
  //console.log(credits_text)

  for(let i=0; i<credits_text.length; i++ ) {
    let msg = credits_text[i];
    let textVariables = msg.match(/\$[A-Z_\d]\w+/m);
    if (textVariables) {
      for(let i2=0;i2<textVariables.length;i2++) {
        let t = textVariables[i2].slice(1);
        let t2 = lang_get(t);
        if (t2) {
          msg = msg.replace('$'+t, t2);
        }
      }
      credits_text[i] = msg;
    }
  }
  //console.log(credits_text)
  font_set_text(text, credits_text.join(""), "%s");
  font_set_width(text, 300);
  text.position.x = 10;
  text.position.y = VIDEO_SCREEN_H;
  line_count = 1;
  let myText = font_get_text(text);
  //console.log(myText)
  for(let i = 0; i<myText.length;i++) {
    if (myText[i] == '\n') {
      line_count++;
    }
  }
  line_count+=10;

  box = image_create(VIDEO_SCREEN_W, 30);
  //image_clear(box, image_rgb(0,0,0));

  background_load(CREDITS_BGFILE)
  .then(function(bgdata:bgtheme_t){
    bgtheme = bgdata;
    //console.log(bgtheme);
    video_fadefx_in(image_rgb(0,0,0), 1.0);
  });

  video_fadefx_in(image_rgb(0,0,0), 1.0);
}

/**
 * credits_update()
 * Updates the scene
 */
export const credits_update = () => {
  const dt = timer_get_delta();

  /* background movement */
  background_update(bgtheme);

  /* text movement */
  text.position.y -= (3*font_get_charsize(text).y) * dt;
  if(text.position.y < -(line_count * (font_get_charsize(text).y + font_get_charspacing(text).y)))
    text.position.y = VIDEO_SCREEN_H;

  /* quit */
  if(!quit && !video_fadefx_is_fading()) {
    if(input_button_pressed(input, IB_FIRE3)) {
      sound_play( soundfactory_get("select") );
      quit = true;
    }
    else if(input_button_pressed(input, IB_FIRE4)) {
      sound_play( soundfactory_get("return") );
      quit = true;
    }
  }

  /* music */
  if(!music_is_playing()) {
    const m = music_load(OPTIONS_MUSICFILE);
    music_play(m, true);
  }

  /* fade-out */
  if(quit) {
    if(video_fadefx_over()) {
      scenestack_pop();
      return;
    }
    video_fadefx_out(image_rgb(0,0,0), 1.0);
  }
}

/**
 * credits_render()
 * Renders the scene
 */
export const credits_render = () => {
  video_clearDisplay();

  const cam = v2d_new(VIDEO_SCREEN_W/2, VIDEO_SCREEN_H/2);

  background_render_bg(bgtheme, cam);
  background_render_fg(bgtheme, cam);

  font_render(text, cam);
  video_get_backbuffer().fillRect(0,0,box.width,box.height);
  video_get_backbuffer().fillRect(0,VIDEO_SCREEN_H-20,box.width,box.height);
  font_render(title, cam);
  font_render(back, cam);
}

/**
 * credits_release()
 * Releases the scene
 */
export const credits_release = () => {
  bgtheme = background_unload(bgtheme);
  image_destroy(box);

  font_destroy(title);
  font_destroy(text);
  font_destroy(back);

  input_destroy(input);
}
