// --- FIREBASE CONFIGURATION ---
// In a real project, replace these with your actual Firebase config.
// In this environment, these are often provided automatically.
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {
        apiKey: "AIzaSyDOwo9T6L87tM2ibKcomrr9a8E_bmLaZw8",
        authDomain: "agrosphere-7fc91.firebaseapp.com",
        projectId: "agrosphere-7fc91",
        storageBucket: "agrosphere-7fc91.firebasestorage.app",
        messagingSenderId: "55764982725",
        appId: "1:55764982725:web:6cc28eceb978882c0dc9ac",
        measurementId: "G-MHLHVZ22HH"

    };

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', function() {
    
    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- Active Nav Link Logic ---
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#navbar .nav-link');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // This logic handles highlighting the current page's link in the navbar
        if ((currentPath.endsWith('/') && linkHref === 'index.html') || (currentPath.endsWith(linkHref) && linkHref !== 'index.html')) {
            if (!linkHref.includes('#')) { // We don't want to highlight 'About' or 'Contact' unless on the homepage
                 link.classList.add('active');
            }
        }
    });


    // --- Scroll-in Animations using IntersectionObserver ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1 
    });

    const elementsToAnimate = document.querySelectorAll('.scroll-animate');
    elementsToAnimate.forEach(el => observer.observe(el));
    
    // --- Sidebar Main Logic ---
    const logoBtn = document.getElementById('logo-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const body = document.body;

    const toggleSidebar = () => {
        if (sidebar) {
            sidebar.classList.toggle('sidebar-open');
            sidebarOverlay.classList.toggle('visible');
            body.classList.toggle('sidebar-active');
        }
    };
    
    if (logoBtn && sidebar && sidebarOverlay && sidebarCloseBtn) {
        logoBtn.addEventListener('click', (event) => {
            event.preventDefault();
            toggleSidebar();
        });
        sidebarOverlay.addEventListener('click', toggleSidebar);
        sidebarCloseBtn.addEventListener('click', toggleSidebar);
    }

    // --- Sidebar Dropdown Logic ---
    const dropdownToggles = document.querySelectorAll('.sidebar-dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            event.preventDefault(); 
            const dropdown = this.closest('.sidebar-dropdown');
            if (dropdown) {
                dropdown.classList.toggle('open');
            }
        });
    });

    // --- Firebase Authentication Logic ---
    const authLinks = document.getElementById('auth-links');
    const userProfile = document.getElementById('user-profile');
    const userEmailSpan = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');

    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            if (authLinks && userProfile) {
                authLinks.classList.add('hidden');
                userProfile.classList.remove('hidden');
                userProfile.classList.add('flex');
                userEmailSpan.textContent = user.displayName || user.email;
                
                // Change text color on scroll when logged in
                const navbar = document.getElementById('navbar');
                if (navbar && navbar.classList.contains('scrolled')) {
                    userEmailSpan.classList.remove('text-white');
                    userEmailSpan.classList.add('text-text-dark');
                } else if (userEmailSpan) {
                    userEmailSpan.classList.add('text-white');
                    userEmailSpan.classList.remove('text-text-dark');
                }
            }
        } else {
            // User is signed out
            if (authLinks && userProfile) {
                authLinks.classList.remove('hidden');
                authLinks.classList.add('flex');
                userProfile.classList.add('hidden');
                userEmailSpan.textContent = '';
            }
        }
    });
    
     window.addEventListener('scroll', () => {
         const navbar = document.getElementById('navbar');
         if(auth.currentUser && userEmailSpan && navbar){
             if (navbar.classList.contains('scrolled')) {
                userEmailSpan.classList.remove('text-white');
                userEmailSpan.classList.add('text-text-dark');
            } else {
                userEmailSpan.classList.add('text-white');
                userEmailSpan.classList.remove('text-text-dark');
            }
         }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            }).catch(error => {
                console.error("Logout Error:", error);
            });
        });
    }

    // --- Login Form Logic (on login.html) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    showMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch(error => {
                    showMessage(error.message, 'error');
                });
        });
    }

    // --- Register Form Logic (on register.html) ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = registerForm.name.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm['confirm-password'].value;

            if (password !== confirmPassword) {
                showMessage('Passwords do not match.', 'error');
                return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    return userCredential.user.updateProfile({
                        displayName: name
                    });
                })
                .then(() => {
                    showMessage('Registration successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch(error => {
                    showMessage(error.message, 'error');
                });
        });
    }

    function showMessage(message, type) {
        const messageEl = document.getElementById('form-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = 'p-3 rounded-md text-sm mb-4'; // Reset classes
            messageEl.classList.add(type);
            messageEl.classList.remove('hidden');
        }
    }

    // --- CHATBOT LOGIC ---
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const closeChat = document.getElementById('close-chat');
    const chatLog = document.getElementById('chat-log');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('typing-indicator');

    if (chatBubble && chatWindow) {
        const toggleChatWindow = () => {
            chatWindow.classList.toggle('open');
            if (chatWindow.classList.contains('open')) {
                userInput.focus();
            }
        };

        chatBubble.addEventListener('click', toggleChatWindow);
        closeChat.addEventListener('click', toggleChatWindow);

        const addMessage = (sender, text) => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', `${sender}-message`);
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            messageElement.innerHTML = text;
            chatLog.appendChild(messageElement);
            chatLog.scrollTop = chatLog.scrollHeight;
        };

        chatForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const userText = userInput.value.trim();
            if (userText) {
                addMessage('user', userText);
                userInput.value = '';
                getAIResponse(userText);
            }
        });

        const getAIResponse = async (userText) => {
            if(typingIndicator) typingIndicator.classList.remove('hidden');
            chatLog.scrollTop = chatLog.scrollHeight;

            const apiKey = "AIzaSyAQGmsus7bjRT48zl6m0o1L0vZX82e_T9Q";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const systemPrompt = `You are the "AgroSphere AI Assistant," a friendly and professional agronomist...`;
            
            const payload = { contents: [{ parts: [{ text: userText }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, tools: [{ "google_search": {} }] };

            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) throw new Error(`API request failed`);
                const result = await response.json();
                let botText = "Sorry, I couldn't process that.";
                if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                    botText = result.candidates[0].content.parts[0].text;
                }
                addMessage('bot', botText);
            } catch (error) {
                console.error("AI Chatbot Error:", error);
                addMessage('bot', "I'm having a little trouble connecting right now.");
            } finally {
                if(typingIndicator) typingIndicator.classList.add('hidden');
            }
        };
        
        setTimeout(() => {
            addMessage('bot', 'Welcome to AgroSphere! How can I help you today?');
        }, 1000);
    }
});
