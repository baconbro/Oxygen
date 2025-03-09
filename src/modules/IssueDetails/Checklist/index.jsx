import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
    ChecklistContainer, ChecklistHeader, ChecklistProgress,
    ChecklistProgressBar, ChecklistProgressText, ChecklistItem,
    ChecklistItemContent, ChecklistItemText, ChecklistControls,
    ChecklistAddItem, ChecklistInput, DragHandle
} from './Styles';

const propTypes = {
    issue: PropTypes.object.isRequired,
    updateIssue: PropTypes.func.isRequired,
};

const IssueDetailsChecklist = ({ issue, updateIssue }) => {
    const [newItemText, setNewItemText] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingItemText, setEditingItemText] = useState('');

    // Initialize checklist if it doesn't exist
    useEffect(() => {
        if (!issue.checklist) {
            updateIssue({ checklist: [] });
        }
    }, [issue, updateIssue]);

    const checklist = issue.checklist || [];

    const completedItems = checklist.filter(item => item.isCompleted).length;
    const progressPercentage = checklist.length > 0 ? Math.round((completedItems / checklist.length) * 100) : 0;

    const handleAddItem = () => {
        if (newItemText.trim() === '') return;

        const newItem = {
            id: Date.now().toString(),
            text: newItemText,
            isCompleted: false
        };

        updateIssue({ checklist: [...checklist, newItem] });
        setNewItemText('');
    };

    const handleToggleComplete = (itemId) => {
        const updatedChecklist = checklist.map(item =>
            item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );
        updateIssue({ checklist: updatedChecklist });
    };

    const handleDeleteItem = (itemId) => {
        const updatedChecklist = checklist.filter(item => item.id !== itemId);
        updateIssue({ checklist: updatedChecklist });
    };

    const startEditingItem = (item) => {
        setEditingItemId(item.id);
        setEditingItemText(item.text);
    };

    const saveEditingItem = () => {
        if (editingItemText.trim() === '') return;

        const updatedChecklist = checklist.map(item =>
            item.id === editingItemId ? { ...item, text: editingItemText } : item
        );
        updateIssue({ checklist: updatedChecklist });
        setEditingItemId(null);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(checklist);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        updateIssue({ checklist: items });
    };

    return (
        <ChecklistContainer>
            <ChecklistHeader>
                <h3 className="fw-bold mb-1">Checklist</h3>
                <ChecklistProgress>
                    <ChecklistProgressBar>
                        <div style={{ width: `${progressPercentage}%` }}></div>
                    </ChecklistProgressBar>
                    <ChecklistProgressText>{progressPercentage}%</ChecklistProgressText>
                </ChecklistProgress>
            </ChecklistHeader>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="checklist-items">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {checklist.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <ChecklistItem
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                        >
                                            <DragHandle {...provided.dragHandleProps}>
                                                <i className="bi bi-grid-3x2-gap-fill"></i>
                                            </DragHandle>
                                            <input
                                                type="checkbox"
                                                checked={item.isCompleted}
                                                onChange={() => handleToggleComplete(item.id)}
                                            />

                                            {editingItemId === item.id ? (
                                                <ChecklistInput
                                                    value={editingItemText}
                                                    onChange={e => setEditingItemText(e.target.value)}
                                                    onBlur={saveEditingItem}
                                                    onKeyPress={e => e.key === 'Enter' && saveEditingItem()}
                                                    autoFocus
                                                />
                                            ) : (
                                                <ChecklistItemContent>
                                                    <ChecklistItemText completed={item.isCompleted}>
                                                        {item.text}
                                                    </ChecklistItemText>
                                                    <ChecklistControls>
                                                        <button onClick={() => startEditingItem(item)}>
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button onClick={() => handleDeleteItem(item.id)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </ChecklistControls>
                                                </ChecklistItemContent>
                                            )}
                                        </ChecklistItem>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <ChecklistAddItem>
                <ChecklistInput
                    placeholder="Add an item..."
                    value={newItemText}
                    onChange={e => setNewItemText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddItem()}
                />
                <button onClick={handleAddItem} disabled={!newItemText.trim()}>
                    Add
                </button>
            </ChecklistAddItem>
        </ChecklistContainer>
    );
};

IssueDetailsChecklist.propTypes = propTypes;

export default IssueDetailsChecklist;
