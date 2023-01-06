import React from 'react';

export default (props) => {
  return <input
    {...props.input}
    placeholder={props.placeholder}
    readOnly={props.readOnly}
    type={props.type} />
};
