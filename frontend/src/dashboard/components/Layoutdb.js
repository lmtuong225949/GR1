import React from 'react';
import OutHeader from './OutHeader';

const Layoutdb = ({ children }) => {
  return (
    <div className="layoutdb">
      <OutHeader />
      <main className="contentdb">
        {children}
      </main>
    </div>
  );
};

export default Layoutdb;
