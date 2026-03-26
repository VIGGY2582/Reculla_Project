import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light sticky-top shadow-sm mb-4 py-3">
            <div className="container">
                <Link className="navbar-brand fs-4" to="/dashboard">
                    Skill<span className="text-info">Scope</span> AI
                </Link>
                <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {!token ? (
                            <>
                                <li className="nav-item mx-1">
                                    <Link className="nav-link fw-medium" to="/login">Login</Link>
                                </li>
                                <li className="nav-item mx-1">
                                    <Link className="btn btn-primary px-4 ms-2 rounded-pill" to="/register">Register</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item mx-1">
                                    <Link className="nav-link fw-medium" to="/dashboard">Dashboard</Link>
                                </li>
                                <li className="nav-item mx-1">
                                    <Link className="nav-link fw-medium" to="/resume">Upload Resume</Link>
                                </li>
                                <li className="nav-item mx-1">
                                    <Link className="nav-link fw-medium" to="/analysis">Skills</Link>
                                </li>
                                <li className="nav-item mx-1">
                                    <Link className="nav-link fw-medium" to="/assessment">Assessment</Link>
                                </li>
                                <li className="nav-item mx-1">
                                    <Link className="nav-link fw-medium" to="/roadmap">Roadmap</Link>
                                </li>
                                <li className="nav-item ms-3">
                                    <button className="btn btn-outline-danger btn-sm rounded-pill px-4 fw-bold" onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
