import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import Modal from 'components/Modal';
import Button from 'components/Button';

import actions from 'actions';
import selectors from 'selectors';

import './PasswordModal.scss';

class PasswordModal extends React.PureComponent {
  static propTypes = {
    attempt: PropTypes.number.isRequired,
    checkPassword: PropTypes.func,
    setPasswordAttempts: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.maxAttempts = 3;
    this.passwordInput = React.createRef();
    this.initialState = {
      password: '',
      userCanceled: false
    };
    this.state = this.initialState;
  }

  handleVisibilityChange = isVisible => {
    if (!isVisible) {
      // when a user enters the correct password or calls core.closeDocument
      // reset state in case user loads another password-protected document
      this.setState(this.initialState);
    }

    if (this.passwordInput.current) {
      this.passwordInput.current.focus();
    }
  }

  handleInputChange = e => {
    this.setState({ password: e.target.value });
  }

  handleSubmit = e => {
    e.preventDefault();

    this.props.checkPassword(this.state.password);
  }

  handleCancel = () => {
    this.setState({ userCanceled: true });
  }

  renderContent = () => {
    const userExceedsMaxAttempts = this.props.attempt === this.maxAttempts;

    if (userExceedsMaxAttempts) {
      return this.renderMaxAttemptsContent();
    }
    if (this.state.userCanceled) {
      return this.renderUserCancelContent();
    }

    return this.renderEnterPasswordContent();
  }

  renderMaxAttemptsContent = () => {
    return <p>{this.props.t('message.encryptedAttemptsExceeded')}</p>;
  }

  renderUserCancelContent = () => {
    return <p>{this.props.t('message.encryptedUserCancelled')}</p>;
  }

  renderEnterPasswordContent = () => {
    const { t } = this.props;
    const wrongPassword = this.props.attempt !== 0;

    return (
      <div className="wrapper">
        <div className="header">{t('message.passwordRequired')}</div>
        <form onSubmit={this.handleSubmit}>
          <div className="enter">
            <div>{t('message.enterPassword')}</div>
            <input
              className={`${wrongPassword ? 'wrong' : 'correct'}`}
              type="password"
              ref={this.passwordInput}
              value={this.state.password}
              onChange={this.handleInputChange}
            />
          </div>
          {wrongPassword &&
            <div className="incorrect-password">
              {t('message.incorrectPassword', { 
                remainingAttempts: this.maxAttempts - this.props.attempt
              })}
            </div>
          }
          <div className="buttons">
            <Button
              dataElement="passwordSubmitButton"
              label={t('action.submit')}
              onClick={this.handleSubmit}
            />
            <Button
              dataElement="passwordCancelButton"
              label={t('action.cancel')}
              onClick={this.handleCancel}
            />
          </div>
        </form>
      </div>
    );
  }

  render() {
    return (
      <Modal 
        className="PasswordModal"
        dataElement="passwordModal"
        onVisibilityChange={this.handleVisibilityChange}
      >
        <div className="container">
          {this.renderContent()}
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  checkPassword: selectors.getCheckPasswordFunction(state),
  attempt: selectors.getPasswordAttempts(state)
});

const mapDispatchToProps = {
  setPasswordAttempts: actions.setPasswordAttempts,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(PasswordModal));