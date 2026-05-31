import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const erInnlogget = localStorage.getItem('innlogget') === 'true';

  if (!erInnlogget) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;