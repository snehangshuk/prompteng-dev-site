import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function ModuleAssessment({ moduleId, moduleName, skills }) {
  const { siteConfig } = useDocusaurusContext();
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    checkedSkills: {}
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (skillId) => {
    setFormData(prev => ({
      ...prev,
      checkedSkills: {
        ...prev.checkedSkills,
        [skillId]: !prev.checkedSkills[skillId]
      }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateProgress = () => {
    const totalSkills = skills.length;
    const checkedCount = Object.values(formData.checkedSkills).filter(Boolean).length;
    return Math.round((checkedCount / totalSkills) * 100);
  };

  const getProgressLevel = () => {
    const progress = calculateProgress();
    if (progress === 100) return { label: 'Expert', message: "You've mastered this module! 🎉", color: '#059669' };
    if (progress >= 75) return { label: 'Advanced', message: 'Almost there!', color: '#3b82f6' };
    if (progress >= 40) return { label: 'Intermediate', message: "You're making great progress!", color: '#f59e0b' };
    return { label: 'Beginner', message: 'Keep practicing!', color: '#6b7280' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    const checkedSkillsList = skills
      .filter((_, index) => formData.checkedSkills[`skill-${index}`])
      .map(skill => skill.text);

    try {
      const apiEndpoint = siteConfig.customFields.apiEndpoint;
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: formData.studentName,
          studentEmail: formData.studentEmail,
          moduleId: moduleId,
          moduleName: moduleName,
          skills: checkedSkillsList,
          totalSkills: skills.length,
          checkedSkills: checkedSkillsList.length,
          progressPercentage: calculateProgress(),
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        }),
      });

      if (response.ok) {
        setStatus('✅ Thank you! Your progress has been recorded.');
        setFormData({
          studentName: '',
          studentEmail: '',
          checkedSkills: {}
        });
      } else {
        setStatus('❌ Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMsg = error.message || 'Unknown error';
      setStatus(`❌ Error: ${errorMsg}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const progressLevel = getProgressLevel();

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: 'var(--ifm-background-surface-color)'
        }}>
          <h3>Student Information</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="studentName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Name *
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--ifm-color-emphasis-300)',
                backgroundColor: 'var(--ifm-background-surface-color)',
                color: 'var(--ifm-font-color-base)'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="studentEmail" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email *
            </label>
            <input
              type="email"
              id="studentEmail"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--ifm-color-emphasis-300)',
                backgroundColor: 'var(--ifm-background-surface-color)',
                color: 'var(--ifm-font-color-base)'
              }}
            />
          </div>
        </div>

        <div style={{
          background: 'var(--ifm-color-emphasis-100)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3>Skills Checklist</h3>
          <p style={{ marginBottom: '20px' }}>Check the skills you've mastered:</p>

          {skills.map((skill, index) => (
            <div key={index} style={{ marginBottom: '12px' }}>
              {skill.category && index > 0 && skills[index - 1].category !== skill.category && (
                <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>{skill.category}:</h4>
              )}
              {skill.category && (index === 0 || skills[index - 1].category !== skill.category) && index === 0 && (
                <h4 style={{ marginBottom: '10px' }}>{skill.category}:</h4>
              )}
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.checkedSkills[`skill-${index}`] || false}
                  onChange={() => handleCheckboxChange(`skill-${index}`)}
                  style={{ marginRight: '10px', cursor: 'pointer', width: '18px', height: '18px' }}
                />
                <span style={{
                  textDecoration: formData.checkedSkills[`skill-${index}`] ? 'line-through' : 'none',
                  color: formData.checkedSkills[`skill-${index}`] ? 'var(--ifm-color-emphasis-600)' : 'var(--ifm-font-color-base)'
                }}>
                  {skill.text}
                </span>
              </label>
            </div>
          ))}

          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'var(--ifm-background-surface-color)',
            borderRadius: '8px',
            borderLeft: `4px solid ${progressLevel.color}`
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Progress: {calculateProgress()}%</strong> - {progressLevel.label}
            </div>
            <div style={{
              background: 'var(--ifm-color-emphasis-200)',
              height: '20px',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <div style={{
                background: progressLevel.color,
                height: '100%',
                width: `${calculateProgress()}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '14px', color: 'var(--ifm-color-emphasis-700)' }}>
              {progressLevel.message}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#25c2a0',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            width: '100%',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Submitting...' : 'Submit Progress'}
        </button>

        {status && (
          <div style={{
            marginTop: '15px',
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: status.includes('✅') ? 'var(--ifm-color-success-contrast-background)' : 'var(--ifm-color-danger-contrast-background)',
            color: status.includes('✅') ? 'var(--ifm-color-success-contrast-foreground)' : 'var(--ifm-color-danger-contrast-foreground)',
            border: `1px solid ${status.includes('✅') ? 'var(--ifm-color-success-dark)' : 'var(--ifm-color-danger-dark)'}`
          }}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
}
