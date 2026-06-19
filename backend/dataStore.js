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

function getTimeSlot(hour) {
  if (hour >= 0 && hour < 6) return 'dawn';
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}

function getPhotoStatsByTimeSlot(cameraId) {
  const photos = readJSON('photos.json');
  const tags = readJSON('tags.json');

  const filtered = cameraId
    ? photos.filter(p => p.cameraId === cameraId)
    : photos;

  const timeSlots = {
    dawn: { label: '凌晨 (00:00-06:00)', startHour: 0 },
    morning: { label: '上午 (06:00-12:00)', startHour: 6 },
    afternoon: { label: '下午 (12:00-18:00)', startHour: 12 },
    night: { label: '夜间 (18:00-24:00)', startHour: 18 }
  };

  const stats = {};
  Object.keys(timeSlots).forEach(slot => {
    stats[slot] = {
      slotKey: slot,
      label: timeSlots[slot].label,
      total: 0,
      byTag: {}
    };
    tags.forEach(tag => {
      stats[slot].byTag[tag.id] = { tag, count: 0 };
    });
  });

  filtered.forEach(photo => {
    const d = new Date(photo.timestamp);
    const slot = getTimeSlot(d.getHours());
    if (!stats[slot]) return;

    stats[slot].total += 1;

    if (photo.tags && photo.tags.length > 0) {
      photo.tags.forEach(tagId => {
        if (stats[slot].byTag[tagId]) {
          stats[slot].byTag[tagId].count += 1;
        }
      });
    }
  });

  const timeSlotOrder = ['dawn', 'morning', 'afternoon', 'night'];
  const result = timeSlotOrder.map(slot => ({
    slotKey: stats[slot].slotKey,
    label: stats[slot].label,
    total: stats[slot].total,
    byTag: Object.values(stats[slot].byTag)
  }));

  const tagSummary = {};
  tags.forEach(tag => {
    tagSummary[tag.id] = { tag, count: 0 };
  });
  filtered.forEach(photo => {
    if (photo.tags) {
      photo.tags.forEach(tagId => {
        if (tagSummary[tagId]) {
          tagSummary[tagId].count += 1;
        }
      });
    }
  });

  return {
    cameraId: cameraId || null,
    totalPhotos: filtered.length,
    timeSlots: result,
    tagSummary: Object.values(tagSummary).filter(t => t.count > 0)
  };
}

module.exports = {
  getCameras,
  getCameraById,
  getTags,
  getPhotos,
  getPhotoById,
  updatePhotoTags,
  addCamera,
  deleteCamera,
  getPhotoStatsByTimeSlot
};
