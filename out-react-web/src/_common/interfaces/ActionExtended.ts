import { Action } from 'redux';

export interface ActionExtended extends Action {
  payload: any;
  query: any;
  params: any;
}