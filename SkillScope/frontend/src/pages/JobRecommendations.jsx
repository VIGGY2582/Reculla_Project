import React, { useState, useEffect } from 'react';
import API from '../services/api';

const JobRecommendations = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const userId = localStorage.getItem('userId');

    const dummyJobs = [
        { id: 1, title: 'Backend Developer', company: 'TCS', match: 87, location: 'Pune, India', type: 'Full-time', skills: ['Java', 'Spring Boot', 'PostgreSQL'], salary: '₹8 - 12 LPA' },
        { id: 2, title: 'Frontend Engineer', company: 'Google', match: 72, location: 'Bangalore, India', type: 'Remote', skills: ['React', 'TypeScript', 'Vite'], salary: '₹25 - 35 LPA' },
        { id: 3, title: 'Full Stack Developer', company: 'Amazon', match: 65, location: 'Hyderabad, India', type: 'Hybrid', skills: ['Node.js', 'React', 'AWS'], salary: '₹18 - 24 LPA' },
        { id: 4, title: 'Data Scientist', company: 'Microsoft', match: 45, location: 'Noida, India', type: 'Full-time', skills: ['Python', 'SQL', 'TensorFlow'], salary: '₹22 - 30 LPA' },
    ];

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await API.get(`/jobs/recommend/${userId}`);
                setJobs(res.data.length > 0 ? res.data : dummyJobs);
            } catch (err) {
                console.warn('Backend job API not found, using demo data.');
                setJobs(dummyJobs);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [userId]);

    const handleApply = (id) => {
        setApplying(id);
        setTimeout(() => {
            alert('Application submitted successfully! Recruiter will contact you soon.');
            setApplying(null);
        }, 1500);
    };

    const getMatchColor = (match) => {
        if (match >= 80) return 'bg-success';
        if (match >= 60) return 'bg-warning text-dark';
        return 'bg-danger';
    };

    return (
        <div className="container py-5">
            <div className="row mb-5 align-items-center">
                <div className="col-md-7">
                    <h2 className="display-6 fw-bold text-primary mb-2">Smart Job <span className="text-info">Recommendations</span></h2>
                    <p className="text-secondary fs-5">AI-driven job matches based on your latest skill analysis and assessments.</p>
                </div>
                <div className="col-md-5 text-md-end">
                    <div className="badge bg-light text-dark p-3 rounded-4 border shadow-sm">
                        Total Jobs Found: <span className="fw-bold text-primary ms-1">{jobs.length}</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Finding perfect matches for your profile...</p>
                </div>
            ) : (
                <div className="row g-4">
                    {jobs.map((job) => (
                        <div className="col-lg-6" key={job.id}>
                            <div className="card h-100 border-0 shadow-sm hover-lift p-2 rounded-4 overflow-hidden position-relative">
                                {/* Match Badge */}
                                <div className={`position-absolute top-0 end-0 m-3 badge ${getMatchColor(job.match)} rounded-pill px-3 py-2 shadow-sm`}>
                                    {job.match}% Match
                                </div>

                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="bg-light rounded-4 p-3 me-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <i className="bi bi-building fs-3 text-primary"></i>
                                        </div>
                                        <div>
                                            <h5 className="card-title fw-bold mb-1">{job.title}</h5>
                                            <p className="text-secondary mb-0 fw-medium">{job.company}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <small className="text-muted d-block mb-1">Location</small>
                                                <span className="fw-medium small"><i className="bi bi-geo-alt me-1 text-info"></i> {job.location}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block mb-1">Salary Range</small>
                                                <span className="fw-medium small text-success"><i className="bi bi-currency-rupee me-1"></i> {job.salary}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <small className="text-muted d-block mb-2">Required Skills</small>
                                        <div className="d-flex flex-wrap gap-2">
                                            {job.skills.map((skill, index) => (
                                                <span key={index} className="badge bg-light text-secondary border rounded-pill px-3 fw-normal">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between mt-auto pt-3 border-top border-light">
                                        <span className="badge bg-info-subtle text-info border border-info-subtle px-3 py-2 rounded-pill small">
                                            {job.type}
                                        </span>
                                        <button 
                                            className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                                            onClick={() => handleApply(job.id)}
                                            disabled={applying === job.id}
                                        >
                                            {applying === job.id ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Applying...
                                                </>
                                            ) : (
                                                <>Apply Now <i className="bi bi-arrow-right ms-1"></i></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-5 p-5 bg-dark text-white rounded-5 shadow-lg position-relative overflow-hidden">
                <div className="position-absolute top-0 end-0 p-5 opacity-25">
                    <i className="bi bi-lightning-charge display-1"></i>
                </div>
                <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
                    <div className="col-lg-8">
                        <h3 className="fw-bold mb-3">Want more personalized recommendations?</h3>
                        <p className="opacity-75 mb-0 fs-5">Upload a new resume or take a fresh assessment to let our AI refine your career path.</p>
                    </div>
                    <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                        <button className="btn btn-info btn-lg rounded-pill px-5 fw-bold shadow text-white">Upgrade Profile</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobRecommendations;
