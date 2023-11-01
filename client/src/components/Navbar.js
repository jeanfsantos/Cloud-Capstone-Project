import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import { authConfig } from '../config';

function Navbar() {
  const location = useLocation();
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

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
              <li className="nav-item d-lg-none">
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
              <li className="nav-item d-lg-none">
                <button className="nav-link" onClick={loginWithRedirect}>
                  Log in
                </button>
              </li>
            </ul>
          )}
        </div>

        <div className="d-none d-lg-flex">
          {isAuthenticated && (
            <>
              <div className="dropdown">
                <button
                  className="btn btn-link dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={user.picture}
                    alt="profile"
                    width="40"
                    height="40"
                    className="rounded-circle"
                  />
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button
                      className="dropdown-item"
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
              </div>
            </>
          )}
          {!isAuthenticated && (
            <div className="nav-item">
              <button
                className="nav-link"
                onClick={() =>
                  loginWithRedirect({
                    authorizationParams: {
                      audience: authConfig.audience,
                    },
                  })
                }
              >
                Log in
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
