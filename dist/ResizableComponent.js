'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ResizableComponent = function (_Component) {
	_inherits(ResizableComponent, _Component);

	function ResizableComponent(props) {
		_classCallCheck(this, ResizableComponent);

		var _this2 = _possibleConstructorReturn(this, (ResizableComponent.__proto__ || Object.getPrototypeOf(ResizableComponent)).call(this, props));

		_this2.create = false;

		_this2._startDrag = function (e) {
			_this2.makeParentHighlightable(false);
			_this2.setState({
				mouseHeldDown: true,
				originalY: e.clientY,
				originalX: e.clientX
			}, function () {
				if (this.props.onStartResize) this.props.onStartResize((this.state.boxWidth - this.state.originalBoxWidth) / this.state.step, (this.state.boxHeight - this.state.originalBoxHeight) / this.state.step);
			});
		};

		_this2._stopDrag = function (e) {
			_this2.makeParentHighlightable(true);
			// Only invoke onStopResize if this component has started resizing
			if (_this2.state.mouseHeldDown && _this2.props.onStopResize) {
				_this2.props.onStopResize(_this2.state.boxWidth, _this2.state.boxHeight);
			}
			if (!_this2.state.allowGhostResize) {
				_this2.setState({
					mouseHeldDown: false,
					initialBoxHeight: _this2.state.boxHeight,
					initialBoxWidth: _this2.state.boxWidth
				});
			} else {
				// Ghost resizing
				// Change the dimensions back to the original
				_this2.setState({
					mouseHeldDown: false,
					boxHeight: _this2.state.originalBoxHeight,
					boxWidth: _this2.state.originalBoxWidth
				});
			}
		};

		_this2._resizeDiv = function (e) {
			if (_this2.state.mouseHeldDown) {
				var distanceY = e.clientY - _this2.state.originalY;
				var distanceX = e.clientX - _this2.state.originalX;

				var newHeight = _this2.state.initialBoxHeight + distanceY;
				var newWidth = _this2.state.initialBoxWidth + distanceX;

				var steppingRemainderY = distanceY % _this2.state.step;
				var steppingRemainderX = distanceX % _this2.state.step;

				// NOTE: For checking whether the new dimensions violates the minimum constraints,
				// The steeping margin is given as allowance so that the box can be re-sized to the smallest
				// dimension smoothly.
				var heightCanChange = newHeight >= _this2.state.minHeight - _this2.state.steppingMargin && newHeight <= _this2.state.maxHeight + _this2.state.steppingMargin // newHeight is below maxHeight
				&& steppingRemainderY <= _this2.state.steppingMargin // A little allowance is given for stepping
				&& _this2.props.direction.indexOf('s') > -1;

				var widthCanChange = newWidth >= _this2.state.minWidth - _this2.state.steppingMargin && newWidth <= _this2.state.maxWidth + _this2.state.steppingMargin && steppingRemainderX <= _this2.state.steppingMargin && _this2.props.direction.indexOf('e') > -1;

				// If new dimensions are indeed lesser than the minimum constraint or greater than the maximum constraint,
				// set the dimension to the minimum/maximum respectively
				newHeight = newHeight - steppingRemainderY;
				newWidth = newWidth - steppingRemainderX;
				if (newHeight < _this2.state.minHeight) newHeight = _this2.state.minHeight;
				if (newWidth < _this2.state.minWidth) newWidth = _this2.state.minWidth;
				if (newHeight > _this2.state.maxHeight) newHeight = _this2.state.maxHeight;
				if (newWidth > _this2.state.maxWidth) newWidth = _this2.state.maxWidth;

				// If lockAspectRatio is true, we programatically calculate the width
				if (_this2.props.direction === 'se' && _this2.state.lockAspectRatio) {
					var aspectRatio = _this2.state.originalBoxHeight / _this2.state.originalBoxWidth;
					newWidth = newHeight / aspectRatio;
				}

				_this2.setState({
					boxHeight: heightCanChange ? newHeight : _this2.state.boxHeight,
					boxWidth: widthCanChange ? newWidth : _this2.state.boxWidth
				}, function () {

					// Callback for onDuringResize
					// Not called when step is active
					if (this.props.onDuringResize && this.state.step === 1) {
						this.props.onDuringResize(this.state.boxWidth, this.state.boxHeight);
					}

					// Callback for onEachStep
					// Only when step size has changed, then we invoke to callback
					if ((this.state.boxHeight !== this.state.currStepY || this.state.boxWidth !== this.state.currStepX) && this.props.onEachStep && this.state.step > 1) {
						this.props.onEachStep((this.state.boxWidth - this.state.originalBoxWidth) / this.state.step, (this.state.boxHeight - this.state.originalBoxHeight) / this.state.step);
						this.setState({
							currStepY: this.state.boxHeight,
							currStepX: this.state.boxWidth
						});
					}
				});
			}
		};

		_this2.getResizeHandlerStyle = function () {
			var resizeHandlerStyle = {};

			if (_this2.props.direction === 's') {
				resizeHandlerStyle = {
					width: _this2.state.boxWidth + 'px',
					height: _this2.state.cursorMargin + 'px',
					cursor: 's-resize',
					position: 'absolute',
					bottom: '0px',
					left: '0px'
				};
			}

			if (_this2.props.direction === 'e') {
				resizeHandlerStyle = {
					width: _this2.state.cursorMargin + 'px',
					height: _this2.state.boxHeight + 'px',
					cursor: 'e-resize',
					position: 'absolute',
					bottom: '0px',
					right: '0px'
				};
			}

			if (_this2.props.direction === 'se') {
				resizeHandlerStyle = {
					width: _this2.state.cursorMargin + 'px',
					height: _this2.state.cursorMargin + 'px',
					cursor: 'se-resize',
					position: 'absolute',
					bottom: '0px',
					right: '0px'
				};
			}

			resizeHandlerStyle['zIndex'] = 1;
			return resizeHandlerStyle;
		};

		_this2.makeParentHighlightable = function (highlight) {
			var parentAttrName = _reactDom2.default.findDOMNode(_this2).parentNode.attributes[0].name;
			var parentAttrValue = _reactDom2.default.findDOMNode(_this2).parentNode.attributes[0].value;

			// Attaches event listeners to parent div
			document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').style.userSelect = highlight ? 'all' : 'none';
			document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').style.mozUserSelect = highlight ? 'all' : 'none';
			document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').style.webkitUserSelect = highlight ? 'all' : 'none';
		};

		_this2.state = {
			// Mouse events
			mouseHeldDown: false,
			originalY: 0,
			originalX: 0,

			// Dimensions of box
			direction: props.direction,
			initialBoxHeight: props.height,
			initialBoxWidth: props.width,
			boxHeight: props.height,
			boxWidth: props.width,
			minHeight: props.options.minHeight ? props.options.minHeight : props.height,
			minWidth: props.options.minWidth ? props.options.minWidth : props.width,
			maxHeight: props.options.maxHeight ? props.options.maxHeight : Infinity,
			maxWidth: props.options.maxWidth ? props.options.maxWidth : Infinity,
			lockAspectRatio: props.options.lockAspectRatio ? props.options.lockAspectRatio : false,

			// Stepping of resizing
			step: props.options.step ? props.options.step : 1,
			currStepY: 0,
			currStepX: 0,
			steppingMargin: props.steppingMargin,
			originalBoxWidth: props.width,
			originalBoxHeight: props.height,

			// Width of resizable handle
			cursorMargin: props.options.cursorMargin ? props.options.cursorMargin : props.cursorMargin,

			// Ghost Resizing
			allowGhostResize: props.options.allowGhostResize ? props.options.allowGhostResize : false
		};
		_this2._startDrag = _this2._startDrag.bind(_this2);
		_this2._stopDrag = _this2._stopDrag.bind(_this2);
		return _this2;
	}

	_createClass(ResizableComponent, [{
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			if (!this.create) {
				this.create = true;
				this.setState({
					boxWidth: this.props.width,
					boxHeight: this.props.height,
					initialBoxHeight: this.props.height,
					initialBoxWidth: this.props.height,
					originalBoxWidth: this.props.width,
					originalBoxHeight: this.props.height
				});
			}
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this = this;
			var parentAttrName = _reactDom2.default.findDOMNode(this).parentNode.attributes[0].name;
			var parentAttrValue = _reactDom2.default.findDOMNode(this).parentNode.attributes[0].value;

			// Attaches event listeners to parent div
			document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').addEventListener('mousemove', function (e) {
				_this._resizeDiv(e);
			});
			document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').addEventListener('mouseup', function (e) {
				_this._stopDrag(e);
			});
			document.querySelector('[' + parentAttrName + '="' + parentAttrValue + '"]').addEventListener('mouseleave', function (e) {
				_this._stopDrag(e);
			});
		}

		// Styles the resize handler according to the direction given


		// Helper function to make the all components in parent non-highlight-able

	}, {
		key: 'render',
		value: function render() {
			var outerDivStyle = {
				backgroundColor: 'transparent',
				width: !this.state.allowGhostResize ? this.state.boxWidth + 'px' : this.state.originalBoxWidth,
				height: !this.state.allowGhostResize ? this.state.boxHeight + 'px' : this.state.originalBoxHeight,
				cursor: 'default',
				position: 'relative'
			};

			// Merge in any custom styles and overwrite existing styles (if any)
			if (this.props.cssStyles) {
				var customStyles = this.props.cssStyles;
				for (var prop in customStyles) {
					outerDivStyle[prop] = customStyles[prop];
				}
			}

			var resizeHandlerStyle = this.getResizeHandlerStyle();

			// For ghostResizing
			var highlightDiv;
			if (this.state.allowGhostResize) {
				var ghostDivStyles = {
					zIndex: '1',
					display: this.state.mouseHeldDown ? 'block' : 'none',
					backgroundColor: '#000000',
					opacity: '0.3',
					width: this.state.boxWidth + 'px',
					height: this.state.boxHeight + 'px',
					cursor: 'default',
					position: 'absolute',
					top: '0px',
					left: '0px'
				};
				if (this.props.ghostCssStyles) {
					var css = this.props.ghostCssStyles;
					for (prop in css) {
						ghostDivStyles[prop] = css[prop];
					}
				}
				highlightDiv = _react2.default.createElement('div', { className: 'ghostDiv', style: ghostDivStyles });
			}
			return _react2.default.createElement(
				'div',
				{ className: this.props.className, style: outerDivStyle },
				highlightDiv,
				_react2.default.createElement('div', { className: this.props.resizeHandlerClassName, style: resizeHandlerStyle, onMouseDown: this._startDrag }),
				this.props.children
			);
		}
	}]);

	return ResizableComponent;
}(_react.Component);

ResizableComponent.defaultProps = {
	options: {},
	direction: 's',

	height: 50,
	width: 250,
	resizeHandlerClassName: 'resize-handler',
	steppingMargin: 20,
	cursorMargin: 10
};

exports.default = ResizableComponent;