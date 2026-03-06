// Dynamically import all SVG/PNG avatars from src/assets/avatars
// Returns a stable list of { id, src }

// Vite's import.meta.glob for dynamic imports
const avatarModules = import.meta.glob('../assets/avatars/*.{svg,png}', { eager: true, as: 'url' });

const AVATARS = Object.entries(avatarModules)
  .map(([path, src]) => {
    const filename = path.split('/').pop();
    const id = filename.replace(/\.(svg|png)$/i, '');
    return { id, src };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

export const getWorkspaceAvatars = () => AVATARS;

export const getWorkspaceAvatarSrcById = (id) => {
  if (!id) return null;
  const found = AVATARS.find((a) => a.id === id);
  return found ? found.src : null;
};
