import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import CodeEditor from '../components/CodeEditor';

const Assessment = () => {
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();

    const handleGenerate = async () => {
        setLoading(true);
        setSubmitted(false);
        setSelectedAnswers({});
        try {
            const res = await API.post(`/assessment/generate/${userId}`);
            setAssessment(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (questionIdx, option) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionIdx]: option
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await API.post('/assessment/submit', { ...selectedAnswers, code });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to submit assessment');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCode = () => {
        console.log("Submitted Code:", code);
        // Demo-safe fallback
        alert("Coding solution saved to current session!");
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0 p-4 mb-4 position-relative overflow-hidden">
                <div className="position-absolute top-0 end-0 h-100 w-50" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.05))',
                    zIndex: 0
                }}></div>
                <div className="d-flex justify-content-between align-items-center position-relative" style={{ zIndex: 1 }}>
                    <div>
                        <h3 className="fw-bold text-primary mb-1">AI Career Assessment</h3>
                        <p className="text-secondary mb-0 fw-medium">
                            <i className="bi bi-briefcase me-2"></i>Test your knowledge in {assessment?.role || 'your domain'}
                        </p>
                    </div>
                    <button className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm" onClick={handleGenerate} disabled={loading}>
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</>
                        ) : 'Generate New Assessment'}
                    </button>
                </div>
            </div>

            {submitted && (
                <div className="alert alert-success shadow-sm border-0 p-4 mb-4 text-center rounded-4">
                    <h4 className="fw-bold mb-2">🎉 Assessment Submitted!</h4>
                    <p className="mb-0 fs-6">Your answers have been saved. We'll analyze your performance shortly.</p>
                </div>
            )}

            {assessment && !submitted && (
                <div className="row g-4">
                    <div className="col-md-7">
                        <div className="card border-0 p-4 mb-4" style={{ background: 'transparent', boxShadow: 'none' }}>
                            <h4 className="fw-bold mb-4 text-dark"><i className="bi bi-list-task me-2 text-primary"></i>Questions</h4>
                            {assessment.questions.map((q, idx) => {
                                const isString = typeof q === 'string';
                                const questionText = isString ? q : q.question;
                                const options = isString ? [] : (q.options || []);

                                return (
                                    <div key={idx} className="mb-4 p-4 bg-white rounded-4 shadow-sm border-0 transition-all hover-lift">
                                        <p className="fw-bold mb-3 fs-5">
                                            <span className="badge bg-primary me-2 rounded-circle px-2 py-1">{idx + 1}</span> 
                                            {questionText}
                                        </p>
                                        <div className="list-group border-0">
                                            {options.map((opt, oIdx) => (
                                                <div key={oIdx} className="list-group-item d-flex align-items-center border-0 px-3 py-2 mb-2 rounded-3 bg-light">
                                                    <input 
                                                        className="form-check-input me-3 mt-0 cursor-pointer" 
                                                        style={{ width: '1.2rem', height: '1.2rem' }}
                                                        type="radio" 
                                                        name={`q${idx}`} 
                                                        id={`q${idx}_${oIdx}`}
                                                        onChange={() => handleOptionChange(idx, opt)}
                                                        checked={selectedAnswers[idx] === opt}
                                                    />
                                                    <label className="form-check-label w-100 cursor-pointer fw-medium" htmlFor={`q${idx}_${oIdx}`}>{opt}</label>
                                                </div>
                                            ))}
                                            {options.length === 0 && (
                                                <div className="ms-3 p-3 bg-light rounded-3 border-start border-4 border-info text-muted small">
                                                    <i className="bi bi-info-circle me-2"></i>Enter your response or select above
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            <button 
                                className="btn btn-success btn-lg w-100 mt-2 fw-bold shadow-sm rounded-pill py-3 fs-5" 
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Submit Assessment'}
                            </button>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="card shadow border-0 p-4 bg-dark text-white sticky-top rounded-4" style={{ top: '100px' }}>
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-info rounded p-2 me-3 text-dark">
                                    <i className="bi bi-code-slash fs-4"></i>
                                </div>
                                <h4 className="fw-bold mb-0 text-white">Coding Problem</h4>
                            </div>
                            <hr className="bg-secondary opacity-50 mb-4" />
                            <h5 className="fw-bold text-info">{assessment.coding.title}</h5>
                            <p className="text-light opacity-75 lh-lg mb-0">{assessment.coding.description}</p>
                            
                            <CodeEditor 
                                value={code}
                                onChange={setCode}
                                language="java"
                                placeholder="// Write your code solution here..."
                            />

                            <button 
                                className="btn btn-info btn-lg w-100 mt-4 fw-bold shadow-sm rounded-pill text-white"
                                onClick={handleSubmitCode}
                            >
                                <i className="bi bi-cloud-upload me-2"></i> Submit Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {!assessment && !loading && (
                <div className="text-center mt-5 p-5 bg-white rounded-4 shadow-sm border-0 mx-auto" style={{ maxWidth: '600px' }}>
                    <div className="display-1 mb-4 opacity-25 text-primary">🎯</div>
                    <h4 className="fw-bold text-dark">Ready to test your skills?</h4>
                    <p className="text-muted fs-5 mt-3">Generate a new career assessment above to get started.</p>
                </div>
            )}
        </div>
    );
};

export default Assessment;
