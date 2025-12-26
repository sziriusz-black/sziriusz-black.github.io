/**
 * @file auth.js
 * @description Bejelentkezés és regisztráció kezelése
 * 
 * FELELŐSSÉGI KÖR:
 * - Felhasználók regisztrációja
 * - Bejelentkezés/Kijelentkezés
 * - Elfelejtett jelszó kezelése
 * - Felhasználói adatok tárolása (localStorage)
 */

const AUTH_STORAGE_KEY = 'skyblock_users';
const CURRENT_USER_KEY = 'skyblock_current_user';

// Felhasználók lekérése
function getUsers() {
    const usersJson = localStorage.getItem(AUTH_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
}

// Felhasználók mentése
function saveUsers(users) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
}

// Aktuális felhasználó lekérése
function getCurrentUser() {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

// Bejelentkezve van-e
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Email validáció
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Trágár szavak listája (kisbetűs)
const PROFANITY_LIST = [
    // Magyar
    'kurva', 'fasz', 'faszom', 'geci', 'gecis', 'pina', 'pinas', 'csöcs', 'segg', 'segges',
    'buzi', 'buzis', 'köcsög', 'ribanc', 'szar', 'szaros', 'baszd', 'basz', 'kibasz',
    'megbasz', 'anyad', 'anyád', 'picsa', 'picsába', 'fasza', 'bazmeg', 'baszdmeg',
    // Angol
    'fuck', 'shit', 'bitch', 'ass', 'asshole', 'dick', 'cock', 'pussy', 'cunt',
    'nigger', 'nigga', 'faggot', 'retard', 'whore', 'slut'
];

// Trágár szó ellenőrzése
function containsProfanity(text) {
    const lowerText = text.toLowerCase();
    for (const word of PROFANITY_LIST) {
        if (lowerText.includes(word)) {
            return true;
        }
    }
    return false;
}

// Regisztráció
function register(username, email, password) {
    if (!username || !email || !password) {
        return { success: false, message: 'Minden mező kitöltése kötelező!' };
    }

    if (username.length < 3) {
        return { success: false, message: 'A felhasználónév legalább 3 karakter legyen!' };
    }

    // Trágár szó ellenőrzése
    if (containsProfanity(username)) {
        return { success: false, message: 'Trágár szavak nem megengedettek!', clearUsername: true };
    }

    if (!isValidEmail(email)) {
        return { success: false, message: 'Érvénytelen email cím!' };
    }

    if (password.length < 4) {
        return { success: false, message: 'A jelszó legalább 4 karakter legyen!' };
    }

    const users = getUsers();
    
    // Ellenőrzés: létezik-e már ilyen felhasználó
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        return { success: false, message: 'Ez a felhasználónév már foglalt!' };
    }

    // Ellenőrzés: létezik-e már ilyen email
    const existingEmail = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
        return { success: false, message: 'Ez az email cím már regisztrálva van!' };
    }

    // Új felhasználó hozzáadása
    const newUser = {
        id: crypto.randomUUID(),
        username: username,
        email: email.toLowerCase(),
        password: password, // Valós alkalmazásban hash-elni kellene!
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, message: 'Sikeres regisztráció!' };
}

// Bejelentkezés
function login(username, password) {
    if (!username || !password) {
        return { success: false, message: 'Felhasználónév és jelszó megadása kötelező!' };
    }

    const users = getUsers();
    const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
    );

    if (!user) {
        return { success: false, message: 'Hibás felhasználónév vagy jelszó!' };
    }

    // Bejelentkezés mentése
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        id: user.id,
        username: user.username
    }));

    return { success: true, message: 'Sikeres bejelentkezés!' };
}

// Kijelentkezés
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

// Elfelejtett jelszó - jelszó lekérése email alapján
function recoverPassword(email) {
    if (!email) {
        return { success: false, message: 'Add meg az email címed!' };
    }

    if (!isValidEmail(email)) {
        return { success: false, message: 'Érvénytelen email cím!' };
    }

    const users = getUsers();
    const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return { success: false, message: 'Nem található fiók ezzel az email címmel!' };
    }

    return { 
        success: true, 
        message: `A jelszavad: ${user.password}`,
        username: user.username
    };
}

// Összes form elrejtése
function hideAllForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');

    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden');
    if (authError) authError.classList.add('hidden');
    if (authSuccess) authSuccess.classList.add('hidden');
}

// Auth UI inicializálása
function initAuthUI() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const showForgotPasswordBtn = document.getElementById('showForgotPassword');
    const backToLoginBtn = document.getElementById('backToLogin');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const authError = document.getElementById('authError');
    const authSuccess = document.getElementById('authSuccess');

    // Váltás regisztrációra
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllForms();
            registerForm.classList.remove('hidden');
            document.getElementById('registerUsername').focus();
        });
    }

    // Váltás bejelentkezésre
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllForms();
            loginForm.classList.remove('hidden');
            document.getElementById('loginUsername').focus();
        });
    }

    // Váltás elfelejtett jelszóra
    if (showForgotPasswordBtn) {
        showForgotPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllForms();
            forgotPasswordForm.classList.remove('hidden');
            document.getElementById('forgotEmail').focus();
        });
    }

    // Vissza a bejelentkezéshez
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllForms();
            loginForm.classList.remove('hidden');
            document.getElementById('loginUsername').focus();
        });
    }

    // Bejelentkezés
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = login(username, password);
            
            if (result.success) {
                authError.classList.add('hidden');
                window.location.reload(); // Újratöltés a bejelentkezés után
            } else {
                authError.textContent = result.message;
                authError.classList.remove('hidden');
                authSuccess.classList.add('hidden');
            }
        });

        // Enter gomb kezelése login form-on
        document.getElementById('loginPassword').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }

    // Regisztráció
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

            if (password !== passwordConfirm) {
                authError.textContent = 'A jelszavak nem egyeznek!';
                authError.classList.remove('hidden');
                authSuccess.classList.add('hidden');
                return;
            }
            
            const result = register(username, email, password);
            
            if (result.success) {
                // Sikeres regisztráció után automatikus bejelentkezés
                const loginResult = login(username, password);
                if (loginResult.success) {
                    window.location.reload();
                }
            } else {
                authError.textContent = result.message;
                authError.classList.remove('hidden');
                authSuccess.classList.add('hidden');
                
                // Ha trágár szó volt, töröljük a felhasználónév mezőt
                if (result.clearUsername) {
                    document.getElementById('registerUsername').value = '';
                    document.getElementById('registerUsername').focus();
                }
            }
        });

        // Enter gomb kezelése register form-on
        document.getElementById('registerPasswordConfirm').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                registerBtn.click();
            }
        });
    }

    // Elfelejtett jelszó
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => {
            const email = document.getElementById('forgotEmail').value;
            
            const result = recoverPassword(email);
            
            if (result.success) {
                authError.classList.add('hidden');
                authSuccess.innerHTML = `<strong>Felhasználónév:</strong> ${result.username}<br><strong>Jelszó:</strong> ${result.message.replace('A jelszavad: ', '')}`;
                authSuccess.classList.remove('hidden');
            } else {
                authError.textContent = result.message;
                authError.classList.remove('hidden');
                authSuccess.classList.add('hidden');
            }
        });

        // Enter gomb kezelése forgot password form-on
        document.getElementById('forgotEmail').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                forgotPasswordBtn.click();
            }
        });
    }

    // Első input mező fókuszba helyezése
    const firstInput = document.getElementById('loginUsername');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

export { isLoggedIn, getCurrentUser, logout, initAuthUI };
