const express = require('express');
const cors = require('cors');
const path = require('path');
const store = require('./dataStore');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/cameras', (req, res) => {
  res.json(store.getCameras());
});

app.get('/api/cameras/:id', (req, res) => {
  const camera = store.getCameraById(req.params.id);
  if (!camera) {
    return res.status(404).json({ error: 'Camera not found' });
  }
  res.json(camera);
});

app.post('/api/cameras', (req, res) => {
  const { name, location, description, installedDate } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const camera = store.addCamera({ name, location, description, installedDate });
  res.status(201).json(camera);
});

app.delete('/api/cameras/:id', (req, res) => {
  const deleted = store.deleteCamera(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Camera not found' });
  }
  res.json({ success: true });
});

app.get('/api/tags', (req, res) => {
  res.json(store.getTags());
});

app.get('/api/photos', (req, res) => {
  const { cameraId, tag } = req.query;
  res.json(store.getPhotos({ cameraId, tag }));
});

app.get('/api/photos/:id', (req, res) => {
  const photo = store.getPhotoById(req.params.id);
  if (!photo) {
    return res.status(404).json({ error: 'Photo not found' });
  }
  const camera = store.getCameraById(photo.cameraId);
  res.json({ ...photo, camera: camera || null });
});

app.put('/api/photos/:id/tags', (req, res) => {
  const { tags, notes } = req.body;
  const photo = store.updatePhotoTags(req.params.id, tags, notes);
  if (!photo) {
    return res.status(404).json({ error: 'Photo not found' });
  }
  res.json(photo);
});

app.get('/api/stats/time-slots', (req, res) => {
  const { cameraId } = req.query;
  res.json(store.getPhotoStatsByTimeSlot(cameraId));
});

app.listen(PORT, () => {
  console.log(`野生动物照片管理系统后端服务已启动: http://localhost:${PORT}`);
  console.log(`API 根路径: http://localhost:${PORT}/api`);
});
