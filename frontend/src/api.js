const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export function getCameras() {
  return request('/cameras');
}

export function getTags() {
  return request('/tags');
}

export function getPhotos(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/photos${query ? '?' + query : ''}`);
}

export function getPhotoDetail(id) {
  return request(`/photos/${id}`);
}

export function updatePhotoTags(id, tags, notes) {
  return request(`/photos/${id}/tags`, {
    method: 'PUT',
    body: JSON.stringify({ tags, notes })
  });
}

export function addCamera(camera) {
  return request('/cameras', {
    method: 'POST',
    body: JSON.stringify(camera)
  });
}

export function deleteCamera(id) {
  return request(`/cameras/${id}`, {
    method: 'DELETE'
  });
}
