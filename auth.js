/**
 * @file auth.js
 * @description Bejelentkezés és regisztráció kezelése
 * 
 * FELELŐSSÉGI KÖR:
 * - Felhasználók regisztrációja
 * - Bejelentkezés/Kijelentkezés
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

// Regisztráció
function register(username, password) {
    if (!username || !password) {
        return { success: false, message: 'Felhasználónév és jelszó megadása kötelező!' };
    }

    if (username.length < 3) {
        return { success: false, message: 'A felhasználónév legalább 3 karakter legyen!' };
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

    // Új felhasználó hozzáadása
    const newUser = {
        id: crypto.randomUUID(),
        username: username,
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

// Auth UI inicializálása
function initAuthUI() {
    const authOverlay = document.getElementById('authOverlay');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const authError = document.getElementById('authError');

    // Váltás regisztrációra
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            authError.classList.add('hidden');
        });
    }

    // Váltás bejelentkezésre
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            authError.classList.add('hidden');
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
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

            if (password !== passwordConfirm) {
                authError.textContent = 'A jelszavak nem egyeznek!';
                authError.classList.remove('hidden');
                return;
            }
            
            const result = register(username, password);
            
            if (result.success) {
                // Sikeres regisztráció után automatikus bejelentkezés
                const loginResult = login(username, password);
                if (loginResult.success) {
                    window.location.reload();
                }
            } else {
                authError.textContent = result.message;
                authError.classList.remove('hidden');
            }
        });

        // Enter gomb kezelése register form-on
        document.getElementById('registerPasswordConfirm').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                registerBtn.click();
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

