import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
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
