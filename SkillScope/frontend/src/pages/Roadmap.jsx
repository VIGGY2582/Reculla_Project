import React, { useState, useEffect } from 'react';
import API from '../services/api';

const Roadmap = () => {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userProgress, setUserProgress] = useState([]);
    const [checkedTasks, setCheckedTasks] = useState(() => {
        const saved = localStorage.getItem('roadmap_checked_tasks');
        return saved ? JSON.parse(saved) : {};
    });
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchExistingRoadmap = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const res = await API.get(`/roadmap/${userId}`);
                if (res.data && res.data.roadmapContent) {
                    setRoadmap(res.data);
                }
            } catch (err) {
                if (err.response && err.response.status !== 404) {
                    console.error("Error fetching roadmap:", err.response?.data?.error || err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchProgress = async () => {
            try {
                const res = await API.get('/progress/mine');
                setUserProgress(res.data);
            } catch (err) {
                console.error("Error fetching progress:", err.response?.data?.error || err.message);
            }
        };

        fetchExistingRoadmap();
        fetchProgress();
    }, [userId]);

    useEffect(() => {
        localStorage.setItem('roadmap_checked_tasks', JSON.stringify(checkedTasks));
    }, [checkedTasks]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await API.post(`/roadmap/generate/${userId}`);
            setRoadmap(res.data);
            setCheckedTasks({}); // Clear progress for new roadmap
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskToggle = (dayIdx, taskIdx) => {
        const key = `${dayIdx}-${taskIdx}`;
        setCheckedTasks(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleMarkComplete = async (skillName) => {
        try {
            await API.post('/progress/update', {
                skill: skillName,
                status: 'COMPLETED'
            });
            // Update local progress state
            const res = await API.get('/progress/mine');
            setUserProgress(res.data);
            alert(`Great job! ${skillName} has been marked as completed.`);
        } catch (err) {
            console.error("Failed to update progress:", err);
            alert("Failed to update progress. Please try again.");
        }
    };

    const isSkillCompleted = (skillName) => {
        return userProgress.some(p => p.skill.toLowerCase() === skillName.toLowerCase() && p.status === 'COMPLETED');
    };

    const parsedPlan = roadmap ? (typeof roadmap.roadmapContent === 'string' ? JSON.parse(roadmap.roadmapContent) : roadmap.plan) : [];

    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="fw-bold text-primary mb-0">Learning Roadmap</h3>
                        <p className="text-secondary small mb-0">Track your daily progress and master your missing skills.</p>
                    </div>
                    <button className="btn btn-primary btn-lg rounded-pill shadow-sm" onClick={handleGenerate} disabled={loading}>
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Building...</>
                        ) : 'Generate 7-Day Plan'}
                    </button>
                </div>
            </div>

            {roadmap && (
                <div className="mb-5">
                    <div className="alert alert-info py-4 shadow-sm border-0 mb-5 d-flex align-items-center rounded-4">
                        <div className="bg-white rounded-circle p-3 me-4 shadow-sm">
                            <i className="bi bi-lightbulb-fill fs-2 text-primary"></i>
                        </div>
                        <div>
                            <h4 className="fw-bold text-primary mb-1">Target Role: {roadmap.role}</h4>
                            <p className="mb-0 text-secondary">We've broken down your skill gaps into a structured 7-day masterclass.</p>
                        </div>
                    </div>

                    <div className="row g-4 overflow-auto py-3 px-1" style={{ display: 'flex', flexWrap: 'nowrap', scrollbarWidth: 'thin' }}>
                        {parsedPlan.map((day, idx) => {
                            const completed = isSkillCompleted(day.topic);
                            return (
                                <div key={idx} className="col-md-4" style={{ minWidth: '380px' }}>
                                    <div className={`card h-100 shadow-sm border-0 rounded-4 transition-all ${completed ? 'bg-light' : ''}`}>
                                        <div className={`card-header py-3 fw-bold fs-5 text-center border-0 rounded-top-4 ${completed ? 'bg-success text-white' : 'bg-primary text-white'}`}>
                                            {completed ? <i className="bi bi-check-circle-fill me-2"></i> : null}
                                            Day {day.day}
                                        </div>
                                        <div className="card-body p-4 d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <h5 className={`fw-bold mb-0 ${completed ? 'text-success' : 'text-primary'}`}>{day.topic}</h5>
                                                {completed && <span className="badge bg-success opacity-75">Mastered</span>}
                                            </div>
                                            <p className="text-muted small mb-3">Complete the tasks below to gain proficiency.</p>
                                            <hr className="mt-0" />
                                            <ul className="list-group list-group-flush mb-4 flex-grow-1">
                                                {day.tasks.map((task, tIdx) => (
                                                    <li key={tIdx} className={`list-group-item d-flex align-items-center border-0 px-0 bg-transparent ${completed ? 'opacity-50' : ''}`}>
                                                        <div className="form-check">
                                                            <input 
                                                                className="form-check-input me-3 cursor-pointer" 
                                                                type="checkbox" 
                                                                id={`task-${idx}-${tIdx}`}
                                                                checked={checkedTasks[`${idx}-${tIdx}`] || completed}
                                                                onChange={() => handleTaskToggle(idx, tIdx)}
                                                                disabled={completed}
                                                                style={{ width: '1.2em', height: '1.2em' }}
                                                            />
                                                            <label className={`form-check-label small cursor-pointer ${checkedTasks[`${idx}-${tIdx}`] || completed ? 'text-decoration-line-through text-muted' : 'text-secondary'}`} htmlFor={`task-${idx}-${tIdx}`}>
                                                                {task}
                                                            </label>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <button 
                                                className={`btn w-100 rounded-pill fw-bold py-2 ${completed ? 'btn-outline-success disabled' : 'btn-outline-primary'}`}
                                                onClick={() => handleMarkComplete(day.topic)}
                                                disabled={completed}
                                            >
                                                {completed ? 'Module Mastered' : 'Mark Topic as Complete'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {!roadmap && !loading && (
                <div className="text-center mt-5 p-5 bg-white rounded-4 shadow-sm border-0 border-top border-5 border-primary">
                    <div className="display-1 mb-4 opacity-10">🗺️</div>
                    <h4 className="fw-bold">No roadmap found</h4>
                    <p className="text-muted fs-6 mt-3 mx-auto" style={{ maxWidth: '450px' }}>Generate a personalized 7-day learning roadmap based on your skill analysis to start your career masterclass.</p>
                </div>
            )}
        </div>
    );
};

export default Roadmap;
