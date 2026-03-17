import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location])

  return (
    <nav className="nav">
      <NavLink to="/" className="nav__logo">
        <img src={logo} alt="Macroweaver" className="nav__logo-img" />
        Macroweaver
      </NavLink>

      <div className={`nav__links ${isOpen ? 'nav__links--open' : ''}`}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav__link ${isActive ? 'nav__link--active' : ''}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/simulate"
          className={({ isActive }) =>
            `nav__link ${isActive ? 'nav__link--active' : ''}`
          }
        >
          Simulator
        </NavLink>
        <NavLink
          to="/compare"
          className={({ isActive }) =>
            `nav__link ${isActive ? 'nav__link--active' : ''}`
          }
        >
          Compare
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `nav__link ${isActive ? 'nav__link--active' : ''}`
          }
        >
          About
        </NavLink>
      </div>

      <button 
        className="nav__toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span className={`nav__hamburger ${isOpen ? 'nav__hamburger--open' : ''}`}></span>
      </button>

      {/* Overlay to close menu when clicking outside on mobile */}
      {isOpen && <div className="nav__overlay" onClick={() => setIsOpen(false)}></div>}
    </nav>
  )
}
