import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { CheckSquare, Square, Plus, Trash2, ClipboardCheck, Save } from 'lucide-react';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import EmptyState from '../Common/EmptyState';
import {
    apiGetEmployees,
    apiGetOnboardingChecklist,
    apiUpdateOnboardingChecklist
} from '../../apiService';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const Onboarding = () => {
    const { user } = useAuth();
    const { updateCounter } = useNotification();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [checklist, setChecklist] = useState([]);
    const [initialChecklist, setInitialChecklist] = useState([]);
    const [newItemText, setNewItemText] = useState('');
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingChecklist, setLoadingChecklist] = useState(false);

    // --- NAYA LOGIC: User roles ko alag-alag pehchan'na ---
    const isFullManager = useMemo(() => 
        user.role === 'admin' || user.role === 'hr_manager'
    , [user.role]);
    
    const isDeptManager = useMemo(() => 
        user.role === 'department_manager'
    , [user.role]);

    // Dropdown woh log dekhenge jo ya toh full manager hain ya dept manager
    const canSeeDropdown = isFullManager || isDeptManager;
    
    // Edit woh log kar sakte hain jo dropdown dekh sakte hain + employee (khud ka)
    // (Backend permission check bhi karega)
    const canEditChecklist = canSeeDropdown || user.id.toString() === selectedEmployeeId;
    // --- END NAYA LOGIC ---


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
        if (!loadingEmployees) {
            const sections = document.querySelectorAll('.fade-in-section');
            setElements(sections);
        }
    }, [setElements, loadingEmployees, selectedEmployeeId]);

    // Employee list fetch karne ka logic (Updated)
    useEffect(() => {
        const fetchEmployees = async () => {
            if (!user) return;
            
            // Agar user 'employee' hai, toh list fetch na karein, sirf khud ko select karein
            if (!canSeeDropdown) {
                setLoadingEmployees(false);
                setSelectedEmployeeId(user.id.toString());
                return;
            }

            // Agar user manager (Admin, HR, ya Dept) hai, toh list fetch kare
            setLoadingEmployees(true);
            try {
                // apiGetEmployees() ko 'admin', 'hr_manager', 'department_manager' roles allowed hain
                const response = await apiGetEmployees();
                const employeesData = response.data?.$values || [];
                
                if (isFullManager) {
                    // Admin/HR ko sab dikhega
                    setEmployees(employeesData);
                } else if (isDeptManager) {
                    // Dept Manager ko sirf apni team + khud
                    const myTeam = employeesData.filter(e => 
                        e.departmentId === user.departmentId || e.id === user.id
                    );
                    setEmployees(myTeam);
                    // Automatically khud ko select karein
                    setSelectedEmployeeId(user.id.toString());
                }
            } catch (error) {
                showToast("Could not fetch employees.", "error");
                setEmployees([]);
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, [user, canSeeDropdown, isFullManager, isDeptManager]);

    // Checklist fetch karne ka logic
    const fetchChecklist = async () => {
        if (selectedEmployeeId) {
            setLoadingChecklist(true);
            try {
                const response = await apiGetOnboardingChecklist(selectedEmployeeId);
                // Dono tarah ke response handle karein ($values ya direct array)
                const checklistData = response.data?.$values || response.data || [];
                setChecklist(checklistData);
                setInitialChecklist(JSON.parse(JSON.stringify(checklistData)));
            } catch (error) {
                // Error toast ko silent kar diya taaki naye employee ke liye 404 par toast na aaye
                console.error("Checklist fetch error:", error.response?.data);
                setChecklist([]);
                setInitialChecklist([]);
            } finally {
                setLoadingChecklist(false);
            }
        } else {
            setChecklist([]);
            setInitialChecklist([]);
        }
    };
    
    // Jab bhi selected employee badle ya signalR se update aaye, checklist fetch karein
    useEffect(() => {
        fetchChecklist();
    }, [selectedEmployeeId, updateCounter]);


    const handleToggleItem = (index) => {
        if (!canEditChecklist) return; // Sirf permission hone par hi toggle karein
        const updatedList = [...checklist];
        updatedList[index].completed = !updatedList[index].completed;
        setChecklist(updatedList);
    };

    const handleAddItem = () => {
        if (newItemText.trim()) {
            const updatedList = [...checklist, { text: newItemText, completed: false }];
            setChecklist(updatedList);
            setNewItemText('');
        }
    };

    const handleDeleteItem = (indexToDelete) => {
        const updatedList = checklist.filter((_, index) => index !== indexToDelete);
        setChecklist(updatedList);
    };

    const handleSaveChanges = async () => {
        try {
            await apiUpdateOnboardingChecklist({
                employeeId: parseInt(selectedEmployeeId),
                tasks: checklist
            });
            showToast("Checklist saved successfully!");
            setInitialChecklist(JSON.parse(JSON.stringify(checklist)));
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to save checklist.", "error");
        }
    };

    // Check karein ki local state aur save kiye gaye state mein farak hai ya nahi
    const hasChanges = JSON.stringify(checklist) !== JSON.stringify(initialChecklist);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 min-h-screen space-y-6">
            <div className="fade-in-section">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Onboarding / Offboarding</h1>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto fade-in-section">
                
                {/* Dropdown ab role ke hisaab se dikhega */}
                {canSeeDropdown ? (
                    <>
                        <label className="font-medium text-slate-700 dark:text-slate-200">
                            {isDeptManager ? "Select Team Member:" : "Select Employee:"}
                        </label>
                        {loadingEmployees ? <LoadingSpinner /> : (
                            <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full p-2 border rounded mt-1 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                                
                                {/* Admin/HR ke liye default option */}
                                {isFullManager && <option value="">-- Select an Employee --</option>}
                                
                                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} {e.id === user.id ? "(Me)" : ""}</option>)}
                            </select>
                        )}
                    </>
                ) : (
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                        My Onboarding Checklist
                    </h2>
                )}
                {/* --- END UPDATE --- */}


                {selectedEmployeeId && (
                    <div className="mt-6 fade-in-section">
                        <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-6">
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Checklist</h2>
                            {hasChanges && canEditChecklist && (
                                <button onClick={handleSaveChanges} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-teal-700">
                                    <Save size={16} /> Save Changes
                                </button>
                            )}
                        </div>

                        {loadingChecklist ? <LoadingSpinner message="Loading checklist..." /> : (
                            checklist.length > 0 ? (
                                <div className="mt-4 space-y-3">
                                    {checklist.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <button onClick={() => handleToggleItem(i)} disabled={!canEditChecklist} className={canEditChecklist ? 'cursor-pointer' : 'cursor-default'}>
                                                {item.completed ? <CheckSquare className="text-green-500" /> : <Square className="text-slate-400" />}
                                            </button>
                                            <span className={`flex-grow ${item.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{item.text}</span>
                                            {canEditChecklist && (
                                                <button onClick={() => handleDeleteItem(i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-4"><EmptyState icon={ClipboardCheck} title="No Checklist Found" message={canEditChecklist ? "Start by adding the first item below." : "No checklist has been assigned to you yet."} /></div>
                            )
                        )}

                        {canEditChecklist && (
                            <div className="mt-4 flex gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                                <input value={newItemText} onChange={e => setNewItemText(e.target.value)} className="flex-grow p-2 border rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600" placeholder="New checklist item..." />
                                <button onClick={handleAddItem} className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600"><Plus /></button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;