// Dynamically import all SVG/PNG avatars from src/assets/avatars
// Returns a stable list of { id, src }

const importAll = (r) =>
  r.keys().map((key) => {
    const src = r(key);
    const filename = key.replace('./', '');
    const id = filename.replace(/\.(svg|png)$/i, '');
    return { id, src };
  });

// Webpack's require.context is available in CRA; adjust the path if you move the folder
const context = require.context('../assets/avatars', false, /\.(svg|png)$/i);
const AVATARS = importAll(context).sort((a, b) => a.id.localeCompare(b.id));

export const getWorkspaceAvatars = () => AVATARS;

export const getWorkspaceAvatarSrcById = (id) => {
  if (!id) return null;
  const found = AVATARS.find((a) => a.id === id);
  return found ? found.src : null;
};
