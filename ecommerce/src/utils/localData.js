const STORAGE_KEYS = {
  users: "unimart_users",
  orders: "unimart_orders",
  user: "user",
  token: "token",
};

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export function createLocalSession(payload) {
  const token = `local-${Date.now()}`;
  localStorage.setItem(STORAGE_KEYS.token, token);
  writeJson(STORAGE_KEYS.user, payload);
  return { token, user: payload };
}

export function registerLocalUser({ name, email, password }) {
  const users = readJson(STORAGE_KEYS.users, []);
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((item) => item.email === normalizedEmail)) {
    throw new Error("User already exists");
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    phone: "",
    address: "",
    role: "user",
  };

  users.push(newUser);
  writeJson(STORAGE_KEYS.users, users);

  const { password: _password, ...safeUser } = newUser;
  return createLocalSession(safeUser);
}

export function loginLocalUser({ email, password }) {
  const users = readJson(STORAGE_KEYS.users, []);
  const normalizedEmail = email.trim().toLowerCase();

  const match = users.find((item) => item.email === normalizedEmail && item.password === password);
  if (!match) {
    throw new Error("Invalid email or password");
  }

  const { password: _password, ...safeUser } = match;
  return createLocalSession(safeUser);
}

export function getStoredUser() {
  return readJson(STORAGE_KEYS.user, null);
}

export function updateStoredUser(updates) {
  const currentUser = getStoredUser();
  if (!currentUser) return null;

  const nextUser = { ...currentUser, ...updates };
  writeJson(STORAGE_KEYS.user, nextUser);

  const users = readJson(STORAGE_KEYS.users, []);
  const nextUsers = users.map((item) =>
    item.id === currentUser.id ? { ...item, ...updates } : item
  );
  writeJson(STORAGE_KEYS.users, nextUsers);
  return nextUser;
}

export function getLocalOrders(userId) {
  const orders = readJson(STORAGE_KEYS.orders, []);
  return orders
    .filter((order) => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function createLocalOrder({ userId, module = "General", itemName = "Sample Item", quantity = 1, price = 0 }) {
  const orders = readJson(STORAGE_KEYS.orders, []);
  const order = {
    _id: `ord-${Date.now()}`,
    userId,
    status: "Pending",
    createdAt: new Date().toISOString(),
    items: [
      {
        productName: itemName,
        quantity,
        price,
      },
    ],
    totalAmount: quantity * price,
    module,
  };

  orders.unshift(order);
  writeJson(STORAGE_KEYS.orders, orders);
  return order;
}
