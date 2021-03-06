/* global document, HTMLImageElement */

import classNames from 'classnames';
import map from 'lodash.map';
import trim from 'lodash.trim';
import CssSelectorGenerator from 'css-selector-generator';
import FaTags from 'react-icons/lib/fa/tags';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Highlighter from 'components/Highlighter';
import Sidebar from 'components/Sidebar';
import {
  selectElement as _selectElement,
  setExpanded as _setExpanded,
} from 'redux/proxyActions';
import {
  currentAnnotationSelector,
  currentFieldTypeSelector,
} from 'redux/selectors';

import styles from './style.scss';

const selectorGenerator = new CssSelectorGenerator({
  // TODO(jrbotros): Exclude specific classes (e.g., `tether-*`) but allow others
  selectors: ['id', 'tag', 'nthchild'],
});

class Main extends React.Component {
  state = {
    highlightTarget: null,
  };

  componentWillReceiveProps({ currentAnnotation }) {
    if (currentAnnotation !== this.props.currentAnnotation) {
      this.setState({ highlightTarget: null });
    }
  }

  getWrappedText(node) {
    if (node.nodeType === node.TEXT_NODE) {
      return node.textContent;
    }
    if (node.tagName === 'BR') {
      return this.props.currentFieldType === 'rich-text' ? '<br>' : '\n';
    }
    const text = map(node.childNodes, child => this.getWrappedText(child));
    return trim(text.join(''));
  }

  getWrappedContent(node) {
    switch (this.props.currentFieldType) {
      case 'text':
      case 'rich-text': {
        return this.getWrappedText(node);
      }
      case 'image': {
        return node instanceof HTMLImageElement && node.src ? node.src : null;
      }
      default: {
        return null;
      }
    }
  }

  mouseOverMain = (event) => {
    if (this.getWrappedContent(event.target)) {
      this.setState({ highlightTarget: event.target });
    }
  }

  clickMain = (event) => {
    const content = this.getWrappedContent(event.target);
    if (content) {
      const selector = selectorGenerator.getSelector(event.target);
      // Append the content if the `cmd` or `windows` key is pressed
      this.props.selectElement(selector, content, event.metaKey);
      event.preventDefault();
      event.stopPropagation();
    }
  }

  toggleOpen = () => {
    this.setState({ highlightTarget: null });
    this.props.setExpanded(!this.props.expanded);
  }

  render() {
    return (
      <div>
        <div
          className={
            classNames(styles.kinaseSidebar, {
              [styles.sidebarOpen]: this.props.expanded,
            })
          }
        >
          <Sidebar />
          <div className={styles.sidebarToggle} onClick={this.toggleOpen}>
            <FaTags />
          </div>
        </div>
        <div
          className={
            classNames(styles.kinaseMain, {
              [styles.sidebarOpen]: this.props.expanded,
            })
          }
          onClick={this.clickMain}
          onMouseOver={this.mouseOverMain}
          dangerouslySetInnerHTML={{ __html: this.props.body }}
        />
        <Highlighter target={this.state.highlightTarget} />
      </div>
    );
  }
}

Main.propTypes = {
  body: PropTypes.string.isRequired,
  currentAnnotation: PropTypes.string,
  currentFieldType: PropTypes.string,
  expanded: PropTypes.bool.isRequired,
  selectElement: PropTypes.func.isRequired,
  setExpanded: PropTypes.func.isRequired,
};

Main.defaultProps = {
  currentAnnotation: null,
  currentFieldType: null,
};

export default connect(
  state => ({
    currentAnnotation: currentAnnotationSelector(state),
    currentFieldType: currentFieldTypeSelector(state),
    expanded: state.expanded,
  }),
  dispatch => ({
    selectElement: (selector, content, append) => dispatch(
      _selectElement(selector, content, append)),
    setExpanded: expanded => dispatch(_setExpanded(expanded)),
  }),
)(Main);
