import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from '../../../utils/toast';
import { getWorkspaceAvatars, getWorkspaceAvatarSrcById } from '../../../utils/avatars';
import * as FirestoreService from '../../../services/firestore';
import { useAuth } from '../../auth';

const WorkspaceAvatar = ({ project, updateLocalProjectConfig }) => {
  const { currentUser } = useAuth();
  const orgId = currentUser?.all?.currentOrg;
  const [isPicking, setIsPicking] = useState(false);
  const [selected, setSelected] = useState(project.avatarId || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const avatars = useMemo(() => getWorkspaceAvatars(), []);
  // Prefer local selection for instant feedback; fallback to project value
  const currentSrc = getWorkspaceAvatarSrcById(selected || project.avatarId);

  // Keep local selection in sync when project changes externally
  useEffect(() => {
    if (!isPicking) {
      setSelected(project.avatarId || '');
    }
  }, [project?.avatarId, isPicking]);

  const save = async () => {
    try {
      if (!selected) {
        toast.error('Please select an avatar');
        return;
      }
      await FirestoreService.editSpace({ avatarId: selected, avatarUrl: null, avatarStoragePath: null }, project.spaceId, orgId);
      updateLocalProjectConfig && updateLocalProjectConfig({ avatarId: selected, avatarUrl: null, avatarStoragePath: null });
      toast.success('Workspace avatar updated.');
      setIsPicking(false);
    } catch (e) {
      toast.error(e.message || 'Failed to save workspace avatar');
    }
  };

  const onUploadClick = () => fileInputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      // Process image: center-crop to square and resize to 256x256 PNG
      const processed = await cropAndResizeTo256(file);
      // Optionally delete previous storage file if present
      if (project.avatarStoragePath) {
        await FirestoreService.deleteWorkspaceAvatarByPath(project.avatarStoragePath);
      }
      const { url, path } = await FirestoreService.uploadWorkspaceAvatar(orgId, project.spaceId, processed);
      await FirestoreService.editSpace({ avatarId: null, avatarUrl: url, avatarStoragePath: path }, project.spaceId, orgId);
      updateLocalProjectConfig && updateLocalProjectConfig({ avatarId: null, avatarUrl: url, avatarStoragePath: path });
      setSelected('');
      toast.success('Custom avatar uploaded.');
      setIsPicking(false);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Helper: crop to centered square and resize to 256x256, output a PNG File
  const cropAndResizeTo256 = (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            const side = Math.min(w, h);
            const sx = Math.max(0, Math.floor((w - side) / 2));
            const sy = Math.max(0, Math.floor((h - side) / 2));

            const canvas = document.createElement('canvas');
            const size = 256;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas not supported'));

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

            canvas.toBlob(
              (blob) => {
                if (!blob) return reject(new Error('Failed to create image blob'));
                const processedFile = new File([blob], 'avatar_256.png', { type: 'image/png' });
                resolve(processedFile);
              },
              'image/png',
              0.92
            );
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = reader.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      } catch (e) {
        reject(e);
      }
    });
  };

  return (
    <div className='card mb-5 mb-xl-10'>
      <div className='card-header border-0 '>
        <div className='card-title m-0'>
          <h3 className='fw-bolder m-0'>Workspace Avatar</h3>
        </div>
        <div className='card-toolbar'>
          {!isPicking && (
            <button className='btn btn-sm btn-light-primary' onClick={() => setIsPicking(true)}>Change</button>
          )}
        </div>
      </div>
      <div className='card-body border-top p-9'>
        {!isPicking && (
          <div className='d-flex align-items-center'>
            <div className='symbol symbol-60px me-4'>
              {project.avatarUrl ? (
                <img alt='workspace avatar' src={project.avatarUrl} />
              ) : currentSrc ? (
                <img alt='workspace avatar' src={currentSrc} />
              ) : (
                <div className='symbol-label bg-light fw-bold'>{(project.title || 'WS').slice(0,2).toUpperCase()}</div>
              )}
            </div>
            <div className='text-muted'>Pick a curated icon to help visually identify this workspace.</div>
          </div>
        )}
        {isPicking && (
          <>
            <div className='row g-4'>
              {avatars.map((a) => (
                <div key={a.id} className='col-3 col-sm-2 col-md-2'>
                  <button
                    type='button'
                    className={`btn p-2 w-100 ${selected === a.id ? 'border border-3 border-primary' : 'border'}`}
                    onClick={() => setSelected(a.id)}
                    title={a.id}
                  >
                    <img src={a.src} alt={a.id} style={{ width: '100%', height: 64, objectFit: 'contain' }} />
                  </button>
                </div>
              ))}
            </div>
            <div className='d-flex align-items-center gap-3 mt-4'>
              <button type='button' className='btn btn-light' onClick={onUploadClick} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload your own'}
              </button>
              <input ref={fileInputRef} type='file' accept='image/*' onChange={onFileChange} hidden />
              <span className='text-muted'>PNG/SVG recommended. We store your image securely.</span>
            </div>
            <div className='d-flex gap-2 mt-6'>
              <button className='btn btn-primary' onClick={save}>Save</button>
              <button className='btn btn-light' onClick={() => setIsPicking(false)}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WorkspaceAvatar;
