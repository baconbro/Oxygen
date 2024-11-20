import React, { useEffect, useState } from 'react';
import { editSpace, editSpaceNoMerge } from '../../../services/firestore';
import { useWorkspace } from '../../../contexts/WorkspaceProvider';
import { useFormik } from 'formik'
import * as Yup from 'yup'

const profileDetailsSchema = Yup.object().shape({
    columnHeaderBadge: Yup.string().required('Column Header Badge is required'),
});

const BoardSettings = () => {
    const { project, workspaceConfig } = useWorkspace();
    const [loading, setLoading] = useState(false)
    const initialValues = {
        columnHeaderBadge: workspaceConfig?.workspaceConfig?.board?.columnHeaderBadge,
        doneColumn: workspaceConfig?.workspaceConfig?.board?.doneColumn,
        rice: workspaceConfig?.workspaceConfig?.board?.rice
    }

    const formik = useFormik({
        initialValues,
        validationSchema: profileDetailsSchema,
        onSubmit: (values) => {
            setTimeout(() => {
                setLoading(true)
                handleSaveItem(values)
                setLoading(false)
            }, 1000)
        },
    })



    const handleSaveItem = (updatedData) => {
        console.log(updatedData)
        // Update the config with the new board array
        const newConfig = {
            ...workspaceConfig,
            workspaceConfig: {
                ...workspaceConfig.workspaceConfig,
                board: updatedData
            }
        };
        // Update the Firestore
        editSpace({ config: newConfig }, project.spaceId, project.org);
    };

    if (!workspaceConfig) {
        return <div>Loading...</div>;
    }

    return (

        <div className="card card-xl-stretch mb-5 mb-xl-8">
            <form onSubmit={formik.handleSubmit} noValidate className='form'>
                <div className="card-body pt-3">



                    <div className='row mb-6'>
                        <label className='col-lg-4 col-form-label required fw-bold fs-6'>Column header badge</label>

                        <div className='col-lg-8 fv-row'>
                            <select
                                className='form-select form-select-solid form-select-lg'
                                {...formik.getFieldProps('columnHeaderBadge')}
                            >
                                <option value='default'>Default</option>
                                <option value='itemsnumber'>Number of items</option>
                                <option value='storypoint'>Sum of storypoints</option>

                            </select>
                            {formik.touched.columnHeaderBadge && formik.errors.columnHeaderBadge && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>{formik.errors.columnHeaderBadge}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='row mb-6'>
                        <label className='col-lg-4 col-form-label required fw-bold fs-6'>Done column</label>

                        <div className='col-lg-8 fv-row'>
                            <select
                                className='form-select form-select-solid form-select-lg'
                                {...formik.getFieldProps('doneColumn')}
                            >
                                {workspaceConfig.issueStatus.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.name}
                                    </option>
                                ))}

                            </select>
                            {formik.touched.doneColumn && formik.errors.doneColumn && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>{formik.errors.doneColumn}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="separator separator-content my-15">Fields</div>

                    <div className='row mb-6 form-check form-switch form-check-custom form-check-solid'>
                        <label className='col-lg-4 col-form-label fw-bold fs-6'>RICE priorisation fields</label>
                        <div className='col-lg-8 fv-row'>
                            <input className="form-check-input" type="checkbox" value="" id="flexSwitch" {...formik.getFieldProps('rice')} checked={formik.values.rice} />
                            {formik.touched.rice && formik.errors.rice && (
                                <div className='fv-plugins-message-container'>
                                    <div className='fv-help-block'>{formik.errors.rice}</div>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
                <div className='card-footer d-flex justify-content-end py-6 px-9'>
                    <button type='submit' className='btn btn-primary' disabled={loading}>
                        {!loading && 'Save Changes'}
                        {loading && (
                            <span className='indicator-progress' style={{ display: 'block' }}>
                                Please wait...{' '}
                                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BoardSettings;

