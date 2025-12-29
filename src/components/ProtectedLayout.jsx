import React from 'react';
import Layout from './Layout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

const ProtectedLayout = ({ children, roles = [] }) => (
    <ProtectedRoute roles={roles}>
        <Layout>
            {children}
        </Layout>
    </ProtectedRoute>
);

export default ProtectedLayout;