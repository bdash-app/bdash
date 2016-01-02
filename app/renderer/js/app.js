import React from 'react';
import ReactDOM from 'react-dom';
import Main from './components/main';

document.addEventListener('DOMContentLoaded', () => {
  let node = document.getElementById('app');
  ReactDOM.render(React.createElement(Main), node);
});
