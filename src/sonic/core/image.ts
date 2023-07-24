
import { logfile_message } from "./logfile"
import { v2d_t } from "./v2d"
import { spriteframe_t } from "./sprite";
import { video_buffer_t, video_get_backbuffer } from "./video"

export const IF_NONE = 0;
export const IF_HFLIP = 1;
export const IF_VFLIP = 2;

export interface image_t extends ImageData {}

interface cache_t {
  [key: string]: HTMLImageElement
}

let cache:cache_t = {};

/* image management */

/**
 * image_create()
 * Creates a new image of a given size
 */
export const image_create = (width:number, height:number) => {
  return video_get_backbuffer().createImageData(width, height);
}

/**
 * image_load()
 * Loads a image from a file.
 * Supported types: PNG, JPG, BMP, PCX, TGA
 */
export const image_load = (url:string) => {
  return new Promise(function (fulfill, reject){
    if (cache[url]) {
      return fulfill(cache[url]);
    }
    const img = document.createElement("img");
    img.src = url;
    img.addEventListener("load",function(){
      cache[url] = img;
      return fulfill(img);
    });
  });
}

/* rendering */

/**
 * image_rectfill()
 * Draws a filled rectangle
 */
export const image_rectfill = (ctx:video_buffer_t, x1:number, y1:number, x2:number, y2:number, color:string) => {
  ctx.fillStyle = color;
  ctx.fillRect(x1,y1,x2-x1,y2-y1);
};

/**
 * image_draw()
 * Draws an image onto the destination surface
 * at the specified position
 */
export const image_draw = (src:spriteframe_t, dest:video_buffer_t, x:number, y:number, flags:number) => {
  dest.drawImage(
    src.data,
    src.sx, // The x coordinate where to start clipping
    src.sy, //  The y coordinate where to start clipping
    src.swidth, // The width of the clipped image
    src.sheight, // The height of the clipped image
    x, // The x coordinate where to place the image on the canvas
    y, // The y coordinate where to place the image on the canvas
    src.swidth, // The width of the image to use (stretch or reduce the image)
    src.sheight // The height of the image to use (stretch or reduce the image)
  );
};

/*
 * image_draw_scaled()
 * Draws a scaled image onto the destination surface
 * at the specified position
 *
 * scale: (1.0, 1.0) is the original size
 *        (2.0, 2.0) stands for a double-sized image
 *        (0.5, 0.5) stands for a smaller image
 */
export const image_draw_scaled = (src:spriteframe_t, dest:video_buffer_t, x:number, y:number, scale:v2d_t, flags:number) => {
  dest.drawImage(
    src.data,
    src.sx, // The x coordinate where to start clipping
    src.sy, //  The y coordinate where to start clipping
    src.swidth, // The width of the clipped image
    src.sheight, // The height of the clipped image
    x, // The x coordinate where to place the image on the canvas
    y, // The y coordinate where to place the image on the canvas
    ~~(src.swidth*scale.x), // The width of the image to use (stretch or reduce the image)
    ~~(src.sheight*scale.y)// The height of the image to use (stretch or reduce the image)
  );
};

/**
 * image_blit()
 * Blits a surface onto another
 */
export const image_blit = (src:CanvasImageSource, dest:video_buffer_t, source_x:number, source_y:number, dest_x:number, dest_y:number, width:number, height:number) => {
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

/**
 * image_putpixel()
 * Plots a pixel into the given image
 */
export const image_putpixel = (img:image_t, dest:video_buffer_t, x:number, y:number, color:string) => {
  dest.fillStyle = color;
  dest.fillRect(x,y,x+1,y+1);
  //putpixel(img.data, x, y, color);
}

/*
 * image_line()
 * Draws a line from (x1,y1) to (x2,y2) using the specified color
 */
export const image_line = (ctx:video_buffer_t, x1:number, y1:number, x2:number, y2:number, color:string) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  // Draw the Path
  ctx.stroke();
}

/**
 * image_rgb()
 * Generates an uint32 color
 */
export const image_rgb = (r:number, g:number, b:number) => {
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * image_clear()
 * Clears an given image with some color
 */
export const image_clear = (img:image_t, r:number, g:number, b:number) => {
  for (let i=0; i<img.data.length; i+= 4) {
    img.data[i]     = r; // red
    img.data[i+1]   = g; // green
    img.data[i+2]   = b; // blue
  }
}

/**
 * image_pixelperfect_collision()
 * Pixel perfect collision detection
 */
export const image_pixelperfect_collision = (img1:HTMLImageElement, img2:HTMLImageElement, x1:number, y1:number, x2:number, y2:number):boolean => {

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

/**
 * image_destroy()
 * Destroys an image. This is called automatically
 * while unloading the resource manager.
 */
export const image_destroy = (img:image_t) => {
  if (!img) return;
  
  //if(img.data != null) {
    //destroy_bitmap(img.data);
    //img.data = null;
  //}

  img = null;
}

/**
 * imagedata_to_image()
 * Converts ImageData to ImageHTMLElement
 */
export const imagedata_to_image = (imagedata:ImageData) => {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = imagedata.width;
  canvas.height = imagedata.height;
  ctx.putImageData(imagedata, 0, 0);

  var image = new Image();
  image.src = canvas.toDataURL();
  return image;
}
