import { UPDATE_LOCALES } from '../constants';

export default function locales(state = {}, action) {
  switch (action.type) {
    case UPDATE_LOCALES:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}
