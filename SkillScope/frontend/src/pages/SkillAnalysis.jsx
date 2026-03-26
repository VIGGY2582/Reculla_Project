import React, { useState } from 'react';
import API from '../services/api';

const SkillAnalysis = () => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const userId = localStorage.getItem('userId');

    const handleAnalyze = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await API.get(`/skills/analyze/${userId}`);
            setAnalysis(res.data);
        } catch (err) {
            setError('Failed to fetch analysis. Please ensure your resume is uploaded.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h3 className="fw-bold text-primary mb-0">Skill Gap Analysis</h3>
                    <button className="btn btn-primary btn-lg" onClick={handleAnalyze} disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze Skills'}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger shadow-sm">{error}</div>}

            {analysis && (
                <div className="row g-4">
                    <div className="col-md-5">
                        <div className="card shadow-sm border-0 h-100 p-3 bg-light">
                            <div className="card-body">
                                <h5 className="fw-bold text-primary">Best Role Match</h5>
                                <h2 className="display-6 fw-bold my-3">{analysis.bestRole}</h2>
                                <p className="text-secondary">Based on our AI analysis, this is the role you are most qualified for right now.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-7">
                        <div className="card shadow-sm border-0 h-100 p-3">
                            <div className="card-body">
                                <h5 className="fw-bold text-danger mb-3">Missing Skills to Master</h5>
                                <div className="d-flex flex-wrap gap-2">
                                    {analysis.missingSkills.map((skill, index) => (
                                        <span key={index} className="badge bg-danger p-2 fs-6">{skill}</span>
                                    ))}
                                    {analysis.missingSkills.length === 0 && <p className="text-success">You have all the required skills for this role!</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {!analysis && !loading && !error && (
                <div className="text-center mt-5 p-5 bg-light rounded shadow-sm">
                    <p className="text-muted fs-5">Click the "Analyze Skills" button to retrieve your profile analysis.</p>
                </div>
            )}
        </div>
    );
};

export default SkillAnalysis;
