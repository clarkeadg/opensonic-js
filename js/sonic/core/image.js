
import { logfile_message } from "./logfile"
import { video_get_backbuffer } from "./video"

let cache = {};

/* image management */

export const image_create = (width, height) => {
  return video_get_backbuffer().createImageData(width, height);
}

export const image_load = (url) => {
  return new Promise(function (fulfill, reject){
    //console.log('LOADING IMAGE: ',url)
    if (cache[url]) {
      //console.log('cached url',url)
      return fulfill(cache[url]);
    }
    const img = document.createElement("img");
    img.src = url;
    //img.src = url+'?'+d.getTime();
    img.addEventListener("load",function(){
      cache[url] = img;
      return fulfill(img);
    });
  });
}

/* rendering */

export const image_rectfill = (ctx, x1, y1, x2, y2, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x1,y1,x2-x1,y2-y1);
};

export const image_draw = (src, dest, x, y, flags) => {
  dest.putImageData(src, x, y);
};

export const image_blit = (src, dest, source_x, source_y, dest_x, dest_y, width, height) => {
  if (!src || !dest) return false;
  dest.drawImage(
    src,
    source_x,
    source_y,
    width,
    height,
    dest_x,
    dest_y,
    width,
    height
  );
};

export const image_putpixel = (img, dest, x, y, color) => {
  dest.fillStyle = color;
  dest.fillRect(x,y,x+1,y+1);
  //putpixel(img.data, x, y, color);
}

export const image_rgb = (r, g, b) => {
  return "rgb("+r+","+g+","+b+")";
}

export const image_clear = (img, r, g, b) => {
  for (let i=0; i<img.data.length; i+= 4) {
    img.data[i]     = r; // red
    img.data[i+1]   = g; // green
    img.data[i+2]   = b; // blue
  }
}

export const image_pixelperfect_collision = (img1, img2, x1, y1, x2, y2) => {

  // # hack
  return true;

  let i, j;
  //var mask = video.get_maskcolor();

  // optimizing 
  if(img1.width * img1.height > img2.width * img2.height)
    return image_pixelperfect_collision(img2, img1, x2, y2, x1, y1);

  // fast getpixel routine 
  /*switch(video.get_color_depth()) {
      case 8:  fast_getpixel = _getpixel;   break;
      case 16: fast_getpixel = _getpixel16; break;
      case 24: fast_getpixel = _getpixel24; break;
      case 32: fast_getpixel = _getpixel32; break;
      default: fast_getpixel = _getpixel16; break;
  }*/

  // loop 
  /*for(i=0; i<img1.h; i++) { // i-th row 
      for(j=0; j<img1.w; j++) { // j-th col 
          if(fast_getpixel(img1.data, j, i) != mask) {
              // pixel position: (x1+j, y1+i) 
              if(x1+j >= x2 && x1+j < x2+img2.w && y1+i >= y2 && y1+i < y2+img2.h) {
                  if(fast_getpixel(img2.data, x1+j-x2, y1+i-y2) != mask)
                      return true;
              }
          }
      }
  }*/

  /* fail :( */
  return false;
}

export const image_destroy = (img) => {
  if (!img) return;
  
  if(img.data != null) {
    //destroy_bitmap(img.data);
    //img.data = null;
  }

  img = null;
}
