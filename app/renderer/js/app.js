import 'core-js';
import React from 'react';
import ReactDOM from 'react-dom';
import MainContainer from './containers/main_container';

document.addEventListener('DOMContentLoaded', () => {
  let node = document.getElementById('app');
  ReactDOM.render(React.createElement(MainContainer), node);
});
