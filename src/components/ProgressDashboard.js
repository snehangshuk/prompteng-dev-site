import React, { useState, useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function ProgressDashboard() {
  const { siteConfig } = useDocusaurusContext();
  const [email, setEmail] = useState('');
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modules = [
    { id: 'module-01', name: 'Module 1: Foundations' },
    { id: 'module-02', name: 'Module 2: Core Techniques' },
    { id: 'module-03', name: 'Module 3: Applications' },
    { id: 'module-04', name: 'Module 4: Integration' }
  ];

  const fetchProgress = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiEndpoint = siteConfig.customFields.apiEndpoint.replace('/submit', '/progress');
      const response = await fetch(`${apiEndpoint}?email=${encodeURIComponent(email)}`);

      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      } else {
        setError('Could not fetch progress data');
      }
    } catch (err) {
      setError('Error fetching progress: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!progressData || !progressData.assessments) return 0;
    const completed = progressData.assessments.length;
    return Math.round((completed / modules.length) * 100);
  };

  const getModuleStatus = (moduleId) => {
    if (!progressData || !progressData.assessments) return null;
    return progressData.assessments.find(a => a.moduleId === moduleId);
  };

  const getAverageProgress = () => {
    if (!progressData || !progressData.assessments || progressData.assessments.length === 0) return 0;
    const total = progressData.assessments.reduce((sum, a) => sum + parseInt(a.progressPercentage || 0), 0);
    return Math.round(total / progressData.assessments.length);
  };

  const getTotalSkillsMastered = () => {
    if (!progressData || !progressData.assessments) return 0;
    return progressData.assessments.reduce((sum, a) => sum + parseInt(a.checkedSkills || 0), 0);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h3>View Your Progress</h3>
        <p>Enter your email to see your learning progress across all modules.</p>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchProgress()}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '16px'
            }}
          />
          <button
            onClick={fetchProgress}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#25c2a0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'View Progress'}
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
      </div>

      {progressData && (
        <div>
          <div style={{
            background: 'var(--ifm-color-emphasis-100)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h3>Overall Progress</h3>
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                background: '#e0e0e0',
                height: '30px',
                borderRadius: '15px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #25c2a0, #1fa588)',
                  height: '100%',
                  width: `${calculateProgress()}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  transition: 'width 0.5s ease'
                }}>
                  {calculateProgress()}%
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#25c2a0' }}>
                  {progressData.assessments.length}/{modules.length}
                </div>
                <div style={{ color: 'var(--ifm-color-emphasis-700)' }}>Modules Completed</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#25c2a0' }}>
                  {getTotalSkillsMastered()}
                </div>
                <div style={{ color: 'var(--ifm-color-emphasis-700)' }}>Skills Mastered</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#25c2a0' }}>
                  {getAverageProgress()}%
                </div>
                <div style={{ color: 'var(--ifm-color-emphasis-700)' }}>Avg Progress</div>
              </div>
            </div>
          </div>

          <h3>Module Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {modules.map((module) => {
              const status = getModuleStatus(module.id);
              return (
                <div
                  key={module.id}
                  style={{
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '8px',
                    padding: '15px',
                    background: status ? 'var(--ifm-color-emphasis-100)' : 'var(--ifm-background-surface-color)',
                    color: 'var(--ifm-font-color-base)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'var(--ifm-font-color-base)' }}>
                      <h4 style={{ margin: 0, color: 'var(--ifm-font-color-base)' }}>
                        {status ? '✅' : '⬜'} {module.name}
                      </h4>
                      {status && (
                        <div style={{ marginTop: '10px', fontSize: '14px' }}>
                          <div style={{ color: 'var(--ifm-font-color-base)' }}><strong>Completed:</strong> {new Date(status.timestamp).toLocaleDateString()}</div>
                          <div style={{ color: 'var(--ifm-font-color-base)' }}><strong>Progress:</strong> {status.progressPercentage}% ({status.checkedSkills}/{status.totalSkills} skills)</div>
                          {status.skills && (
                            <details style={{ marginTop: '12px' }}>
                              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--ifm-color-primary)', userSelect: 'none' }}>
                                ✓ View Mastered Skills
                              </summary>
                              <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px', color: 'var(--ifm-font-color-base)' }}>
                                {status.skills.split(';').map((skill, idx) => (
                                  <li key={idx} style={{ marginTop: '4px', color: 'var(--ifm-font-color-base)' }}>{skill.trim()}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                    {status && (
                      <div style={{
                        fontSize: '48px',
                        color: 'var(--ifm-color-primary)'
                      }}>
                        {status.progressPercentage}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
