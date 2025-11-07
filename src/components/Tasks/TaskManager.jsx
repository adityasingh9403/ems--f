import React, { useState, useEffect, useMemo } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { showToast } from '../../utils/uiHelpers';
import TaskModal from './TaskModal';
import TaskDetailModal from './TaskDetailModal';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import TaskBoard from './TaskBoard'; // <-- NAYA BOARD IMPORT KAREIN
import {
    apiGetTasks,
    apiAddTask,
    apiUpdateTask,
    apiDeleteTask,
    apiUpdateTaskStatus,
    apiGetEmployees,
    apiGetLeaveRequests,
    apiGetEmployeeNames // <-- YEH NAYA IMPORT ADD KIYA GAYA HAI
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const TaskManager = () => {
    const { user } = useAuth();
    const { updateCounter } = useNotification();
    const [allTasks, setAllTasks] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [approvedLeaves, setApprovedLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    const [observer, setElements, entries] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '0px',
    });

    useEffect(() => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, [entries, observer]);

    useEffect(() => {
        if (!loading) {
            const sections = document.querySelectorAll('.fade-in-section');
            setElements(sections);
        }
    }, [setElements, loading]);

    const canCreateTasks = useMemo(() =>
        ['admin', 'hr_manager', 'department_manager'].includes(user?.role),
        [user]
    );

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const fetchPromises = [apiGetTasks()];
            
            // --- YEH HAI POORA FIX ---
            if (canCreateTasks) {
                // Admin/Manager ko poori list chahiye
                fetchPromises.push(apiGetEmployees(), apiGetLeaveRequests());
            } else {
                // Employee ko sirf naam waali safe list chahiye
                fetchPromises.push(apiGetEmployeeNames()); 
            }
            // --- END OF FIX ---

            const responses = await Promise.all(fetchPromises);

            const tasksData = responses[0].data?.$values || [];
            setAllTasks(tasksData);

            if (canCreateTasks) {
                const usersData = responses[1].data?.$values || [];
                const leavesData = responses[2].data?.$values || [];
                setAllUsers(usersData);
                setApprovedLeaves(leavesData.filter(l => l.status === 'approved'));
            } else {
                // Employee ke liye user data (.$values nahi hoga)
                const usersData = responses[1].data?.$values || responses[1].data || [];
                setAllUsers(usersData);
            }

        } catch (error) {
            // Ab 403 error nahi aayega
            showToast("Could not fetch task data.", "error");
            setAllTasks([]);
            setAllUsers([]);
            setApprovedLeaves([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, canCreateTasks, updateCounter]);

    const handleSaveTask = async (taskData) => {
        try {
            if (editingTask) {
                await apiUpdateTask(editingTask.id, taskData);
                showToast('Task updated successfully!');
            } else {
                await apiAddTask(taskData);
                showToast('Task created successfully!');
            }
            fetchData(); // Turant update ke liye fetchData call karein
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save task.', 'error');
        }
        setIsCreateModalOpen(false);
        setEditingTask(null);
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await apiDeleteTask(taskId);
                showToast('Task deleted successfully.', 'info');
                fetchData();
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to delete task.', 'error');
            }
        }
    };

    const handleTaskStatusChange = async (taskId, newStatus) => {
        try {
            await apiUpdateTaskStatus(taskId, { status: newStatus });
            showToast('Task status updated!');
            fetchData(); // Data refresh karein
        } catch (error) {
            showToast('Failed to update task status.', 'error');
        }
        setIsDetailModalOpen(false); // Detail modal band karein (agar khula tha)
    };

    const handleOpenCreateModal = () => {
        setEditingTask(null);
        setIsCreateModalOpen(true);
    };

    const handleOpenEditModal = (task) => {
        setEditingTask(task);
        setIsCreateModalOpen(true);
    };

    const handleViewTask = (task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    const assignableUsers = useMemo(() => {
        if (!user || !allUsers.length || !canCreateTasks) return [];
        if (user.role === 'admin' || user.role === 'hr_manager') {
            return allUsers.filter(u => u.role !== 'admin');
        }
        if (user.role === 'department_manager') {
            return allUsers.filter(u => u.departmentId === user.departmentId && u.role === 'employee');
        }
        return [];
    }, [user, allUsers, canCreateTasks]);

    const myTasks = allTasks.filter(t => t.assignedToId === user.id);
    const assignedByMe = canCreateTasks ? allTasks.filter(t => t.assignedById === user.id) : [];

    return (
        <>
            <TaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSaveTask}
                assignableUsers={assignableUsers}
                approvedLeaves={approvedLeaves}
                editingTask={editingTask}
            />
            <TaskDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                task={selectedTask}
                onComplete={() => handleTaskStatusChange(selectedTask.id, 'completed')} // 'completed' status pass karein
                currentUser={user}
            />

            <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 space-y-6 min-h-screen">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-in-section">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Task Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {canCreateTasks ? "Assign and track tasks for your team." : "View tasks assigned to you."}
                        </p>
                    </div>
                    {canCreateTasks && (
                        <button onClick={handleOpenCreateModal} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center space-x-2">
                            <Plus /> <span>New Task</span>
                        </button>
                    )}
                </div>

                {loading ? <LoadingSpinner message="Loading tasks..." /> : (
                    <div className="space-y-6">
                        {/* --- MY TASKS (Sabke liye) --- */}
                        <div className="fade-in-section">
                            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">My Tasks</h2>
                            {myTasks.length > 0 ? (
                                <TaskBoard
                                    tasks={myTasks}
                                    allUsers={allUsers}
                                    onTaskStatusChange={handleTaskStatusChange}
                                    onViewTask={handleViewTask}
                                    canEdit={false} // Aap apne task edit/delete nahi kar sakte
                                />
                            ) : (
                                <EmptyState
                                    icon={CheckSquare}
                                    title="All Caught Up!"
                                    message="You have no pending tasks assigned to you."
                                />
                            )}
                        </div>

                        {/* --- ASSIGNED BY ME (Sirf Managers ke liye) --- */}
                        {canCreateTasks && (
                            <div className="fade-in-section">
                                <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Tasks I've Assigned</h2>
                                {assignedByMe.length > 0 ? (
                                    <TaskBoard
                                        tasks={assignedByMe}
                                        allUsers={allUsers}
                                        onTaskStatusChange={handleTaskStatusChange}
                                        onViewTask={handleViewTask}
                                        onEdit={handleOpenEditModal}
                                        onDelete={handleDeleteTask}
                                        canEdit={true} // Aap apne diye gaye tasks ko edit/delete kar sakte hain
                                    />
                                ) : (
                                    <EmptyState
                                        icon={CheckSquare}
                                        title="No Tasks Assigned"
                                        message="You haven't assigned any tasks yet. Click 'New Task' to start."
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default TaskManager;