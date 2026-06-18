const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getCameras() {
  return readJSON('cameras.json');
}

function getCameraById(id) {
  return getCameras().find(c => c.id === id);
}

function getTags() {
  return readJSON('tags.json');
}

function getPhotos(options = {}) {
  let photos = readJSON('photos.json');
  const { cameraId, tag } = options;

  if (cameraId) {
    photos = photos.filter(p => p.cameraId === cameraId);
  }
  if (tag) {
    photos = photos.filter(p => p.tags.includes(tag));
  }

  photos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return photos;
}

function getPhotoById(id) {
  return readJSON('photos.json').find(p => p.id === id);
}

function updatePhotoTags(id, tags, notes) {
  const photos = readJSON('photos.json');
  const index = photos.findIndex(p => p.id === id);
  if (index === -1) return null;
  if (Array.isArray(tags)) {
    photos[index].tags = tags;
  }
  if (typeof notes === 'string') {
    photos[index].notes = notes;
  }
  writeJSON('photos.json', photos);
  return photos[index];
}

function addCamera(camera) {
  const cameras = getCameras();
  const newId = `CAM${String(cameras.length + 1).padStart(3, '0')}`;
  const newCamera = {
    id: newId,
    name: camera.name,
    location: camera.location || '',
    description: camera.description || '',
    installedDate: camera.installedDate || new Date().toISOString().split('T')[0]
  };
  cameras.push(newCamera);
  writeJSON('cameras.json', cameras);
  return newCamera;
}

function deleteCamera(id) {
  const cameras = getCameras();
  const filtered = cameras.filter(c => c.id !== id);
  if (filtered.length === cameras.length) return false;
  writeJSON('cameras.json', filtered);
  return true;
}

module.exports = {
  getCameras,
  getCameraById,
  getTags,
  getPhotos,
  getPhotoById,
  updatePhotoTags,
  addCamera,
  deleteCamera
};
