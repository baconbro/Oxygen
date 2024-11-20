import React, { useEffect, useState } from 'react';
import { editSpace, editSpaceNoMerge } from '../../../services/firestore';

const CustomObject = ({ project }) => {

    const [config, setConfig] = useState(project.config.issueType);
    const [newItemName, setNewItemName] = useState('');
    const [editItemIndex, setEditItemIndex] = useState(null);
    const [originalName, setOriginalName] = useState('');
    const [newItemColor, setNewItemColor] = useState('#000000'); // Default color
    const [newItemIcon, setNewItemIcon] = useState('bi bi-star'); // Default Bootstrap icon

    const handleAddItem = () => {
        if (newItemName.trim() === '') return;

        const newIndex = Object.keys(config).length;
        const newItem = { name: newItemName, color: newItemColor, icon: newItemIcon, id: `type${newIndex + 1}` };
        setConfig({ ...config, [newIndex]: newItem });
        setNewItemName(''); // Clear the input field
        setNewItemColor('#000000'); // Reset color to default
        setNewItemIcon('star'); // Reset icon to default
    };

    const handleEditItem = (index) => {
        setEditItemIndex(index);
        // Store the original name before editing
        setOriginalName(config[index].name);
        setNewItemColor(config[index].color);
        setNewItemIcon(config[index].icon);
    };

    const handleSaveItem = (index) => {
        // Update the config directly with the new name
        const updatedConfig = { ...config };
        updatedConfig[index].name = config[index].name;
        updatedConfig[index].color = config[index].color;
        updatedConfig[index].icon = config[index].icon;
        setConfig(updatedConfig);
        setEditItemIndex(null); // Clear the editing state
        // Update the config object with the new issueStatus array
        const newConfig = { ...project.config, issueType: updatedConfig };
        // Update the Firestore
        editSpace({ config: newConfig }, project.spaceId, project.org);
    };

    const handleCancelEdit = (index) => {
        // Revert to the original name before editing
        const updatedConfig = { ...config };
        updatedConfig[index].name = originalName;
        updatedConfig[index].color = newItemColor;
        updatedConfig[index].icon = newItemIcon;
        setConfig(updatedConfig);
        setEditItemIndex(null); // Clear the editing state
    };

    const handleDeleteItem = (index) => {
        const updatedConfig = { ...config };
        delete updatedConfig[index];
        setConfig(updatedConfig);
        // Update the config object with the new issueStatus array
        const newConfig = { ...project.config, issueType: updatedConfig };
        // Update the Firestore
        editSpaceNoMerge({ config: newConfig }, project.spaceId, project.org);
    };

    return (

        <div className="card card-xl-stretch mb-5 mb-xl-8">
{/*             <div className="card-header align-items-center border-0 mt-4">
                <h3 className="card-title align-items-start flex-column">
                    <span className="fw-bold text-dark"></span>

                </h3>
            </div> */}
            <div className="card-body pt-3">


                {Object.keys(config).map((index) => (
                    <div className="d-flex align-items-sm-center mb-7" key={config[index].id}>



                        <div className="avatar avatar-60px avatar-2by3 me-4">
                            <div className="avatar-label" style={{ width: '40px', height: '40px', marginLeft: '10px' }}><i className={`bi bi-${config[index].icon}`} style={{color: config[index].color}}></i></div>
                        </div>



                        <div className="d-flex flex-row-fluid align-items-center flex-wrap my-lg-0 me-2">

                            <div className="flex-grow-1 my-lg-0 my-2 me-2">
                                {editItemIndex === index ? (
                                    <div className="d-flex align-items-center">

                                        <div className="position-relative w-md-400px me-md-2">
                                            <div className="mb-5">
                                                <label className="form-label">Name</label>
                                                <input
                                                type="text"
                                                value={config[index].name}
                                                onChange={(e) => {
                                                    // Update the name in config when the user types
                                                    const newName = e.target.value;
                                                    const updatedConfig = { ...config };
                                                    updatedConfig[index].name = newName;
                                                    setConfig(updatedConfig);
                                                }}
                                                className="form-control ps-10"


                                            />
                                                    
                                            </div>
                                            <div className="mb-5">
                                                <label className="form-label">Color</label>
                                                <div className="image-input image-input-outline">
                                                <input
                                                    type="color"
                                                    value={config[index].color}
                                                    onChange={(e) => {
                                                        // Update the color in config when the user selects a new color
                                                        const newColor = e.target.value;
                                                        const updatedConfig = { ...config };
                                                        updatedConfig[index].color = newColor;
                                                        setConfig(updatedConfig);
                                                    }}
                                                    className="image-input-wrapper w-50px h-50px"
                                                />
                                            </div>

                                                </div>

                                                <div className="mb-5">
                                                <label className="form-label">Icon</label>
                                                <input
                                                type="text"
                                                value={config[index].icon}
                                                onChange={(e) => {
                                                    // Update the icon in config when the user types
                                                    const newIcon = e.target.value;
                                                    const updatedConfig = { ...config };
                                                    updatedConfig[index].icon = newIcon;
                                                    setConfig(updatedConfig);
                                                }}
                                                className="form-control ps-10"
                                            />
                                            <div className="form-text">
                                                        Add the icon name from <a href='https://icons.getbootstrap.com/' target='blank'>Bootstrap Icon</a>
                                                    </div>
                                                </div>


                                        </div>

                                        <div className="d-flex align-items-center">
                                            <button onClick={() => handleSaveItem(index)} className="btn btn-primary btn-light btn-sm border-0 me-2">
                                                Save
                                            </button>
                                            <button onClick={() => handleCancelEdit(index)} className="btn btn-icon btn-light btn-sm border-0 me-2">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div><span className="text-gray-800 fw-bold text-hover-primary fs-6"> {config[index].name}</span>


                                    </div>)}

                            </div>

                            <div className="d-flex align-items-center">
                                            {/* Conditionally render the Delete button: Make sure there is one type left*/}
                                {index !== "0" && (
                                    <button onClick={() => handleDeleteItem(index)} className="btn btn-icon btn-light btn-sm border-0 me-2">Delete</button>
                                )}
                                <button onClick={() => handleEditItem(index)} className="btn btn-icon btn-light btn-sm border-0 me-2">Edit</button>

                            </div>


                        </div>










                    </div>
                ))}
                <div className="d-flex align-items-center">

                    <div className="position-relative w-md-400px me-md-2">
                        <input className="form-control form-control-solid ps-10" name="search"
                            type="text"
                            placeholder="New item name"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)} />
                    </div>

                    <div className="d-flex align-items-center">
                        <button onClick={handleAddItem} className="btn btn-primary me-5">Add</button>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default CustomObject;

