import React, { useState } from 'react';
import API from '../services/api';

const Roadmap = () => {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(false);
    const userId = localStorage.getItem('userId');

    React.useEffect(() => {
        const fetchExistingRoadmap = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const res = await API.get(`/roadmap/${userId}`);
                if (res.data && res.data.roadmapContent) {
                    setRoadmap(res.data);
                }
            } catch (err) {
                // If 404, just ignore, it means no roadmap generated yet
                if (err.response && err.response.status !== 404) {
                    console.error("Error fetching roadmap:", err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchExistingRoadmap();
    }, [userId]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await API.post(`/roadmap/generate/${userId}`);
            setRoadmap(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const parsedPlan = roadmap ? (typeof roadmap.roadmapContent === 'string' ? JSON.parse(roadmap.roadmapContent) : roadmap.plan) : [];

    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h3 className="fw-bold text-primary mb-0">Learning Roadmap</h3>
                    <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={loading}>
                        {loading ? 'Building Roadmap...' : 'Generate 7-Day Plan'}
                    </button>
                </div>
            </div>

            {roadmap && (
                <div className="mb-5">
                    <div className="alert alert-info py-4 shadow-sm border-0 mb-5 d-flex align-items-center">
                        <i className="bi-lightbulb fs-2 me-4 text-primary"></i>
                        <div>
                            <h4 className="fw-bold text-primary mb-1">Target Role: {roadmap.role}</h4>
                            <p className="mb-0 text-secondary">Follow this personalized 7-day roadmap to master missing skills.</p>
                        </div>
                    </div>

                    <div className="row g-4 overflow-auto py-2" style={{ display: 'flex', flexWrap: 'nowrap' }}>
                        {parsedPlan.map((day, idx) => (
                            <div key={idx} className="col-md-4" style={{ minWidth: '350px' }}>
                                <div className="card h-100 shadow border-0 position-relative">
                                    <div className="card-header bg-primary text-white py-3 fw-bold fs-5 text-center">Day {day.day}</div>
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold text-primary mb-3">Topic: {day.topic}</h5>
                                        <hr />
                                        <ul className="list-group list-group-flush">
                                            {day.tasks.map((task, tIdx) => (
                                                <li key={tIdx} className="list-group-item d-flex align-items-center border-0 px-0">
                                                    <input className="form-check-input me-3" type="checkbox" />
                                                    <span className="text-secondary small">{task}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {!roadmap && !loading && (
                <div className="text-center mt-5 p-5 bg-light rounded shadow-sm">
                    <p className="text-muted fs-5">Generate a personalized 7-day learning roadmap to start your career masterclass.</p>
                </div>
            )}
        </div>
    );
};

export default Roadmap;
