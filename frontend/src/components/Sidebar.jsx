import React from 'react';

export default function Sidebar({
  cameras,
  tags,
  selectedCamera,
  selectedTag,
  onSelectCamera,
  onSelectTag,
  photoCountByCamera,
  photoCountByTag,
  totalCount
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">🐾 林区监测系统</div>

      <div className="sidebar-section">
        <h3>照片筛选</h3>
        <div
          className={`filter-item ${!selectedCamera && !selectedTag ? 'active' : ''}`}
          onClick={() => { onSelectCamera(null); onSelectTag(null); }}
        >
          全部照片
          <span className="count">{totalCount}</span>
        </div>
        <div
          className={`filter-item ${selectedTag === 'untagged' ? 'active' : ''}`}
          onClick={() => { if (selectedTag === 'untagged') onSelectTag(null); else onSelectTag('untagged'); }}
        >
          <span className="tag-dot" style={{ background: '#95a5a6' }} />
          未标注
          <span className="count">{photoCountByTag.untagged || 0}</span>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>按相机</h3>
        {cameras.length === 0 ? (
          <div style={{ padding: '0 20px', fontSize: 13, color: '#95a5a6' }}>暂无相机数据</div>
        ) : cameras.map(cam => (
          <div
            key={cam.id}
            className={`filter-item ${selectedCamera === cam.id ? 'active' : ''}`}
            onClick={() => onSelectCamera(selectedCamera === cam.id ? null : cam.id)}
          >
            📷 {cam.name}
            <span className="count">{photoCountByCamera[cam.id] || 0}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <h3>按物种标签</h3>
        {tags.map(tag => (
          <div
            key={tag.id}
            className={`filter-item ${selectedTag === tag.id ? 'active' : ''}`}
            onClick={() => onSelectTag(selectedTag === tag.id ? null : tag.id)}
          >
            <span className="tag-dot" style={{ background: tag.color }} />
            {tag.name}
            <span className="count">{photoCountByTag[tag.id] || 0}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
