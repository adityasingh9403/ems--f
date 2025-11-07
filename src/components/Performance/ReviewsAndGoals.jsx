import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext'; // 1. Naya import
import { apiGetEmployees, apiGetGoals, apiAddGoal, apiDeleteGoal, apiGetReviews, apiAddReview } from '../../apiService';
import { showToast } from '../../utils/uiHelpers';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Plus, Trash2, Star } from 'lucide-react';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const ReviewsAndGoals = () => {
    const { user } = useAuth();
    const { updateCounter } = useNotification(); // 2. Context se counter lein
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [goals, setGoals] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [newGoal, setNewGoal] = useState({ goalDescription: '', targetDate: '' });
    const [newReview, setNewReview] = useState({ reviewPeriod: `Q4 ${new Date().getFullYear()}`, rating: 3, comments: '' });
    const [loading, setLoading] = useState(true);

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
    }, [setElements, loading, selectedEmployeeId]);

    const fetchManagableEmployees = async () => {
        setLoading(true);
        try {
            const res = await apiGetEmployees();
            const employeesData = res.data?.$values || [];
            if (user.role === 'department_manager') {
                setEmployees(employeesData.filter(e => e.departmentId === user.departmentId));
            } else {
                setEmployees(employeesData);
            }
        } catch (error) {
            showToast("Could not fetch employees.", "error");
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeData = async () => {
        if (selectedEmployeeId) {
            setLoading(true);
            try {
                const [goalsRes, reviewsRes] = await Promise.all([
                    apiGetGoals(selectedEmployeeId),
                    apiGetReviews(selectedEmployeeId)
                ]);

                const goalsData = goalsRes.data?.$values || [];
                const reviewsData = reviewsRes.data?.$values || [];

                setGoals(goalsData);
                setReviews(reviewsData);
            } catch (error) {
                showToast("Could not fetch performance data.", "error");
                setGoals([]);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchManagableEmployees();
    }, [user]);

    // 3. 'updateCounter' ko dependency array mein add karein
    useEffect(() => {
        fetchEmployeeData();
    }, [selectedEmployeeId, updateCounter]);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!newGoal.goalDescription || !newGoal.targetDate) return showToast("Please fill all goal fields.", "error");
        try {
            await apiAddGoal({ ...newGoal, employeeId: selectedEmployeeId });
            showToast("Goal added successfully!");
            setNewGoal({ goalDescription: '', targetDate: '' });
            // fetchData() ki zaroorat nahi, signal se update hoga
        } catch (error) {
            showToast("Failed to add goal.", "error");
        }
    };
    
    const handleDeleteGoal = async (goalId) => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            try {
                await apiDeleteGoal(goalId);
                showToast("Goal deleted.", "info");
                // fetchData() ki zaroorat nahi, signal se update hoga
            } catch (error) {
                showToast("Failed to delete goal.", "error");
            }
        }
    };

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!newReview.comments) return showToast("Comments are required for a review.", "error");
        try {
            await apiAddReview({ ...newReview, employeeId: selectedEmployeeId });
            showToast("Review added successfully!");
            setNewReview({ reviewPeriod: `Q1 ${new Date().getFullYear() + 1}`, rating: 3, comments: '' });
            // fetchData() ki zaroorat nahi, signal se update hoga
        } catch (error) {
            showToast("Failed to add review.", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm fade-in-section">
                <label className="font-medium text-slate-700 dark:text-slate-200">Select Employee to Manage</label>
                <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full p-2 mt-1 border rounded-lg bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100">
                    <option value="">-- Select Employee --</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                </select>
            </div>

            {loading && selectedEmployeeId && <LoadingSpinner message="Loading performance data..." />}

            {!loading && selectedEmployeeId && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Goals Section */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm space-y-4 fade-in-section">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Goals</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {goals.map(goal => (
                                <div key={goal.id} className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="text-slate-800 dark:text-slate-200">{goal.goalDescription}</p>
                                        <small className="text-slate-500 dark:text-slate-400">Target: {goal.targetDate} | Status: {goal.status}</small>
                                    </div>
                                    <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-500"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddGoal} className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                            <input value={newGoal.goalDescription} onChange={e => setNewGoal({...newGoal, goalDescription: e.target.value})} placeholder="New Goal Description" className="w-full p-2 border rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                            <input type="date" value={newGoal.targetDate} onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})} className="w-full p-2 border rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-600"><Plus size={16}/> Add Goal</button>
                        </form>
                    </div>

                    {/* Reviews Section */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm space-y-4 fade-in-section">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Performance Reviews</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {reviews.map(review => (
                                <div key={review.id} className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{review.reviewPeriod}</p>
                                        <div className="flex items-center">{[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? 'text-yellow-400' : 'text-slate-300'}/>)}</div>
                                    </div>
                                    <p className="text-sm mt-1 text-slate-700 dark:text-slate-300">{review.comments}</p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddReview} className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                            <input value={newReview.reviewPeriod} onChange={e => setNewReview({...newReview, reviewPeriod: e.target.value})} placeholder="Review Period (e.g., Q4 2025)" className="w-full p-2 border rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                            <textarea value={newReview.comments} onChange={e => setNewReview({...newReview, comments: e.target.value})} placeholder="Review comments..." className="w-full p-2 border rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600" rows={3}></textarea>
                            <div>
                                <label className="text-sm text-slate-600 dark:text-slate-300">Rating:</label>
                                <select value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})} className="p-2 border rounded ml-2 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                                    <option value={1}>1 (Poor)</option>
                                    <option value={2}>2 (Needs Improvement)</option>
                                    <option value={3}>3 (Meets Expectations)</option>
                                    <option value={4}>4 (Exceeds Expectations)</option>
                                    <option value={5}>5 (Outstanding)</option>
                                </select>
                            </div>
                            <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 hover:bg-green-600"><Plus size={16}/> Add Review</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsAndGoals;