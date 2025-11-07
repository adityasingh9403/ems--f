import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';

// Column headers define karna
const columnConfig = {
    'todo': { name: 'To Do', bg: 'bg-slate-100 dark:bg-slate-700/50' },
    'in_progress': { name: 'In Progress', bg: 'bg-blue-100 dark:bg-blue-900/50' },
    'completed': { name: 'Completed', bg: 'bg-green-100 dark:bg-green-900/50' },
};
const columnOrder = ['todo', 'in_progress', 'completed'];

const TaskBoard = ({ tasks, allUsers, onTaskStatusChange, onEdit, onDelete, onViewTask, canEdit }) => {

    // Tasks ko user info ke saath merge karna
    const tasksWithUsers = useMemo(() => {
        return tasks.map(task => ({
            ...task,
            assignedToUser: allUsers.find(u => u.id === task.assignedToId)
        }));
    }, [tasks, allUsers]);

    // Tasks ko status ke hisaab se columns mein baantna
    const initialColumns = useMemo(() => ({
        'todo': tasksWithUsers.filter(t => t.status === 'todo'),
        'in_progress': tasksWithUsers.filter(t => t.status === 'in_progress'),
        'completed': tasksWithUsers.filter(t => t.status === 'completed'),
    }), [tasksWithUsers]);

    // Optimistic UI update ke liye local state
    const [boardState, setBoardState] = useState(initialColumns);

    // Jab parent se naye tasks (props) aayein, toh local state ko reset karna
    useEffect(() => {
        setBoardState(initialColumns);
    }, [tasks, allUsers]); // initialColumns par depend na karein

    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        // Agar card ko column ke bahar drop kiya
        if (!destination) return;

        // Agar card ko wapas wahin drop kar diya
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const startColId = source.droppableId;
        const endColId = destination.droppableId;
        const taskId = parseInt(draggableId);

        // 1. Optimistic UI Update (UI mein turant move karein)

        const startCol = Array.from(boardState[startColId]);
        const task = startCol.find(t => t.id === taskId);
        startCol.splice(source.index, 1);

        const endCol = Array.from(boardState[endColId]);
        // Agar same column mein drag kiya
        if (startColId === endColId) {
            endCol.splice(destination.index, 0, task);
            setBoardState({
                ...boardState,
                [startColId]: endCol
            });
        } else {
            // Alag column mein drag kiya
            endCol.splice(destination.index, 0, { ...task, status: endColId });
            setBoardState({
                ...boardState,
                [startColId]: startCol,
                [endColId]: endCol
            });

            // 2. API Call (Parent component ko inform karein)
            onTaskStatusChange(taskId, endColId);
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {columnOrder.map(colId => {
                    const column = columnConfig[colId];
                    const tasksInColumn = boardState[colId];

                    return (
                        <Droppable key={colId} droppableId={colId}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`p-4 rounded-lg ${column.bg} transition-colors ${snapshot.isDraggingOver ? 'bg-opacity-80' : ''}`}
                                >
                                    <h3 className="font-semibold mb-3 text-slate-700 dark:text-slate-100">{column.name} ({tasksInColumn.length})</h3>
                                    <div className="space-y-3 min-h-[200px]">
                                        {tasksInColumn.map((task, index) => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                index={index}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onViewTask={onViewTask}
                                                canEdit={canEdit}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    );
                })}
            </div>
        </DragDropContext>
    );
};

export default TaskBoard;