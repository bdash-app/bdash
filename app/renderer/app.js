import 'core-js';
import './styles';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './pages/App';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('app'));
});
