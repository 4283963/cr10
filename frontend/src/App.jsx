import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getCameras, getTags, getPhotos, updatePhotoTags } from './api';
import Sidebar from './components/Sidebar.jsx';
import PhotoGrid from './components/PhotoGrid.jsx';
import PhotoModal from './components/PhotoModal.jsx';

export default function App() {
  const [cameras, setCameras] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [modalPhotoId, setModalPhotoId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [camerasData, tagsData, photosData] = await Promise.all([
        getCameras(),
        getTags(),
        getPhotos()
      ]);
      setCameras(camerasData);
      setTags(tagsData);
      setAllPhotos(photosData);
    } catch (e) {
      console.error('加载数据失败', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPhotos = useMemo(() => {
    let result = allPhotos;
    if (selectedCamera) {
      result = result.filter(p => p.cameraId === selectedCamera);
    }
    if (selectedTag) {
      result = result.filter(p => p.tags.includes(selectedTag));
    }
    return result;
  }, [allPhotos, selectedCamera, selectedTag]);

  const photoCountByCamera = useMemo(() => {
    const map = {};
    allPhotos.forEach(p => {
      map[p.cameraId] = (map[p.cameraId] || 0) + 1;
    });
    return map;
  }, [allPhotos]);

  const photoCountByTag = useMemo(() => {
    const map = { untagged: 0 };
    allPhotos.forEach(p => {
      if (p.tags.length === 0) {
        map.untagged = (map.untagged || 0) + 1;
      }
      p.tags.forEach(t => {
        map[t] = (map[t] || 0) + 1;
      });
    });
    return map;
  }, [allPhotos]);

  const stats = useMemo(() => ({
    total: allPhotos.length,
    tagged: allPhotos.filter(p => p.tags.length > 0).length,
    untagged: allPhotos.filter(p => p.tags.length === 0).length,
    cameraCount: new Set(allPhotos.map(p => p.cameraId)).size
  }), [allPhotos]);

  const handleUpdateTags = async (id, newTags, notes) => {
    const updated = await updatePhotoTags(id, newTags, notes);
    setAllPhotos(prev => prev.map(p => (p.id === id ? { ...p, ...updated } : p)));
    return updated;
  };

  return (
    <div className="app">
      <Sidebar
        cameras={cameras}
        tags={tags}
        selectedCamera={selectedCamera}
        selectedTag={selectedTag}
        onSelectCamera={(id) => { setSelectedCamera(id); setSelectedTag(null); }}
        onSelectTag={(id) => { setSelectedTag(id); setSelectedCamera(null); }}
        photoCountByCamera={photoCountByCamera}
        photoCountByTag={photoCountByTag}
        totalCount={allPhotos.length}
      />
      <div className="main-content">
        <div className="topbar">
          <h1>野生动物红外相机照片库</h1>
          <div className="stats">
            <span>照片总数<strong>{stats.total}</strong></span>
            <span>已标注<strong>{stats.tagged}</strong></span>
            <span>未标注<strong>{stats.untagged}</strong></span>
          </div>
        </div>
        <div className="photo-grid-container">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <PhotoGrid
              photos={filteredPhotos}
              tags={tags}
              cameras={cameras}
              onPhotoClick={(id) => setModalPhotoId(id)}
            />
          )}
        </div>
      </div>
      {modalPhotoId && (
        <PhotoModal
          photoId={modalPhotoId}
          tags={tags}
          cameras={cameras}
          onClose={() => setModalPhotoId(null)}
          onUpdateTags={handleUpdateTags}
        />
      )}
    </div>
  );
}
