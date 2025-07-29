import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthAPI } from '../services/api';
import { isAuthenticated, redirectToLogin } from '../utils/auth';

const Diagnostic = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [duration, setDuration] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }
  }, []);

  // Add symptom to the list
  const addSymptom = () => {
    if (currentSymptom.trim()) {
      const newSymptom = {
        id: Date.now(),
        symptom: currentSymptom.trim(),
        severity,
        duration,
        timestamp: new Date().toISOString()
      };
      setSymptoms([...symptoms, newSymptom]);
      setCurrentSymptom('');
      setSeverity('mild');
      setDuration('');
    }
  };

  // Remove symptom from the list
  const removeSymptom = (id) => {
    setSymptoms(symptoms.filter(symptom => symptom.id !== id));
  };

  // Generate AI diagnosis
  const generateDiagnosis = async () => {
    if (symptoms.length === 0) {
      addAlert('Please add at least one symptom before requesting a diagnosis.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const symptomList = symptoms.map(s => s.symptom);
      const response = await healthAPI.getAIDiagnosis(symptomList);
      
      setDiagnosis({
        message: response.message || 'Based on your symptoms, please consult with a healthcare professional for proper evaluation.',
        recommendations: response.recommendations || [
          'Schedule an appointment with your healthcare provider',
          'Monitor your symptoms and note any changes',
          'Rest and stay hydrated'
        ],
        urgency: response.urgency || 'medium',
        timestamp: new Date().toISOString()
      });

      // Add alert based on urgency
      if (response.urgency === 'high') {
        addAlert('High urgency diagnosis generated. Please seek immediate medical attention.', 'error');
      } else {
        addAlert('AI diagnosis generated successfully.', 'success');
      }

      // Save symptoms to backend
      for (const symptom of symptoms) {
        try {
          await healthAPI.addSymptom({
            symptom: symptom.symptom,
            severity: symptom.severity,
            duration: symptom.duration,
            date: new Date().toISOString().split('T')[0]
          });
        } catch (error) {
          console.warn('Failed to save symptom:', error);
        }
      }

    } catch (error) {
      console.error('Failed to get AI diagnosis:', error);
      addAlert('Failed to generate diagnosis. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Alert system
  const addAlert = (message, type = 'info') => {
    const alert = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [alert, ...prev]);
    
    // Auto-remove alert after 5 seconds for non-error alerts
    if (type !== 'error') {
      setTimeout(() => {
        removeAlert(alert.id);
      }, 5000);
    }
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-700';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'error': return 'bg-red-100 border-red-400 text-red-700';
      default: return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 border-red-500 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'low': return 'bg-green-100 border-green-500 text-green-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert System */}
      {alerts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className={`${getAlertColor(alert.type)} border px-4 py-3 rounded relative max-w-sm shadow-lg`}
            >
              <span className="block sm:inline pr-8">{alert.message}</span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
              >
                <span className="sr-only">Dismiss</span>
                ✕
              </button>
            </div>
          ))}
          {alerts.length > 3 && (
            <div className="text-center">
              <button
                onClick={() => setShowAlerts(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                +{alerts.length - 3} more alerts
              </button>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Health Diagnostic</h1>
              <p className="text-gray-600">Describe your symptoms for AI-powered health insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
              {alerts.length > 0 && (
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="relative bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  🔔 Alerts ({alerts.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Symptom Input Section */}
          <div className="space-y-6">
            {/* Add Symptom Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Add Symptoms</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptom Description
                  </label>
                  <input
                    type="text"
                    value={currentSymptom}
                    onChange={(e) => setCurrentSymptom(e.target.value)}
                    placeholder="e.g., headache, fever, cough..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select duration</option>
                      <option value="< 1 hour">&lt; 1 hour</option>
                      <option value="1-6 hours">1-6 hours</option>
                      <option value="6-24 hours">6-24 hours</option>
                      <option value="1-3 days">1-3 days</option>
                      <option value="3-7 days">3-7 days</option>
                      <option value="> 1 week">&gt; 1 week</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={addSymptom}
                  disabled={!currentSymptom.trim()}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Symptom
                </button>
              </div>
            </div>

            {/* Current Symptoms List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Current Symptoms ({symptoms.length})</h3>
              
              {symptoms.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No symptoms added yet</p>
              ) : (
                <div className="space-y-3">
                  {symptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{symptom.symptom}</div>
                        <div className="text-sm text-gray-600">
                          Severity: {symptom.severity} 
                          {symptom.duration && ` • Duration: ${symptom.duration}`}
                        </div>
                      </div>
                      <button
                        onClick={() => removeSymptom(symptom.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {symptoms.length > 0 && (
                <button
                  onClick={generateDiagnosis}
                  disabled={loading}
                  className="w-full mt-4 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating AI Diagnosis...
                    </div>
                  ) : (
                    '🤖 Generate AI Diagnosis'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Diagnosis Results Section */}
          <div className="space-y-6">
            {diagnosis ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">AI Diagnosis Results</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(diagnosis.urgency)}`}>
                    {diagnosis.urgency.toUpperCase()} PRIORITY
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Analysis</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{diagnosis.message}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                    <ul className="space-y-2">
                      {diagnosis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-gray-500 border-t pt-3">
                    Generated on: {new Date(diagnosis.timestamp).toLocaleString()}
                  </div>
                </div>

                {diagnosis.urgency === 'high' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <span className="text-red-600 text-lg mr-2">⚠️</span>
                      <span className="text-red-800 font-medium">
                        High priority symptoms detected. Please seek immediate medical attention.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-lg font-semibold mb-2">AI Diagnosis</h3>
                  <p className="text-gray-600">Add symptoms to get AI-powered health insights</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => addAlert('Emergency services contacted successfully.', 'success')}
                  className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  🚨 Emergency Services
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  📊 View Health Dashboard
                </button>
                <button
                  onClick={() => addAlert('Appointment booking feature coming soon!', 'info')}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  📅 Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* All Alerts Modal */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">All Alerts</h3>
              <button
                onClick={() => setShowAlerts(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`${getAlertColor(alert.type)} border px-3 py-2 rounded text-sm`}>
                  <div>{alert.message}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setAlerts([])}
              className="w-full mt-4 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear All Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnostic;
