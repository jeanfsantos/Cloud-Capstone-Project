import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

function Navbar() {
  const location = useLocation();
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const getRouteClassName = path =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Chat App
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          {isAuthenticated && (
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/chat" className={getRouteClassName('/chat')}>
                  Chat
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/channels/create"
                  className={getRouteClassName('/channels/create')}
                >
                  Create Channel
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => {
                    logout({
                      logoutParams: {
                        returnTo: window.location.origin,
                      },
                    });
                  }}
                >
                  Log out
                </button>
              </li>
            </ul>
          )}
          {!isAuthenticated && (
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/" className={getRouteClassName('/')}>
                  Home
                </Link>
              </li>
              <li className="d-flex">
                <button className="nav-link" onClick={loginWithRedirect}>
                  Log in
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
