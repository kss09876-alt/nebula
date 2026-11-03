// 행성 그림을 화면과 따로(백그라운드에서) 그리는 워커. planet-store.js가 사용.
import { planetCanvas } from './planets.js?v=4';
self.onmessage = async (e) => {
  const { id, c, size } = e.data;
  try {
    if (typeof OffscreenCanvas === 'undefined') throw new Error('no OffscreenCanvas');
    const cv = planetCanvas(c, size);
    const blob = await cv.convertToBlob({ type: 'image/png' });
    self.postMessage({ id, blob });
  } catch (er) { self.postMessage({ id, error: String(er && er.message || er) }); }
};
