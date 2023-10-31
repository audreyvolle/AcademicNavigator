import React from 'react';
import './info-box.scss';

const NodeInfoBox = ({ node, isVisible, style }:{node:string | null, isVisible:boolean, style:React.CSSProperties}) => {
    return (
        <div className={`node-info-box ${isVisible ? 'visible' : 'hidden'}`} style={style}>
            <p style={{ whiteSpace: 'pre-line' }}>{node}</p>
        </div>
    );
};

export default NodeInfoBox;