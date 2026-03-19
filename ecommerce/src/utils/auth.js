// check login
export const isLoggedIn = () => {
  return localStorage.getItem("user") !== null;
};

// save user after login
export const loginUser = (userData) => {
  localStorage.setItem("user", JSON.stringify(userData));
};

// get logged user safely
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// logout user
export const logoutUser = () => {
  localStorage.removeItem("user");
  window.location.href = "/";
};
