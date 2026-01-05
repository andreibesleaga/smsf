import * as React from 'react';
import { MyLeavePolicy } from '../../../types';

export const initialState: State = {
  isLoading: false,
  isError: false,
  errorMessage: '',
  myLeavePolicies: []
};
export type State = {
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  myLeavePolicies: MyLeavePolicy[];
};

export const LeaveRequestContext = React.createContext(initialState);
