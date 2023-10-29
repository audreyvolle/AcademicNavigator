import React from 'react';
import './info-box.scss';

const NodeInfoBox = ({ node, isVisible, style }) => { //used in sidebar for the info box
    return (
        <div className={`node-info-box ${isVisible ? 'visible' : 'hidden'}`} style={style}>
            <p style={{ whiteSpace: 'pre-line' }}>{node}</p>
        </div>
    );
};

export default NodeInfoBox;