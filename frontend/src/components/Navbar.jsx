import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Navbar() {
  return (
    <nav className="nav">
      <NavLink to="/" className="nav__logo">
        <img src={logo} alt="Macroweaver" className="nav__logo-img" />
        Macroweaver
      </NavLink>

      <div className="nav__links">
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
    </nav>
  )
}
