import { PlayerData, PlayerStats } from '../../types/GameTypes';

export class AuthenticationScreen {
  private authElement: HTMLElement | null = null;
  private loginFormElement: HTMLElement | null = null;
  private registerFormElement: HTMLElement | null = null;
  private currentUser: PlayerData | null = null;

  constructor() {
    this.loadCurrentUser();
  }

  init(): void {
    this.createAuthScreen();
  }

  private createAuthScreen(): void {
    this.authElement = document.createElement('div');
    this.authElement.id = 'auth-screen';
    this.authElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(0, 0, 17, 0.95), rgba(0, 17, 34, 0.95));
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 3000;
      font-family: 'Courier New', monospace;
      color: #00ff00;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #00ff00;
      border-radius: 10px;
      padding: 40px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
    `;

    const title = document.createElement('h1');
    title.textContent = 'ASTEROID NAVIGATOR';
    title.style.cssText = `
      font-size: 28px;
      margin-bottom: 10px;
      text-shadow: 0 0 20px #00ff00;
    `;

    const subtitle = document.createElement('h2');
    subtitle.textContent = 'Authentication Required';
    subtitle.style.cssText = `
      font-size: 16px;
      margin-bottom: 30px;
      opacity: 0.8;
    `;

    // Tab buttons
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid #00ff00;
    `;

    const loginTab = this.createTabButton('Login', true);
    const registerTab = this.createTabButton('Register', false);

    loginTab.addEventListener('click', () => this.switchTab('login'));
    registerTab.addEventListener('click', () => this.switchTab('register'));

    tabContainer.appendChild(loginTab);
    tabContainer.appendChild(registerTab);

    // Forms
    this.createLoginForm();
    this.createRegisterForm();

    // Skip button for demo
    const skipButton = document.createElement('button');
    skipButton.textContent = 'Continue as Guest';
    skipButton.style.cssText = `
      margin-top: 20px;
      padding: 10px 20px;
      background: transparent;
      border: 1px solid #666;
      color: #666;
      font-family: 'Courier New', monospace;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.3s ease;
    `;

    skipButton.addEventListener('click', () => {
      this.loginAsGuest();
    });

    container.appendChild(title);
    container.appendChild(subtitle);
    container.appendChild(tabContainer);
    container.appendChild(this.loginFormElement!);
    container.appendChild(this.registerFormElement!);
    container.appendChild(skipButton);

    this.authElement.appendChild(container);
    document.body.appendChild(this.authElement);
  }

  private createTabButton(text: string, active: boolean): HTMLElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      flex: 1;
      padding: 10px;
      background: ${active ? '#00ff00' : 'transparent'};
      color: ${active ? '#000' : '#00ff00'};
      border: none;
      font-family: 'Courier New', monospace;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    button.dataset.tab = text.toLowerCase();
    return button;
  }

  private createLoginForm(): void {
    this.loginFormElement = document.createElement('form');
    this.loginFormElement.style.cssText = `
      display: block;
    `;

    const emailInput = this.createInput('email', 'Email', 'email');
    const passwordInput = this.createInput('password', 'Password', 'password');
    
    const loginButton = document.createElement('button');
    loginButton.textContent = 'LOGIN';
    loginButton.type = 'submit';
    loginButton.style.cssText = this.getButtonStyles();

    this.loginFormElement.appendChild(emailInput);
    this.loginFormElement.appendChild(passwordInput);
    this.loginFormElement.appendChild(loginButton);

    this.loginFormElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin(
        (emailInput.querySelector('input') as HTMLInputElement).value,
        (passwordInput.querySelector('input') as HTMLInputElement).value
      );
    });
  }

  private createRegisterForm(): void {
    this.registerFormElement = document.createElement('form');
    this.registerFormElement.style.cssText = `
      display: none;
    `;

    const usernameInput = this.createInput('username', 'Username', 'text');
    const emailInput = this.createInput('email', 'Email', 'email');
    const passwordInput = this.createInput('password', 'Password', 'password');
    const confirmPasswordInput = this.createInput('confirmPassword', 'Confirm Password', 'password');
    
    const registerButton = document.createElement('button');
    registerButton.textContent = 'REGISTER';
    registerButton.type = 'submit';
    registerButton.style.cssText = this.getButtonStyles();

    this.registerFormElement.appendChild(usernameInput);
    this.registerFormElement.appendChild(emailInput);
    this.registerFormElement.appendChild(passwordInput);
    this.registerFormElement.appendChild(confirmPasswordInput);
    this.registerFormElement.appendChild(registerButton);

    this.registerFormElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister(
        (usernameInput.querySelector('input') as HTMLInputElement).value,
        (emailInput.querySelector('input') as HTMLInputElement).value,
        (passwordInput.querySelector('input') as HTMLInputElement).value,
        (confirmPasswordInput.querySelector('input') as HTMLInputElement).value
      );
    });
  }

  private createInput(id: string, label: string, type: string): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      margin-bottom: 15px;
      text-align: left;
    `;

    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    labelElement.style.cssText = `
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
    `;

    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.required = true;
    input.style.cssText = `
      width: 100%;
      padding: 10px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid #00ff00;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      border-radius: 5px;
      box-sizing: border-box;
    `;

    container.appendChild(labelElement);
    container.appendChild(input);
    return container;
  }

  private getButtonStyles(): string {
    return `
      width: 100%;
      padding: 12px;
      background: #00ff00;
      color: #000;
      border: none;
      font-family: 'Courier New', monospace;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.3s ease;
      margin-top: 10px;
    `;
  }

  private switchTab(tab: 'login' | 'register'): void {
    // Update tab appearance
    const tabs = this.authElement?.querySelectorAll('[data-tab]');
    tabs?.forEach(tabEl => {
      const button = tabEl as HTMLElement;
      const isActive = button.dataset.tab === tab;
      button.style.background = isActive ? '#00ff00' : 'transparent';
      button.style.color = isActive ? '#000' : '#00ff00';
    });

    // Show/hide forms
    if (this.loginFormElement && this.registerFormElement) {
      this.loginFormElement.style.display = tab === 'login' ? 'block' : 'none';
      this.registerFormElement.style.display = tab === 'register' ? 'block' : 'none';
    }
  }

  private handleLogin(email: string, password: string): void {
    // In a real app, this would make an API call
    // For demo purposes, we'll check localStorage
    const users = JSON.parse(localStorage.getItem('asteroidNavigatorUsers') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      this.currentUser = user;
      localStorage.setItem('asteroidNavigatorCurrentUser', JSON.stringify(user));
      this.hide();
      this.onLoginSuccess?.(user);
    } else {
      alert('Invalid credentials! Try registering first or continue as guest.');
    }
  }

  private handleRegister(username: string, email: string, password: string, confirmPassword: string): void {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const users = JSON.parse(localStorage.getItem('asteroidNavigatorUsers') || '[]');
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      alert('User with this email already exists!');
      return;
    }

    const newUser: PlayerData = {
      id: Date.now().toString(),
      username,
      email,
      stats: {
        totalPlaytime: 0,
        highScore: 0,
        missionsCompleted: 0,
        totalDistance: 0,
        enemiesDestroyed: 0,
        gamesPlayed: 0
      },
      unlockedShips: [0], // Start with basic ship
      currentShip: 0,
      level: 1,
      experience: 0,
      settings: {
        volume: 0.7,
        difficulty: 'normal',
        controls: 'keyboard'
      }
    };

    users.push({ ...newUser, password }); // In real app, password would be hashed
    localStorage.setItem('asteroidNavigatorUsers', JSON.stringify(users));
    
    this.currentUser = newUser;
    localStorage.setItem('asteroidNavigatorCurrentUser', JSON.stringify(newUser));
    
    this.hide();
    this.onLoginSuccess?.(newUser);
  }

  private loginAsGuest(): void {
    const guestUser: PlayerData = {
      id: 'guest',
      username: 'Guest Player',
      email: 'guest@local',
      stats: {
        totalPlaytime: 0,
        highScore: 0,
        missionsCompleted: 0,
        totalDistance: 0,
        enemiesDestroyed: 0,
        gamesPlayed: 0
      },
      unlockedShips: [0],
      currentShip: 0,
      level: 1,
      experience: 0,
      settings: {
        volume: 0.7,
        difficulty: 'normal',
        controls: 'keyboard'
      }
    };

    this.currentUser = guestUser;
    this.hide();
    this.onLoginSuccess?.(guestUser);
  }

  private loadCurrentUser(): void {
    const savedUser = localStorage.getItem('asteroidNavigatorCurrentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  show(): void {
    if (this.authElement) {
      this.authElement.style.display = 'flex';
    }
  }

  hide(): void {
    if (this.authElement) {
      this.authElement.style.display = 'none';
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getCurrentUser(): PlayerData | null {
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('asteroidNavigatorCurrentUser');
  }

  // Callback for successful login
  onLoginSuccess?: (user: PlayerData) => void;

  dispose(): void {
    if (this.authElement) {
      this.authElement.remove();
    }
  }
}