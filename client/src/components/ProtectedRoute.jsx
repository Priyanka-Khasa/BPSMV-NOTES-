import React from 'react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  // Auth bypassed — always render children
  return children;
};

export default ProtectedRoute;
