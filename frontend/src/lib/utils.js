export const loadScript = (src, id, callback) => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      if (callback && typeof callback === 'function') {
        resolve(callback());
      }
      return resolve();
    }

    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.onload = () => {
      if (callback && typeof callback === 'function') {
        resolve(callback());
      } else {
        resolve();
      }
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};