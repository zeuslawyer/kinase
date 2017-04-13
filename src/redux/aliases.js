import { SELECT_ELEMENT } from 'redux/constants';
import { updateField } from 'redux/proxyActions';

// NOTE: The `alias` middleware allows async actions to be triggered from the
// proxy store but carried out on the background page. Read more at:
// https://github.com/tshaddix/react-chrome-redux/wiki/Advanced-Usage
export default {
  [SELECT_ELEMENT]: action => (dispatch, getState) => {
    const { currentAnnotation, currentField } = getState();
    if (currentAnnotation && currentField) {
      return dispatch(updateField(
        currentAnnotation, currentField, action.content, action.selector));
    }
    return Promise.resolve();
  },
};
