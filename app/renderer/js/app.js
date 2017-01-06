import 'core-js';
import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './containers/app_container';

// temporary fix
import '../dist/css/app.css';

document.addEventListener('DOMContentLoaded', () => {
  let node = document.getElementById('app');
  ReactDOM.render(React.createElement(AppContainer), node);
});
