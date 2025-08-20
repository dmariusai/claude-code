/**
 * Evercare AI Emergency Alert System
 * Modular JavaScript for elderly-friendly medical alert interface
 */

// Main Emergency Alert System
class EmergencyAlert {
    constructor() {
        this.alertTimeout = null;
        this.isAlertActive = false;
        this.holdTimer = null;
        this.isHolding = false;
        this.initializeEventListeners();
    }

    /**
     * Initialize all event listeners for the emergency system
     */
    initializeEventListeners() {
        const emergencyBtn = document.getElementById('emergencyBtn');
        if (emergencyBtn) {
            // Mouse events
            emergencyBtn.addEventListener('mousedown', (e) => this.startHold(e));
            emergencyBtn.addEventListener('mouseup', () => this.endHold());
            emergencyBtn.addEventListener('mouseleave', () => this.endHold());
            
            // Touch events for mobile
            emergencyBtn.addEventListener('touchstart', (e) => this.startHold(e));
            emergencyBtn.addEventListener('touchend', () => this.endHold());
            
            // Touch feedback
            emergencyBtn.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            emergencyBtn.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        }
    }

    /**
     * Starts the hold timer for emergency activation
     * @param {Event} e - The mouse/touch event
     */
    startHold(e) {
        e.preventDefault();
        if (this.isAlertActive) return;
        
        this.isHolding = true;
        const button = document.getElementById('emergencyBtn');
        button.style.transform = 'scale(0.95)';
        
        // Visual progress feedback
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (!this.isHolding) {
                clearInterval(progressInterval);
                return;
            }
            progress += 10;
            button.style.boxShadow = `0 0 0 ${progress/3}px rgba(239, 68, 68, 0.3)`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                this.triggerEmergencyAlert();
            }
        }, 30);
        
        this.holdTimer = progressInterval;
    }

    /**
     * Ends the hold timer
     */
    endHold() {
        this.isHolding = false;
        const button = document.getElementById('emergencyBtn');
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 8px 32px rgba(239, 68, 68, 0.3)';
        
        if (this.holdTimer) {
            clearInterval(this.holdTimer);
        }
    }

    /**
     * Triggers the emergency alert system
     */
    triggerEmergencyAlert() {
        if (this.isAlertActive) return;
        
        this.isAlertActive = true;
        
        // Show loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
        
        // Simulate alert process with realistic timing
        setTimeout(() => this.updateContactStatus(0, 'Connected', 'green'), 2000);
        setTimeout(() => this.updateContactStatus(1, 'Notified', 'green'), 3500);
        setTimeout(() => this.updateContactStatus(2, 'Alerted', 'green'), 5000);
        
        // Auto-complete after 8 seconds
        this.alertTimeout = setTimeout(() => {
            this.showSuccessMessage();
        }, 8000);
    }

    /**
     * Updates the status of a contact during the alert process
     * @param {number} index - Contact index
     * @param {string} status - New status text
     * @param {string} color - Status color
     */
    updateContactStatus(index, status, color) {
        const contacts = document.querySelectorAll('#loadingOverlay .space-y-3 > div');
        if (contacts[index]) {
            const statusElement = contacts[index].querySelector('.text-sm');
            const dotElement = contacts[index].querySelector('.rounded-full');
            
            if (statusElement) statusElement.textContent = status;
            if (dotElement) dotElement.className = `w-3 h-3 bg-${color}-400 rounded-full`;
        }
    }

    /**
     * Shows success message after alert is sent
     */
    showSuccessMessage() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="text-center text-white">
                    <div class="w-32 h-32 mx-auto mb-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-3xl font-bold mb-4">HELP IS ON THE WAY</h3>
                    <p class="text-xl mb-6">Your emergency contacts have been notified</p>
                    <p class="text-lg mb-8">Stay calm. Someone will be with you shortly.</p>
                    <button onclick="resetAlert()" class="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors">
                        OK
                    </button>
                </div>
            `;
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                this.resetAlert();
            }, 5000);
        }
    }

    /**
     * Cancels the emergency alert
     */
    cancelAlert() {
        if (this.alertTimeout) {
            clearTimeout(this.alertTimeout);
        }
        this.resetAlert();
    }

    /**
     * Resets the alert system to initial state
     */
    resetAlert() {
        this.isAlertActive = false;
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
        // Reset the overlay content for next use
        setTimeout(() => {
            location.reload();
        }, 500);
    }
}

// AI Agent Management System
class AgentManager {
    constructor() {
        this.initializeAgentInteractions();
    }

    /**
     * Initialize agent card interactions
     */
    initializeAgentInteractions() {
        const agentCards = document.querySelectorAll('.agent-status');
        agentCards.forEach(card => {
            card.addEventListener('click', () => {
                const agentType = card.getAttribute('data-agent');
                this.showAgentDetails(agentType);
            });
            
            // Add touch feedback
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }

    /**
     * Show details for a specific agent
     * @param {string} agentType - The type of agent to show
     */
    showAgentDetails(agentType) {
        // Hide all agent panels first
        const allPanels = document.querySelectorAll('.agent-panel');
        allPanels.forEach(panel => panel.classList.add('hidden'));
        
        // Show the selected agent panel
        const agentPanel = document.getElementById(agentType + 'Agent');
        const agentDetails = document.getElementById('agentDetails');
        
        if (agentPanel && agentDetails) {
            agentDetails.classList.remove('hidden');
            agentPanel.classList.remove('hidden');
            
            // Smooth scroll to agent details
            agentDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Close the agent panel
     */
    closeAgentPanel() {
        const agentDetails = document.getElementById('agentDetails');
        if (agentDetails) {
            agentDetails.classList.add('hidden');
        }
    }
}

// Contact Management System
class ContactManager {
    constructor() {
        this.contacts = [
            {
                name: "Sarah Johnson",
                role: "Primary Caregiver",
                phone: "(555) 123-4567",
                priority: 1,
                status: "available"
            },
            {
                name: "Michael Chen",
                role: "Son",
                phone: "(555) 987-6543",
                priority: 2,
                status: "available"
            },
            {
                name: "Dr. Emily Rodriguez",
                role: "Primary Care Physician",
                phone: "(555) 246-8135",
                priority: 3,
                status: "available"
            }
        ];
    }

    /**
     * Get all emergency contacts
     * @returns {Array} Array of contact objects
     */
    getContacts() {
        return this.contacts;
    }

    /**
     * Update contact status
     * @param {number} index - Contact index
     * @param {string} status - New status
     */
    updateContactStatus(index, status) {
        if (this.contacts[index]) {
            this.contacts[index].status = status;
        }
    }
}

// Health Status Monitor
class HealthMonitor {
    constructor() {
        this.vitals = {
            heartRate: 72,
            bloodPressure: { systolic: 125, diastolic: 80 },
            temperature: 98.6,
            oxygenSaturation: 98
        };
        this.medications = [
            { name: "Lisinopril", dosage: "10mg", time: "08:00", taken: true },
            { name: "Metformin", dosage: "500mg", time: "12:00", taken: false },
            { name: "Atorvastatin", dosage: "20mg", time: "20:00", taken: false }
        ];
    }

    /**
     * Get current vital signs
     * @returns {Object} Current vital signs
     */
    getVitals() {
        return this.vitals;
    }

    /**
     * Get medication schedule
     * @returns {Array} Array of medications
     */
    getMedications() {
        return this.medications;
    }

    /**
     * Mark medication as taken
     * @param {number} index - Medication index
     */
    markMedicationTaken(index) {
        if (this.medications[index]) {
            this.medications[index].taken = true;
        }
    }
}

// Initialize all systems when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global instances
    window.EmergencyAlert = {
        instance: new EmergencyAlert()
    };
    
    window.AgentManager = new AgentManager();
    window.ContactManager = new ContactManager();
    window.HealthMonitor = new HealthMonitor();
    
    // Add global methods for backward compatibility
    window.triggerEmergencyAlert = () => EmergencyAlert.instance.triggerEmergencyAlert();
    window.cancelAlert = () => EmergencyAlert.instance.cancelAlert();
    window.resetAlert = () => EmergencyAlert.instance.resetAlert();
    window.showAgentDetails = (type) => AgentManager.showAgentDetails(type);
    window.closeAgentPanel = () => AgentManager.closeAgentPanel();
    
    console.log('Evercare AI Emergency Alert System initialized successfully');
});

// Service Worker registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export classes for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EmergencyAlert,
        AgentManager,
        ContactManager,
        HealthMonitor
    };
}
