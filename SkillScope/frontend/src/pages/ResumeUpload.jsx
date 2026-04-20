import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const ResumeUpload = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await API.post('/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Resume uploaded successfully! Redirecting to skill analysis...');
            setTimeout(() => navigate('/analysis'), 1500);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to upload resume.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-sm border-0 p-4">
                <h3 className="fw-bold text-primary mb-4">Upload Your Resume</h3>
                <p className="text-secondary mb-4">Upload your resume in PDF or DOCX format. Our AI will analyze your skills and suggest the best job roles.</p>
                {message && <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
                <form onSubmit={handleUpload}>
                    <div className="input-group mb-3">
                        <input type="file" className="form-control form-control-lg" onChange={handleFileChange} accept=".pdf,.docx" />
                        <button className="btn btn-primary btn-lg px-4" type="submit" disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResumeUpload;
