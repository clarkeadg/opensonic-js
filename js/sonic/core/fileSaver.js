
export const fileSaver_saveAs = ((view => {
  // IE <10 is explicitly unsupported
  if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
    return;
  }

  const doc = view.document;

  const get_URL = () => view.URL || view.webkitURL || view;
  const save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a");
  const can_use_save_link = "download" in save_link;

  const click = node => {
    const event = new MouseEvent("click");
    node.dispatchEvent(event);
  };

  const is_safari = /constructor/i.test(view.HTMLElement) || view.safari;
  const is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent);

  const throw_outside = ex => {
    (view.setImmediate || view.setTimeout)(() => {
      throw ex;
    }, 0);
  };

  const // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
    force_saveable_type = "application/octet-stream";

  const // in ms
    arbitrary_revoke_timeout = 1000 * 40;

  const revoke = file => {
    const revoker = () => {
      if (typeof file === "string") { // file is an object URL
        get_URL().revokeObjectURL(file);
      } else { // file is a File
        file.remove();
      }
    };
    setTimeout(revoker, arbitrary_revoke_timeout);
  };

  const dispatch = (filesaver, event_types, event) => {
    event_types = [].concat(event_types);
    let i = event_types.length;
    while (i--) {
      const listener = filesaver[`on${event_types[i]}`];
      if (typeof listener === "function") {
        try {
          listener.call(filesaver, event || filesaver);
        } catch (ex) {
          throw_outside(ex);
        }
      }
    }
  };

  const auto_bom = blob => {
    // prepend BOM for UTF-8 XML and text/* types (including HTML)
    // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
    if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(0xFEFF), blob], {
        type: blob.type
      });
    }
    return blob;
  };

  const FileSaver = function(blob, name, no_auto_bom) {
    if (!no_auto_bom) {
      blob = auto_bom(blob);
    }

    // First try a.download, then web filesystem, then object URLs
    const filesaver = this;

    const type = blob.type;
    const force = type === force_saveable_type;
    let object_url;

    const // on any filesys errors revert to saving with object URLs
      dispatch_all = () => {
        dispatch(filesaver, "writestart progress write writeend".split(" "));
      };

    const fs_error = () => {
      if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
        // Safari doesn't allow downloading of blob urls
        const reader = new FileReader();
        reader.onloadend = () => {
          let url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
          const popup = view.open(url, '_blank');
          if (!popup) view.location.href = url;
          url = undefined; // release reference before dispatching
          filesaver.readyState = filesaver.DONE;
          dispatch_all();
        };
        reader.readAsDataURL(blob);
        filesaver.readyState = filesaver.INIT;
        return;
      }
      // don't create more object URLs than needed
      if (!object_url) {
        object_url = get_URL().createObjectURL(blob);
      }
      if (force) {
        view.location.href = object_url;
      } else {
        const opened = view.open(object_url, "_blank");
        if (!opened) {
          // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
          view.location.href = object_url;
        }
      }
      filesaver.readyState = filesaver.DONE;
      dispatch_all();
      revoke(object_url);
    };

    filesaver.readyState = filesaver.INIT;

    if (can_use_save_link) {
      object_url = get_URL().createObjectURL(blob);
      setTimeout(() => {
        save_link.href = object_url;
        save_link.download = name;
        click(save_link);
        dispatch_all();
        revoke(object_url);
        filesaver.readyState = filesaver.DONE;
      });
      return;
    }

    fs_error();
  };

  const FS_proto = FileSaver.prototype;
  const saveAs = (blob, name, no_auto_bom) => new FileSaver(blob, name || blob.name || "download", no_auto_bom);
  // IE 10+ (native saveAs)
  if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
    return (blob, name, no_auto_bom) => {
      name = name || blob.name || "download";

      if (!no_auto_bom) {
        blob = auto_bom(blob);
      }
      return navigator.msSaveOrOpenBlob(blob, name);
    };
  }

  FS_proto.abort = () => {};
  FS_proto.readyState = FS_proto.INIT = 0;
  FS_proto.WRITING = 1;
  FS_proto.DONE = 2;

  FS_proto.error =
    FS_proto.onwritestart =
    FS_proto.onprogress =
    FS_proto.onwrite =
    FS_proto.onabort =
    FS_proto.onerror =
    FS_proto.onwriteend =
    null;

  return saveAs;
})(
  typeof self !== "undefined" && self ||
  typeof window !== "undefined" && window ||
  this.content
));
