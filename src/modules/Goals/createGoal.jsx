import { useState } from 'react';
import { Form } from '../../components/common';
import { FormElement, FormHeading } from '../Workspace/WorkspaceSettings/Styles';
import { useAuth } from '../auth';
import { useAddOKR } from '../../services/okrServices';
import { useWorkspace } from '../../contexts/WorkspaceProvider';
import { goalVisibilityCopy, scoringMethodCopy, updateCadenceCopy } from '../../constants/custom';

const CreateGoal = ({ modalClose, parent, defaultType }) => {
    const addOKRMutation = useAddOKR();
    const { currentUser } = useAuth();
    const { goals, setGoals } = useWorkspace();
    const [goalType, setGoalType] = useState(defaultType || (parent ? 'kr' : 'objective'));
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [metrics, setMetrics] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);

    const isKeyResult = goalType === 'kr';
    const isInitiative = goalType === 'initiative';

    const handleAddMetric = () => {
        setMetrics([...metrics, {
            id: Math.floor(Math.random() * 1000000000),
            name: '',
            startValue: 0,
            currentValue: 0,
            targetValue: 100,
            unit: 'percent',
        }]);
    };

    const handleUpdateMetric = (index, field, value) => {
        const updated = [...metrics];
        updated[index] = { ...updated[index], [field]: value };
        setMetrics(updated);
    };

    const handleRemoveMetric = (index) => {
        setMetrics(metrics.filter((_, i) => i !== index));
    };

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <Form
            enableReinitialize
            initialValues={{
                title: '',
                description: '',
                visibility: 'public',
                scoringMethod: 'simple',
                updateCadence: 'monthly',
                startValue: '',
                targetValue: '',
                mesureAs: 'percent',
            }}
            validations={{
                title: [Form.is.required(), Form.is.maxLength(200)],
                description: [Form.is.maxLength(500)],
            }}
            onSubmit={async (values, form) => {
                try {
                    const clientId = Math.floor(Math.random() * 1000000000000) + 1;
                    const now = Math.floor(Date.now());

                    const newOkr = {
                        id: clientId,
                        title: values.title,
                        description: values.description || '',
                        score: 0,
                        status: 'pending',
                        reporterId: currentUser.all.uid,
                        createdAt: now,
                        updatedAt: now,
                        type: goalType,
                        visibility: values.visibility,
                        scoringMethod: values.scoringMethod,
                        updateCadence: values.updateCadence,
                        isArchived: false,
                        isPaused: false,
                        followerIds: [currentUser.all.uid],
                        tags: tags,
                        ...(parent ? { parent } : {}),
                        ...(isKeyResult ? {
                            startValue: values.startValue ? Number(values.startValue) : 0,
                            targetValue: values.targetValue ? Number(values.targetValue) : 100,
                            mesureAs: values.mesureAs,
                        } : {}),
                        ...(metrics.length > 0 ? { metrics } : {}),
                    };

                    // Optimistic update
                    setGoals([...(goals || []), newOkr]);

                    addOKRMutation(
                        {
                            okr: newOkr,
                            orgId: currentUser.all.currentOrg,
                        },
                        {
                            onError: () => {
                                setGoals((prev) => (prev || []).filter(g => g.id !== clientId));
                            },
                        }
                    );

                    modalClose();
                } catch (error) {
                    console.error('Error creating goal:', error);
                }
            }}
        >
            <FormElement>
                <FormHeading>
                    {parent ? (isInitiative ? 'New Initiative' : 'New Key Result') : 'New Goal'}
                </FormHeading>

                {/* Goal Type Selector (only when no parent) */}
                {!parent && (
                    <div className="mb-4">
                        <label className="form-label fw-semibold text-gray-600 fs-7 mb-2">Type</label>
                        <div className="d-flex gap-2">
                            {[
                                { value: 'objective', label: 'Objective', icon: 'bi-bullseye', cls: 'primary' },
                                { value: 'kr', label: 'Key Result', icon: 'bi-graph-up', cls: 'info' },
                                { value: 'initiative', label: 'Initiative', icon: 'bi-lightning', cls: 'warning' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`btn btn-sm flex-fill ${goalType === opt.value ? `btn-${opt.cls}` : `btn-outline btn-outline-${opt.cls} btn-active-light-${opt.cls}`}`}
                                    onClick={() => setGoalType(opt.value)}
                                >
                                    <i className={`bi ${opt.icon} me-1`}></i> {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* When parent is set, allow choosing between KR and Initiative */}
                {parent && (
                    <div className="mb-4">
                        <label className="form-label fw-semibold text-gray-600 fs-7 mb-2">Type</label>
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className={`btn btn-sm flex-fill ${goalType === 'kr' ? 'btn-info' : 'btn-outline btn-outline-info btn-active-light-info'}`}
                                onClick={() => setGoalType('kr')}
                            >
                                <i className="bi bi-graph-up me-1"></i> Key Result
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm flex-fill ${goalType === 'initiative' ? 'btn-warning' : 'btn-outline btn-outline-warning btn-active-light-warning'}`}
                                onClick={() => setGoalType('initiative')}
                            >
                                <i className="bi bi-lightning me-1"></i> Initiative
                            </button>
                        </div>
                    </div>
                )}

                <Form.Field.Input
                    name="title"
                    label="Title"
                    className="form-control mb-3"
                />
                <Form.Field.Textarea
                    name="description"
                    label="Description (optional)"
                    className="form-control mb-3"
                    rows={3}
                />

                {/* Key Result measurement fields */}
                {isKeyResult && (
                    <div className="border border-dashed border-gray-300 rounded p-4 mb-4">
                        <label className="form-label fw-semibold text-gray-700 fs-7 mb-3">
                            <i className="bi bi-speedometer2 me-1"></i> Measurement
                        </label>
                        <div className="row g-3">
                            <div className="col-4">
                                <Form.Field.Input
                                    name="startValue"
                                    label="Start"
                                    className="form-control form-control-sm"
                                    inputMode="numeric"
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-4">
                                <Form.Field.Input
                                    name="targetValue"
                                    label="Target"
                                    className="form-control form-control-sm"
                                    inputMode="numeric"
                                    placeholder="100"
                                />
                            </div>
                            <div className="col-4">
                                <label className="form-label fs-8 fw-semibold text-gray-600">Unit</label>
                                <select
                                    name="mesureAs"
                                    className="form-select form-select-sm"
                                    defaultValue="percent"
                                >
                                    <option value="percent">Percent %</option>
                                    <option value="dollar">Dollar $</option>
                                    <option value="number">Number #</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tags */}
                <div className="mb-4">
                    <label className="form-label fw-semibold text-gray-600 fs-7 mb-2">Tags</label>
                    <div className="d-flex gap-2 flex-wrap mb-2">
                        {tags.map(tag => (
                            <span key={tag} className="badge badge-light-primary d-flex align-items-center gap-1">
                                {tag}
                                <i
                                    className="bi bi-x cursor-pointer"
                                    onClick={() => handleRemoveTag(tag)}
                                ></i>
                            </span>
                        ))}
                    </div>
                    <div className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Add a tag..."
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                        />
                        <button type="button" className="btn btn-sm btn-light" onClick={handleAddTag}>Add</button>
                    </div>
                </div>

                {/* Advanced options */}
                <div className="mb-4">
                    <button
                        type="button"
                        className="btn btn-sm btn-link text-gray-500 p-0"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        <i className={`bi ${showAdvanced ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`}></i>
                        Advanced options
                    </button>

                    {showAdvanced && (
                        <div className="border border-dashed border-gray-300 rounded p-4 mt-3">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label fs-8 fw-semibold text-gray-600">Visibility</label>
                                    <Form.Field.Select
                                        name="visibility"
                                        variant="empty"
                                        dropdownWidth={200}
                                        withClearValue={false}
                                        options={Object.entries(goalVisibilityCopy).map(([value, label]) => ({ value, label }))}
                                        renderValue={({ value }) => (
                                            <span className="btn btn-sm btn-light">
                                                <i className={`bi ${value === 'public' ? 'bi-globe' : value === 'private' ? 'bi-lock' : 'bi-people'} me-1`}></i>
                                                {goalVisibilityCopy[value]}
                                            </span>
                                        )}
                                        renderOption={({ value }) => (
                                            <span>{goalVisibilityCopy[value]}</span>
                                        )}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fs-8 fw-semibold text-gray-600">Scoring</label>
                                    <Form.Field.Select
                                        name="scoringMethod"
                                        variant="empty"
                                        dropdownWidth={200}
                                        withClearValue={false}
                                        options={Object.entries(scoringMethodCopy).map(([value, label]) => ({ value, label }))}
                                        renderValue={({ value }) => (
                                            <span className="btn btn-sm btn-light">{scoringMethodCopy[value]}</span>
                                        )}
                                        renderOption={({ value }) => (
                                            <span>{scoringMethodCopy[value]}</span>
                                        )}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fs-8 fw-semibold text-gray-600">Update Cadence</label>
                                    <Form.Field.Select
                                        name="updateCadence"
                                        variant="empty"
                                        dropdownWidth={200}
                                        withClearValue={false}
                                        options={Object.entries(updateCadenceCopy).map(([value, label]) => ({ value, label }))}
                                        renderValue={({ value }) => (
                                            <span className="btn btn-sm btn-light">{updateCadenceCopy[value]}</span>
                                        )}
                                        renderOption={({ value }) => (
                                            <span>{updateCadenceCopy[value]}</span>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="mt-4">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <label className="form-label fs-8 fw-semibold text-gray-600 m-0">
                                        Success Metrics
                                    </label>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-light-primary"
                                        onClick={handleAddMetric}
                                    >
                                        <i className="bi bi-plus me-1"></i> Add Metric
                                    </button>
                                </div>
                                {metrics.map((metric, idx) => (
                                    <div key={metric.id} className="border border-gray-200 rounded p-3 mb-2">
                                        <div className="d-flex justify-content-between mb-2">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Metric name (e.g., NPS Score)"
                                                value={metric.name}
                                                onChange={e => handleUpdateMetric(idx, 'name', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-icon btn-light-danger ms-2"
                                                onClick={() => handleRemoveMetric(idx)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-3">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    placeholder="Start"
                                                    value={metric.startValue}
                                                    onChange={e => handleUpdateMetric(idx, 'startValue', Number(e.target.value))}
                                                />
                                                <span className="text-gray-400 fs-9">Start</span>
                                            </div>
                                            <div className="col-3">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    placeholder="Current"
                                                    value={metric.currentValue}
                                                    onChange={e => handleUpdateMetric(idx, 'currentValue', Number(e.target.value))}
                                                />
                                                <span className="text-gray-400 fs-9">Current</span>
                                            </div>
                                            <div className="col-3">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    placeholder="Target"
                                                    value={metric.targetValue}
                                                    onChange={e => handleUpdateMetric(idx, 'targetValue', Number(e.target.value))}
                                                />
                                                <span className="text-gray-400 fs-9">Target</span>
                                            </div>
                                            <div className="col-3">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={metric.unit}
                                                    onChange={e => handleUpdateMetric(idx, 'unit', e.target.value)}
                                                >
                                                    <option value="percent">%</option>
                                                    <option value="dollar">$</option>
                                                    <option value="number">#</option>
                                                </select>
                                                <span className="text-gray-400 fs-9">Unit</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center pt-4">
                    <button type="button" onClick={modalClose} className="btn btn-light me-3">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {goalType === 'kr' ? 'Create Key Result' :
                         goalType === 'initiative' ? 'Create Initiative' :
                         'Create Goal'}
                    </button>
                </div>
            </FormElement>
        </Form>
    );
};

export default CreateGoal;
