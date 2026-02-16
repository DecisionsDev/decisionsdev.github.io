import React from 'react';
import { Header as ShellHeader, HeaderName } from '@carbon/react';

const Header = ({ children }) => {
  return (
    <ShellHeader aria-label="IBM Platform Name">
      <HeaderName href="/" prefix="IBM">
        DecisionsDev
      </HeaderName>
      {children}
    </ShellHeader>
  );
};

export default Header;

// Made with Bob
