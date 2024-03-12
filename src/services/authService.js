const TOKEN_KEY = 'jwt-token';
let subscribers = [];

const AuthService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    notifySubscribers();
    return true; // Assuming the token is set successfully
  },
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    notifySubscribers();
    return true; // Assuming the token is removed successfully
  },
  isAuthenticated: () => {
    const token = AuthService.getToken();
    return !!token; // Check if the token exists
  },
  subscribe: (subscriber) => {
    subscribers.push(subscriber);
    return () => {
      subscribers = subscribers.filter((s) => s !== subscriber);
    };
  },
};

const notifySubscribers = () => {
  subscribers.forEach((subscriber) => {
    subscriber();
  });
};

export default AuthService;
