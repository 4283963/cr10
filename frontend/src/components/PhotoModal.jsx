import React, { useEffect, useState } from 'react';
import { getPhotoDetail } from '../api';

function formatDate(ts) {
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function PhotoModal({ photoId, tags, cameras, onClose, onUpdateTags }) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (!photoId) {
      setLoading(false);
      setError('照片编号缺失');
      return;
    }
    setLoading(true);
    setError(null);
    setPhoto(null);
    setImgError(false);
    getPhotoDetail(photoId)
      .then(data => {
        if (!data) {
          throw new Error('照片数据为空');
        }
        setPhoto(data);
        setSelectedTags(Array.isArray(data.tags) ? data.tags : []);
        setNotes(typeof data.notes === 'string' ? data.notes : '');
      })
      .catch(err => {
        console.error('加载照片详情失败:', err);
        setError(err.message || '加载照片详情失败');
      })
      .finally(() => setLoading(false));
  }, [photoId]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await onUpdateTags(photoId, selectedTags, notes);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 1500);
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const photoUrl = photo && photo.url && !imgError ? photo.url : null;

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="loading" style={{ width: '100%' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            正在加载照片详情...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="empty-state" style={{ width: '100%' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 16, marginBottom: 6 }}>加载失败</div>
            <div style={{ fontSize: 13, color: '#e74c3c' }}>{error}</div>
            <button
              onClick={onClose}
              style={{ marginTop: 20, padding: '8px 20px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <button className="modal-close" onClick={onClose}>×</button>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-image-wrapper">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={photo.id || '照片'}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={{ color: '#95a5a6', textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 60, marginBottom: 12 }}>🖼️</div>
              <div>{imgError ? '图片加载失败' : '暂无图片'}</div>
            </div>
          )}
        </div>
        <div className="modal-sidebar">
          <div className="info-row">
            <div className="info-label">照片编号</div>
            <div className="info-value">{photo.id}</div>
          </div>

          <div className="info-row">
            <div className="info-label">拍摄时间</div>
            <div className="info-value">{formatDate(photo.timestamp)}</div>
          </div>

          <div className="info-row">
            <div className="info-label">相机编号</div>
            <div className="info-value">{photo.cameraId}</div>
          </div>

          {photo.camera && (
            <>
              <div className="info-row">
                <div className="info-label">相机点位</div>
                <div className="info-value">{photo.camera.name}</div>
              </div>
              <div className="info-row">
                <div className="info-label">安装位置</div>
                <div className="info-value">{photo.camera.location}</div>
              </div>
            </>
          )}

          <div className="info-row" style={{ marginTop: 20 }}>
            <div className="tag-section-title">物种标签</div>
            <div className="tag-picker">
              {tags.map(tag => {
                const selected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    className={`tag-picker-item ${selected ? 'selected' : ''}`}
                    style={selected ? { background: tag.color } : {}}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="info-row">
            <div className="info-label" style={{ marginBottom: 6 }}>备注</div>
            <textarea
              className="notes-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="添加备注信息..."
            />
          </div>

          <button
            className="save-button"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? '保存中...' : '保存修改'}
          </button>
          {saveStatus && (
            <div className={`save-status ${saveStatus}`}>
              {saveStatus === 'saved' ? '✓ 已保存' : saveStatus === 'error' ? '✗ 保存失败，请重试' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
