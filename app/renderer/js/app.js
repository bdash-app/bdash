import 'core-js';
import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './containers/app_container';

import 'font-awesome/css/font-awesome.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/dialog/dialog.css';
import 'react-select/dist/react-select.css';
import '../styles/app.css';

document.addEventListener('DOMContentLoaded', () => {
  let node = document.getElementById('app');
  ReactDOM.render(React.createElement(AppContainer), node);
});
