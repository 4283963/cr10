import React, { useEffect, useState, useMemo } from 'react';
import { getStatsByTimeSlot } from '../api';

export default function TimeSlotChart({ cameraId, cameraName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cameraId) {
      setStats(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getStatsByTimeSlot(cameraId)
      .then(data => {
        if (!cancelled) setStats(data);
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [cameraId]);

  const activeTags = useMemo(() => {
    if (!stats || !stats.tagSummary) return [];
    return stats.tagSummary
      .filter(t => t.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(t => t.tag);
  }, [stats]);

  const maxTotal = useMemo(() => {
    if (!stats || !stats.timeSlots) return 1;
    const max = Math.max(...stats.timeSlots.map(s => s.total), 1);
    return Math.max(max, 1);
  }, [stats]);

  if (!cameraId) return null;

  if (loading) {
    return (
      <div className="stats-card">
        <div className="stats-loading">加载时段统计中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-card">
        <div className="stats-error">统计数据加载失败: {error}</div>
      </div>
    );
  }

  if (!stats || stats.totalPhotos === 0) {
    return (
      <div className="stats-card">
        <div className="stats-empty">该相机暂无照片数据</div>
      </div>
    );
  }

  return (
    <div className="stats-card">
      <div className="stats-header">
        <div>
          <div className="stats-title">📊 物种活动时段分布</div>
          <div className="stats-subtitle">
            {cameraName} · 共 {stats.totalPhotos} 张照片
          </div>
        </div>
        <div className="stats-legend">
          {activeTags.map(tag => (
            <div key={tag.id} className="legend-item">
              <span className="legend-dot" style={{ background: tag.color }} />
              <span className="legend-text">{tag.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-y-axis">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = Math.round(maxTotal * (4 - i) / 4);
            return (
              <div key={i} className="y-axis-label">{value}</div>
            );
          })}
        </div>

        <div className="chart-bars-area">
          <div className="chart-grid-lines">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid-line" />
            ))}
          </div>

          <div className="chart-bars">
            {stats.timeSlots.map(slot => {
              const totalHeight = slot.total > 0 ? (slot.total / maxTotal * 100) : 0;
              const tagBars = activeTags.map(tag => {
                const tagData = slot.byTag.find(t => t.tag.id === tag.id);
                const count = tagData ? tagData.count : 0;
                const height = count > 0 ? (count / maxTotal * 100) : 0;
                return { tag, count, height };
              }).filter(t => t.count > 0);

              return (
                <div key={slot.slotKey} className="bar-column">
                  <div className="bar-stack" style={{ height: `${totalHeight}%` }}>
                    {tagBars.map(({ tag, count, height }) => (
                      <div
                        key={tag.id}
                        className="bar-segment"
                        style={{
                          height: `${height}%`,
                          background: tag.color,
                          minHeight: count > 0 ? '4px' : 0
                        }}
                        title={`${tag.name}: ${count} 张`}
                      />
                    ))}
                    {slot.total > 0 && tagBars.length === 0 && (
                      <div
                        className="bar-segment bar-untagged"
                        style={{ height: '100%' }}
                        title={`未标注: ${slot.total} 张`}
                      />
                    )}
                  </div>
                  <div className="bar-label">{slot.label.split(' ')[0]}</div>
                  <div className="bar-value">{slot.total}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="stats-summary">
        {activeTags.map(item => {
          const summary = stats.tagSummary.find(t => t.tag.id === item.id);
          return (
            <div key={item.id} className="summary-chip">
              <span className="summary-dot" style={{ background: item.color }} />
              <span className="summary-name">{item.name}</span>
              <span className="summary-count">{summary ? summary.count : 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
