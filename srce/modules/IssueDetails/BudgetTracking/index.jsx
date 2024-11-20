import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { isNil } from 'lodash';

import { InputDebounced, Modal, Button } from '../../../components/common';

import TrackingWidget from './TrackingWidget';
import { SectionTitle } from '../../IssueDetails/Styles';
import {
  TrackingLink,
  ModalContents,
  ModalTitle,
  Inputs,
  InputCont,
  InputLabel,
  Actions,
} from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  updateIssue: PropTypes.func.isRequired,
};

const BudgetTracking = ({ issue, updateIssue }) => (
  <Fragment>
    <SectionTitle>Original Estimate ($)</SectionTitle>
    {renderHourInput('budgetEstimate', issue, updateIssue)}

    <SectionTitle>Budget Tracking</SectionTitle>
    <Modal
      testid="modal:tracking"
      width={400}
      className="card card-flush border-0 h-md-100"
      renderLink={modal => (
        <TrackingLink onClick={modal.open}>
          <TrackingWidget issue={issue} />
        </TrackingLink>
      )}
      renderContent={modal => (
        <ModalContents>
          <ModalTitle>Budget tracking</ModalTitle>
          <TrackingWidget issue={issue} />
          <Inputs>
            <InputCont>
              <InputLabel>Budget spent ($)</InputLabel>
              {renderHourInput('budgetSpent', issue, updateIssue)}
            </InputCont>
            <InputCont>
              <InputLabel>Budget remaining ($)</InputLabel>
              {renderHourInput('budgetRemaining', issue, updateIssue)}
            </InputCont>
          </Inputs>
          <Actions>
            <Button variant="primary" onClick={modal.close}>
              Done
            </Button>
          </Actions>
        </ModalContents>
      )}
    />
  </Fragment>
);

const formattedNumber = (number) => (
  number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
)

const renderHourInput = (fieldName, issue, updateIssue) => (
  <InputDebounced
    placeholder="Budget"
    filter={/^\d{0,6}$/}
    value={isNil(issue[fieldName]) ? '' : formattedNumber(issue[fieldName])}
    onChange={stringValue => {
      const value = stringValue.trim() ? Number(stringValue) : null;
      updateIssue({ [fieldName]: value });
    }}
    className="form-control form-control-solid"
  />
);


export default BudgetTracking;
