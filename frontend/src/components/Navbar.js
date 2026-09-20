import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <img
            src={`${process.env.PUBLIC_URL}/logo.svg`}
            alt="EasyKhata"
            className="brand-logo"
            width="40"
            height="40"
          />
          <span className="brand-text">
            <span className="brand-title">EasyKhata</span>
            <span className="brand-sub">Income &amp; Expense Recovery Book</span>
          </span>
        </Link>
        {!isDashboard && (
          <Link to="/" className="navbar-back-link">
            ← All recovery men
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
