import React from 'react';

function formatDate(ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PhotoGrid({ photos, tags, cameras, onPhotoClick }) {
  const tagMap = React.useMemo(() => {
    const m = {};
    tags.forEach(t => (m[t.id] = t));
    return m;
  }, [tags]);

  const cameraMap = React.useMemo(() => {
    const m = {};
    cameras.forEach(c => (m[c.id] = c));
    return m;
  }, [cameras]);

  if (photos.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
        <div>暂无符合条件的照片</div>
      </div>
    );
  }

  return (
    <div className="photo-grid">
      {photos.map(photo => (
        <div key={photo.id} className="photo-card" onClick={() => onPhotoClick(photo.id)}>
          <div className="photo-card-tags">
            {photo.tags.map(tagId => {
              const tag = tagMap[tagId];
              if (!tag) return null;
              return (
                <span key={tagId} className="photo-tag" style={{ background: tag.color }}>
                  {tag.name}
                </span>
              );
            })}
          </div>
          <img src={photo.url} alt={photo.id} loading="lazy" />
          <div className="photo-card-info">
            <div className="photo-card-time">{formatDate(photo.timestamp)}</div>
            <div className="photo-card-camera">
              {cameraMap[photo.cameraId] ? cameraMap[photo.cameraId].name : photo.cameraId}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
