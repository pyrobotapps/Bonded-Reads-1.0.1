import axios from 'axios';

var BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
var API_URL = BACKEND_URL + '/api';

var api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(function(config) {
  var token = localStorage.getItem('bl_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  function(response) { return response; },
  function(error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('bl_token');
      localStorage.removeItem('bl_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export var authAPI = {
  register: function(data) { return api.post('/auth/register', data); },
  login: function(data) { return api.post('/auth/login', data); },
  staffRegister: function(data, staffCode) { return api.post('/auth/staff/register?staff_code=' + staffCode, data); },
  ownerRegister: function(data, ownerCode) { return api.post('/auth/owner/register?owner_code=' + ownerCode, data); },
  getMe: function() { return api.get('/auth/me'); },
};

// Books API
export var booksAPI = {
  getAll: function(params) { return api.get('/books', { params: params }); },
  getTop: function(limit) { return api.get('/books/top', { params: { limit: limit || 10 } }); },
  getOne: function(id) { return api.get('/books/' + id); },
  create: function(data) { return api.post('/books', data); },
  update: function(id, data) { return api.put('/books/' + id, data); },
  delete: function(id) { return api.delete('/books/' + id); },
  getGenres: function() { return api.get('/books/genres'); },
  batchImport: function(books) { return api.post('/books/batch-import', { books: books }); },
};

// Voting API
export var votingAPI = {
  vote: function(bookId, rating) { return api.post('/books/' + bookId + '/vote', { rating: rating }); },
  getMyVote: function(bookId) { return api.get('/books/' + bookId + '/my-vote'); },
};

// Reading Status API
export var readingAPI = {
  setStatus: function(data) { return api.post('/reading-status', data); },
  getAll: function() { return api.get('/reading-status'); },
  getForBook: function(bookId) { return api.get('/reading-status/' + bookId); },
};

// Custom Lists API
export var listsAPI = {
  create: function(name) { return api.post('/lists', { name: name }); },
  getAll: function() { return api.get('/lists'); },
  addBook: function(listId, bookId) { return api.post('/lists/' + listId + '/books/' + bookId); },
  removeBook: function(listId, bookId) { return api.delete('/lists/' + listId + '/books/' + bookId); },
  delete: function(listId) { return api.delete('/lists/' + listId); },
};

// Notes API
export var notesAPI = {
  create: function(data) { return api.post('/notes', data); },
  getMy: function() { return api.get('/notes/my'); },
  getForBook: function(bookId) { return api.get('/notes/book/' + bookId); },
  getPublic: function(bookId) { return api.get('/notes/public/' + bookId); },
  delete: function(id) { return api.delete('/notes/' + id); },
};

// Stats API
export var statsAPI = {
  getLibrary: function() { return api.get('/stats/library'); },
};

// Recommendations API
export var recommendationsAPI = {
  create: function(data) { return api.post('/recommendations', data); },
  checkExists: function(title, author) { return api.get('/recommendations/check', { params: { title: title, author: author } }); },
  getAll: function(status) { return api.get('/recommendations', { params: { status: status } }); },
  getMy: function() { return api.get('/recommendations/my'); },
  approve: function(id) { return api.put('/recommendations/' + id + '/approve'); },
  reject: function(id) { return api.put('/recommendations/' + id + '/reject'); },
};

// Staff Applications API
export var staffApplicationsAPI = {
  create: function(reason) { return api.post('/staff-applications', { reason: reason }); },
  getAll: function(status) { return api.get('/staff-applications', { params: { status: status } }); },
  getMy: function() { return api.get('/staff-applications/my'); },
  approve: function(id) { return api.put('/staff-applications/' + id + '/approve'); },
  reject: function(id) { return api.put('/staff-applications/' + id + '/reject'); },
};

// Staff Management API
export var staffAPI = {
  getList: function() { return api.get('/staff/list'); },
  remove: function(userId) { return api.delete('/staff/' + userId); },
};

export default api;
