import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form as RBForm } from 'react-bootstrap';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { useAuth } from '../../auth';
import { useUpdateWorkspace } from '../../../services/workspaceServices';
import DatePicker from '../../../components/common/DatePicker';
import { Select, Avatar } from '../../../components/common';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & Time' },
  { value: 'user', label: 'User Picker' },
  { value: 'select', label: 'Select (Single)' },
  { value: 'multiselect', label: 'Select (Multiple)' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'url', label: 'URL' },
];

const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const ensureUniqueKey = (baseKey, existingKeys) => {
  let key = baseKey;
  let i = 1;
  while (existingKeys.includes(key)) {
    key = `${baseKey}_${i++}`;
  }
  return key;
};

const CustomFields = ({ issue, updateIssue }) => {
  const { project, orgUsers, updateProjectContext } = useWorkspace();
  const updateWorkspace = useUpdateWorkspace();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [newField, setNewField] = useState({ name: '', type: 'text', description: '', required: false, options: '' });
  const [editModal, setEditModal] = useState({ open: false, key: null, name: '', description: '', required: false });
  const [deleteModal, setDeleteModal] = useState({ open: false, key: null, name: '' });

  const issueTypeKey = String(issue.type);
  const customFieldsDef = useMemo(() => {
    const cfg = project?.config?.customFields || {};
    return cfg[issueTypeKey] || [];
  }, [project?.config?.customFields, issueTypeKey]);

  const customValues = useMemo(() => issue.customFields || {}, [issue.customFields]);

  const handleValueChange = (fieldKey, value) => {
    const next = { ...(issue.customFields || {}), [fieldKey]: value };
    updateIssue({ customFields: next });
  };

  const addField = () => {
    const baseKey = slugify(newField.name);
    if (!baseKey) return;
    const existingKeys = customFieldsDef.map(f => f.key);
    const uniqueKey = ensureUniqueKey(baseKey, existingKeys);

    const fieldDef = {
      key: uniqueKey,
      name: newField.name.trim(),
      type: newField.type,
      description: newField.description?.trim() || '',
      required: !!newField.required,
      ...( ['select', 'multiselect', 'radio'].includes(newField.type) && {
        options: (newField.options || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      }),
      createdBy: currentUser?.all?.uid,
      createdAt: Math.floor(Date.now()),
    };

    // Optimistic project config update
    if (!project?.spaceId) return;
    const nextConfig = {
      ...(project?.config || {}),
      customFields: {
        ...(project?.config?.customFields || {}),
        [issueTypeKey]: [...customFieldsDef, fieldDef],
      },
    };
    updateProjectContext({ ...project, config: nextConfig });

    // Persist to workspace
    updateWorkspace({
      values: { config: nextConfig },
      workspaceId: project?.spaceId,
      orgId: currentUser?.all?.currentOrg,
    });

    // Initialize a value on the current issue so the field is visible and editable immediately
    const initValue = newField.type === 'checkbox' ? false : newField.type === 'multiselect' ? [] : '';
    const nextIssueValues = { ...(issue.customFields || {}) };
    if (nextIssueValues[uniqueKey] === undefined) {
      nextIssueValues[uniqueKey] = initValue;
      // Persist on the issue
      try {
        updateIssue({ customFields: nextIssueValues });
      } catch (e) {
        // no-op
      }
    }

    setShowModal(false);
    setNewField({ name: '', type: 'text', description: '', required: false, options: '' });
  };

  const openEdit = (def) => {
    setEditModal({ open: true, key: def.key, name: def.name, description: def.description || '', required: !!def.required });
  };

  const saveEdit = () => {
    if (!project?.spaceId || !editModal.key) return;
    const updatedDefs = customFieldsDef.map(d => d.key === editModal.key ? { ...d, name: editModal.name.trim(), description: editModal.description.trim(), required: !!editModal.required } : d);
    const nextConfig = {
      ...(project?.config || {}),
      customFields: {
        ...(project?.config?.customFields || {}),
        [issueTypeKey]: updatedDefs,
      },
    };
    updateProjectContext({ ...project, config: nextConfig });
    updateWorkspace({
      values: { config: nextConfig },
      workspaceId: project?.spaceId,
      orgId: currentUser?.all?.currentOrg,
    });
    setEditModal({ open: false, key: null, name: '', description: '', required: false });
  };

  const openDelete = (def) => {
    setDeleteModal({ open: true, key: def.key, name: def.name });
  };

  const confirmDelete = () => {
    if (!project?.spaceId || !deleteModal.key) return;
    const updatedDefs = customFieldsDef.filter(d => d.key !== deleteModal.key);
    const nextConfig = {
      ...(project?.config || {}),
      customFields: {
        ...(project?.config?.customFields || {}),
        [issueTypeKey]: updatedDefs,
      },
    };
    updateProjectContext({ ...project, config: nextConfig });
    updateWorkspace({
      values: { config: nextConfig },
      workspaceId: project?.spaceId,
      orgId: currentUser?.all?.currentOrg,
    });
    // Remove value from current issue as well
    if (issue?.customFields && Object.prototype.hasOwnProperty.call(issue.customFields, deleteModal.key)) {
      const nextValues = { ...issue.customFields };
      delete nextValues[deleteModal.key];
      updateIssue({ customFields: nextValues });
    }
    setDeleteModal({ open: false, key: null, name: '' });
  };

  // Renderers
  const renderFieldInput = (def) => {
    const val = customValues[def.key];
    const commonProps = {
      id: `cf_${def.key}`,
      className: `form-control ${def.required && (val === undefined || val === '' || val === null) ? 'is-invalid' : ''}`,
    };

    switch (def.type) {
      case 'text':
        return (
          <input
            type="text"
            {...commonProps}
            value={val || ''}
            onChange={(e) => handleValueChange(def.key, e.target.value)}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            {...commonProps}
            value={val ?? ''}
            onChange={(e) => handleValueChange(def.key, e.target.value === '' ? null : Number(e.target.value))}
          />
        );
      case 'date':
        return (
          <DatePicker
            onChange={(d) => handleValueChange(def.key, d)}
            value={val || null}
            className="form-control"
          />
        );
      case 'datetime':
        return (
          <input
            type="datetime-local"
            {...commonProps}
            value={val || ''}
            onChange={(e) => handleValueChange(def.key, e.target.value)}
          />
        );
      case 'checkbox':
        return (
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id={`cf_chk_${def.key}`}
              checked={!!val}
              onChange={(e) => handleValueChange(def.key, e.target.checked)}
            />
          </div>
        );
      case 'url':
        return (
          <input
            type="url"
            placeholder="https://example.com"
            {...commonProps}
            value={val || ''}
            onChange={(e) => handleValueChange(def.key, e.target.value)}
          />
        );
      case 'user': {
        const options = Object.values(orgUsers?.users || {}).map(u => ({ value: u.uid, label: u.name || u.displayName || u.email }));
        return (
          <Select
            variant="empty"
            dropdownWidth={343}
            withClearValue={true}
            name={`cf_user_${def.key}`}
            value={val || ''}
            options={options}
            onChange={(uid) => handleValueChange(def.key, uid)}
            renderOption={({ value: uid }) => {
              const u = Object.values(orgUsers?.users || {}).find(x => x.uid === uid);
              const name = u?.name || u?.displayName || u?.email || 'Unknown';
              return (
                <div className="d-flex align-items-center">
                  <Avatar avatarUrl={u?.photoURL || ''} name={name} size={20} />
                  <span className="ms-2">{name}</span>
                </div>
              );
            }}
            renderValue={({ value: uid }) => {
              const u = Object.values(orgUsers?.users || {}).find(x => x.uid === uid);
              const name = u?.name || u?.displayName || u?.email || 'Unknown';
              return (
                <div className="d-flex align-items-center">
                  <Avatar avatarUrl={u?.photoURL || ''} name={name} size={20} />
                  <span className="ms-2">{name}</span>
                </div>
              );
            }}
          />
        );
      }
      case 'select': {
        const options = (def.options || []).map(opt => ({ value: opt, label: opt }));
        return (
          <Select
            variant="empty"
            dropdownWidth={343}
            withClearValue={true}
            name={`cf_sel_${def.key}`}
            value={val || ''}
            options={options}
            onChange={(v) => handleValueChange(def.key, v)}
          />
        );
      }
      case 'multiselect': {
        const options = (def.options || []).map(opt => ({ value: opt, label: opt }));
        const current = Array.isArray(val) ? val : [];
        return (
          <div>
            {options.map(o => (
              <div className="form-check form-check-inline" key={o.value}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`cf_ms_${def.key}_${o.value}`}
                  checked={current.includes(o.value)}
                  onChange={(e) => {
                    const next = e.target.checked ? [...current, o.value] : current.filter(x => x !== o.value);
                    handleValueChange(def.key, next);
                  }}
                />
                <label className="form-check-label" htmlFor={`cf_ms_${def.key}_${o.value}`}>{o.label}</label>
              </div>
            ))}
          </div>
        );
      }
      case 'radio': {
        const options = (def.options || []).map(opt => ({ value: opt, label: opt }));
        return (
          <div>
            {options.map(o => (
              <div className="form-check" key={o.value}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={`cf_radio_${def.key}`}
                  id={`cf_radio_${def.key}_${o.value}`}
                  checked={val === o.value}
                  onChange={() => handleValueChange(def.key, o.value)}
                />
                <label className="form-check-label" htmlFor={`cf_radio_${def.key}_${o.value}`}>{o.label}</label>
              </div>
            ))}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <label className="col-form-label fw-bold mb-0">Custom Fields</label>
        <button className="btn btn-sm btn-light-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus me-1"></i>
          Add Field
        </button>
      </div>

      {customFieldsDef.length === 0 && (
        <div className="text-muted mb-3">No custom fields for this issue type yet.</div>
      )}

      {customFieldsDef.map((def) => (
        <div className="mb-3" key={def.key}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <label htmlFor={`cf_${def.key}`} className="form-label fw-semibold mb-0">
                {def.name} {def.required && <span className="text-danger">*</span>}
              </label>
              {def.description && <div className="text-muted small">{def.description}</div>}
            </div>
            <div className="ms-3">
              <button
                type="button"
                className="btn btn-sm btn-link text-muted p-0"
                onClick={() => openEdit(def)}
                title="Edit field"
              >
                <i className="bi bi-pencil"></i>
              </button>
            </div>
          </div>
          <div className="mt-2">
            {renderFieldInput(def)}
          </div>
        </div>
      ))}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Field Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Browser Version"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Field Type</label>
            <select
              className="form-select"
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
            >
              {FIELD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Description (optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="Help text shown under the field"
              value={newField.description}
              onChange={(e) => setNewField({ ...newField, description: e.target.value })}
            />
          </div>
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="cf_required"
              checked={newField.required}
              onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="cf_required">Required</label>
          </div>
          {['select', 'multiselect', 'radio'].includes(newField.type) && (
            <div className="mb-3">
              <label className="form-label">Options (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Low, Medium, High"
                value={newField.options}
                onChange={(e) => setNewField({ ...newField, options: e.target.value })}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={addField}
            disabled={!newField.name.trim()}
          >
            Create
          </button>
        </Modal.Footer>
      </Modal>

      {/* Edit Field Modal */}
  <Modal show={editModal.open} onHide={() => setEditModal({ open: false, key: null, name: '', description: '', required: false })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Field Name</label>
            <input
              type="text"
              className="form-control"
              value={editModal.name}
              onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              value={editModal.description}
              onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
            />
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="cf_edit_required"
              checked={!!editModal.required}
              onChange={(e) => setEditModal({ ...editModal, required: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="cf_edit_required">Required</label>
          </div>
          <div className="text-muted small mt-3">Note: Field key and type are fixed to keep data consistent across issues.</div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-outline-danger me-auto"
            onClick={() => {
              const { key, name } = editModal;
              setEditModal({ open: false, key: null, name: '', description: '', required: false });
              setDeleteModal({ open: true, key, name });
            }}
          >
            Delete field
          </button>
          <button className="btn btn-light" onClick={() => setEditModal({ open: false, key: null, name: '', description: '', required: false })}>Cancel</button>
          <button className="btn btn-primary" onClick={saveEdit} disabled={!editModal.name.trim()}>Save</button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={deleteModal.open} onHide={() => setDeleteModal({ open: false, key: null, name: '' })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Custom Field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-danger fw-semibold mb-2">This action cannot be undone.</div>
          <div>Are you sure you want to delete the field "{deleteModal.name}" for this issue type? It will no longer be shown on issues. Existing saved values on other issues will not be automatically removed.</div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-light" onClick={() => setDeleteModal({ open: false, key: null, name: '' })}>Cancel</button>
          <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

CustomFields.propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

export default CustomFields;
