import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Edit, Trash2 } from 'lucide-react';

// Priority ke hisaab se border color set karne ke liye
const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-blue-500',
};

const TaskCard = ({ task, index, onEdit, onDelete, onViewTask, canEdit }) => {
    const user = task.assignedToUser; // Hum yeh assume kar rahe hain ki task object mein user info hai

    return (
        <Draggable draggableId={String(task.id)} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 border-l-4 ${priorityColors[task.priority] || 'border-l-gray-400'}`}
                    onClick={() => !canEdit && onViewTask(task)} // Employee click karke detail dekhega
                >
                    <div className="flex justify-between items-start">
                        <p className="font-medium text-slate-800 dark:text-slate-100">{task.title}</p>
                        {canEdit && ( // Edit/Delete button sirf manager ko dikhega
                            <div className="flex space-x-1">
                                <button onClick={(e) => { e.stopPropagation(); onEdit(task); }} className="p-1 text-slate-400 hover:text-blue-500"><Edit size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.description?.substring(0, 50)}...</p>
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-red-500 dark:text-red-400">Due: {task.dueDate}</span>
                        {user && (
                            <img
                                src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random&color=fff&size=24&rounded=true`}
                                alt={user.firstName}
                                title={`${user.firstName} ${user.lastName}`}
                                className="w-6 h-6 rounded-full"
                            />
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;