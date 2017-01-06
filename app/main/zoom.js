import { webContents } from 'electron';

const MAX_ZOOM_LEVEL = 2;
const MIN_ZOOM_LEVEL = -2;
const ZOOM_LEVEL_STEP = 0.5;

function getZoomLevel(fn) {
  webContents.getFocusedWebContents().getZoomLevel(fn);
}

function setZoomLevel(zoom) {
  if (zoom > MAX_ZOOM_LEVEL) {
    zoom = MAX_ZOOM_LEVEL;
  }
  if (zoom < MIN_ZOOM_LEVEL) {
    zoom = MIN_ZOOM_LEVEL;
  }
  webContents.getFocusedWebContents().setZoomLevel(zoom);
}

function zoomIn() {
  getZoomLevel(level => setZoomLevel(level + ZOOM_LEVEL_STEP));
}

function zoomOut() {
  getZoomLevel(level => setZoomLevel(level - ZOOM_LEVEL_STEP));
}

function reset() {
  setZoomLevel(0);
}

export default {
  zoomIn,
  zoomOut,
  reset,
};
