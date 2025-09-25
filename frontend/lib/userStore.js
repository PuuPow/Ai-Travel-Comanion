// Shared in-memory user storage
let users = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'demo@example.com',
    name: 'Demo User',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
    createdAt: new Date().toISOString()
  }
];

export function getAllUsers() {
  return users;
}

export function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

export function addUser(user) {
  users.push(user);
  return user;
}

export function findUserById(id) {
  return users.find(u => u.id === id);
}