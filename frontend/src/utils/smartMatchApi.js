import axios from 'axios';

export async function smartMatchRequest(payload) {
  const apiBase = process.env.REACT_APP_API_URL || 'http://192.168.100.19:8000/api/';

  // CRA (dev) => /api est proxied vers http://localhost:8000/api
  // Prod => on utilise REACT_APP_API_URL
  const url =
    process.env.NODE_ENV === 'development'
      ? '/api/smart-match/match/'
      : `${apiBase.replace(/\/$/, '')}/smart-match/match/`;

  const res = await axios.post(url, payload, {
    headers: {
      Authorization: localStorage.getItem('token')
        ? `Bearer ${localStorage.getItem('token')}`
        : undefined,
    },
  });

  return res.data;
}

