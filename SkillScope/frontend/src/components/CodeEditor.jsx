import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ value, onChange, language = 'java', placeholder = '// Write your code here...' }) => {
    return (
        <div className="code-editor-wrapper mt-3 rounded-4 overflow-hidden border border-secondary border-opacity-25 shadow-lg">
            <div className="bg-dark px-3 py-2 d-flex justify-content-between align-items-center border-bottom border-white border-opacity-10">
                <div className="d-flex gap-1">
                    <div className="rounded-circle bg-danger opacity-75" style={{ width: '10px', height: '10px' }}></div>
                    <div className="rounded-circle bg-warning opacity-75" style={{ width: '10px', height: '10px' }}></div>
                    <div className="rounded-circle bg-success opacity-75" style={{ width: '10px', height: '10px' }}></div>
                </div>
                <div className="badge bg-black border border-secondary border-opacity-25 text-info fw-bold extra-small">
                    {language.toUpperCase()}
                </div>
            </div>
            <Editor
                height="250px"
                defaultLanguage={language}
                theme="vs-dark"
                value={value}
                onChange={(val) => onChange(val)}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    automaticLayout: true,
                    padding: { top: 15, bottom: 15 },
                    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                    cursorStyle: 'line',
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    contextmenu: false
                }}
            />
            <div className="bg-dark px-3 py-1 border-top border-white border-opacity-10 d-flex justify-content-end">
                <span className="text-secondary small opacity-50" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-cpu me-1"></i> Ready for execution
                </span>
            </div>
        </div>
    );
};

export default CodeEditor;
