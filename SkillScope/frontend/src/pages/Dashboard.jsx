import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Dashboard = () => {
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await API.get('/progress/mine');
                setProgressData(res.data);
            } catch (err) {
                console.error("Error fetching progress:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const stats = {
        total: progressData.length,
        inProgress: progressData.filter(p => p.status === 'IN_PROGRESS').length,
        completed: progressData.filter(p => p.status === 'COMPLETED').length,
    };

    const readinessScore = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return (
        <div className="container py-4">
            <div className="row mt-2 mb-5">
                <div className="col-md-12">
                    <div className="card border-0 p-0 overflow-hidden position-relative">
                        <div className="row g-0">
                            <div className="col-lg-7 d-flex align-items-center">
                                <div className="p-5 position-relative" style={{ zIndex: 1 }}>
                                    <h1 className="display-4 fw-bold text-primary mb-3">Welcome to Skill<span className="text-info">Scope</span> AI</h1>
                                    <p className="fs-5 text-secondary pe-lg-4" style={{ maxWidth: '600px' }}>
                                        Elevate your career with AI-powered skill analysis, personalized assessments, and customized learning roadmaps.
                                    </p>
                                    <Link to="/resume" className="btn btn-primary btn-lg mt-4 px-5 rounded-pill shadow">
                                        <i className="bi bi-rocket-takeoff me-2"></i> Get Started
                                    </Link>
                                </div>
                            </div>
                            <div className="col-lg-5 d-none d-lg-block bg-light position-relative" style={{ 
                                backgroundImage: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(45,212,191,0.1) 100%)',
                                minHeight: '350px' 
                            }}>
                                <img 
                                    src="/assets/hero-illustration.png" 
                                    alt="Tech Hero" 
                                    className="img-fluid position-absolute top-50 start-50 translate-middle"
                                    style={{ width: '85%', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))', animation: 'fadeIn 1s ease-out' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Career Progress Overview */}
            <div className="row mb-5">
                <div className="col-12">
                    <div className="d-flex align-items-center mb-4 ms-2">
                        <div className="bg-primary rounded-3 p-2 me-3 text-white shadow-sm">
                            <i className="bi bi-graph-up-arrow fs-5"></i>
                        </div>
                        <h4 className="fw-bold mb-0">Career Progress Overview</h4>
                    </div>
                </div>
                <div className="col-lg-8">
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 p-3 text-center">
                                <span className="text-muted small fw-medium mb-1">Total Skills</span>
                                <h2 className="fw-bold text-primary mb-0">{stats.total}</h2>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 p-3 text-center">
                                <span className="text-muted small fw-medium mb-1">In Progress</span>
                                <h2 className="fw-bold text-info mb-0">{stats.inProgress}</h2>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 p-3 text-center">
                                <span className="text-muted small fw-medium mb-1">Completed</span>
                                <h2 className="fw-bold text-success mb-0">{stats.completed}</h2>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="card border-0 shadow-sm p-4">
                                <h6 className="fw-bold mb-3">Recent Skills Breakdown</h6>
                                {loading ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                    </div>
                                ) : progressData.length > 0 ? (
                                    <div className="list-group list-group-flush border-0">
                                        {progressData.slice(0, 4).map((p, idx) => (
                                            <div key={idx} className="list-group-item border-0 px-0 py-3 bg-transparent">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-semibold">{p.skill}</span>
                                                    <span className={`badge ${p.status === 'COMPLETED' ? 'bg-success' : 'bg-info'} opacity-75`}>
                                                        {p.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                                                    <div 
                                                        className={`progress-bar ${p.status === 'COMPLETED' ? 'bg-success' : 'progress-bar-animated progress-bar-striped bg-info'}`} 
                                                        role="progressbar" 
                                                        style={{ width: p.status === 'COMPLETED' ? '100%' : '50%' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-light rounded-3">
                                        <p className="text-muted mb-0 small">No skills tracked yet. Start a skill analysis to populate this.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100 p-4 text-center d-flex flex-column justify-content-center align-items-center overflow-hidden position-relative">
                        <div className="position-absolute top-0 end-0 p-3 opacity-10">
                            <i className="bi bi-trophy display-1"></i>
                        </div>
                        <h6 className="fw-bold mb-4">Readiness Score</h6>
                        <div className="position-relative mb-4" style={{ height: '140px', width: '140px' }}>
                            <svg className="w-100 h-100" viewBox="0 0 36 36">
                                <path className="text-light" fill="none" strokeWidth="3" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path className="text-primary" fill="none" strokeWidth="3" strokeDasharray={`${readinessScore}, 100`} strokeLinecap="round" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <text x="18" y="20.35" className="fw-bold" textAnchor="middle" style={{ fontSize: '8px', fill: 'var(--dark-bg)', fontFamily: 'Outfit' }}>{readinessScore}%</text>
                            </svg>
                        </div>
                        <p className="text-muted small mb-0">Your overall career readiness based on completed skills and assessments.</p>
                    </div>
                </div>
            </div>

            <h4 className="fw-bold mb-4 ms-2">Your Career Tools</h4>
            <div className="row g-4 mb-5">
                {[
                    { title: 'Resume Upload', text: 'Upload your latest resume to start the AI analysis.', link: '/resume', img: '/assets/resume-icon.png', color: 'text-primary' },
                    { title: 'Skill Analysis', text: 'Identify your best job roles and the skills you need.', link: '/analysis', icon: '📊', color: 'text-info' },
                    { title: 'AI Assessment', text: 'Test your knowledge with AI-generated tasks.', link: '/assessment', img: '/assets/assessment-icon.png', color: 'text-success' },
                    { title: 'Learning Roadmap', text: 'Follow a personalized plan to bridge skill gaps.', link: '/roadmap', icon: '🗺️', color: 'text-warning' }
                ].map((item, index) => (
                    <div className="col-md-6 col-lg-3 d-flex align-items-stretch" key={index}>
                        <div className="card w-100 shadow-sm border-0 text-center p-4">
                            <div className="card-body d-flex flex-column justify-content-between align-items-center">
                                <div>
                                    <div className="mb-3 d-flex justify-content-center align-items-center" style={{ height: '80px', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.1))' }}>
                                        {item.img ? (
                                            <img src={item.img} alt={item.title} style={{ height: '70px', width: 'auto' }} />
                                        ) : (
                                            <div className="display-4">{item.icon}</div>
                                        )}
                                    </div>
                                    <h5 className={`card-title fw-bold ${item.color}`}>{item.title}</h5>
                                    <p className="card-text text-muted small mt-2">{item.text}</p>
                                </div>
                                <Link to={item.link} className="btn btn-outline-primary btn-sm rounded-pill mt-4 px-4 fw-medium w-100">
                                    Open Module
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;

