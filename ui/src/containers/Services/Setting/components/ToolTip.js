import React from 'react';
import { Tooltip, Icon, Position } from "@blueprintjs/core/lib/esm/index";

const style = {
  cursor: 'pointer',
  position: 'relative',
  top: '3px',
  left: '3px',
};

export default ({ content }) => (
  <Tooltip content={content} position={Position.RIGHT}>
    <Icon icon="help" color='#394B59' iconSize={14} style={style}/>
  </Tooltip>
);
