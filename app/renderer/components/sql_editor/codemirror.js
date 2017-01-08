'use strict';

var CM = require('codemirror');
var React = require('react');
require('codemirror/addon/search/search');
require('codemirror/keymap/vim');
var isEqual = require('lodash').isEqual;

var CodeMirror = React.createClass({
	displayName: 'CodeMirror',

	propTypes: {
		onChange: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		onFocusChange: React.PropTypes.func,
		options: React.PropTypes.object,
		path: React.PropTypes.string,
		value: React.PropTypes.string,
	},

	getInitialState: function getInitialState() {
		return {
			isFocused: false
		};
	},
	componentDidMount: function componentDidMount() {
		var textareaNode = this.refs.textarea;
		this.codeMirror = CM.fromTextArea(textareaNode, this.props.options);
		this.codeMirror.on('change', this.codemirrorValueChanged);
		this.codeMirror.on('focus', this.focusChanged.bind(this, true));
		this.codeMirror.on('blur', this.focusChanged.bind(this, false));
		this.codeMirror.on('cursorActivity', this.cursorChange);
		this.codeMirror.setOption("extraKeys", {
		  'Cmd-Enter': () => {
				this.props.onSubmit();
		  },
      'Tab': cm => {
				if (!cm.state.vim || cm.state.vim.insertMode) {
					cm.execCommand('insertSoftTab');
				}
			},
		});
		this._currentCodemirrorValue = this.props.defaultValue || this.props.value || '';
		this._currentOptions = this.props.options || {};
		this.codeMirror.setValue(this._currentCodemirrorValue);
		CM.Vim.defineAction('indent', cm => cm.indentLine(cm.getCursor().line, 'add'));
		CM.Vim.defineAction('unindent', cm => cm.indentLine(cm.getCursor().line, 'subtract'));
		CM.Vim.defineAction('delLineLeft', cm => cm.execCommand('delLineLeft'));
		CM.Vim.map('<C-j>', '<Esc>', 'insert');
		CM.Vim._mapCommand({ keys: '<C-t>', type: 'action', action: 'indent', context: 'insert' });
		CM.Vim._mapCommand({ keys: '<C-d>', type: 'action', action: 'unindent', context: 'insert' });
		CM.Vim._mapCommand({ keys: '<C-u>', type: 'action', action: 'delLineLeft', context: 'insert' });
	},
	componentWillUnmount: function componentWillUnmount() {
		// todo: is there a lighter-weight way to remove the cm instance?
		if (this.codeMirror) {
			this.codeMirror.toTextArea();
		}
	},

	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
		if (this.codeMirror && nextProps.value !== undefined && this._currentCodemirrorValue !== nextProps.value) {
			this.codeMirror.setValue(nextProps.value);
		}
		if (typeof nextProps.options === 'object' && !isEqual(nextProps.options, this._currentOptions)) {
			this._currentOptions = nextProps.options;
			for (var optionName in nextProps.options) {
				if (nextProps.options.hasOwnProperty(optionName)) {
					this.codeMirror.setOption(optionName, nextProps.options[optionName]);
				}
			}
		}
	},

	getCodeMirror: function getCodeMirror() {
		return this.codeMirror;
	},

	focus: function focus() {
		if (this.codeMirror) {
			this.codeMirror.focus();
		}
	},

	focusChanged: function focusChanged(focused) {
		this.setState({
			isFocused: focused
		});
		this.props.onFocusChange && this.props.onFocusChange(focused);
	},

	codemirrorValueChanged: function codemirrorValueChanged(doc, change) {
		var newValue = doc.getValue();
		this._currentCodemirrorValue = newValue;
		this.props.onChange && this.props.onChange(newValue);
	},

	cursorChange: function cursorChange(doc) {
		let cursor = doc.getCursor();
		let line = (cursor.line || 0) + 1;
		this.props.onChangeCursor(line);
	},

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'CodeMirrorBox' },
			React.createElement('textarea', { ref: 'textarea', name: this.props.path, defaultValue: '', autoComplete: 'off' })
		);
	}

});

module.exports = CodeMirror;
