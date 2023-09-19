import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TopBar from './components/TopBar';
import Logo from './components/Logo';
import TopBarTitle from './components/TopBarTitle';
import Hamburger from './components/Hamburger';
import Nav from './components/Nav';
import MainList from './components/MainList';
import MainNavItem from './components/MainNavItem';
import MainNavItemLink from './components/MainNavItemLink';

// Example state machine
const MenuStateMachine = (state) => {
  return state === 'closed' ? 'open' : 'closed';
};

const Menu = ({ logoImage, data }) => {
  const [activeMenus, setActiveMenus] = useState([]);
  const wrapperRef = useRef(null);

  const handleMouseEnter = (menuId) => {
    setActiveMenus([...activeMenus, menuId]);
  };

  const handleMouseLeave = (menuId) => {
    setActiveMenus(activeMenus.filter((id) => id !== menuId));
  };

  const generateNavItems = (items) => {
    return items.map((item, index) => (
      <MainNavItem
        key={index}
        onMouseEnter={() => handleMouseEnter(`menu-${item.title}`)}
        onMouseLeave={() => handleMouseLeave(`menu-${item.title}`)}
      >
        <MainNavItemLink href={item.url}>
          {item.title}
        </MainNavItemLink>
      </MainNavItem>
    ));
  };

  return (
    <div role="navigation" className="rmm__root" ref={wrapperRef}>
      <TopBar>
        {logoImage && (
          <Logo id="menuitem-logo" src={logoImage} alt="Your brand's logo" rel="home" />
        )}
        <TopBarTitle>Your Brand Name</TopBarTitle>
      </TopBar>
      <Hamburger
        label="Menu"
        state={activeMenus.length > 0 ? 'open' : 'closed'}
        onMouseEnter={() => handleMouseEnter('nav-main')}
        onMouseLeave={() => handleMouseLeave('nav-main')}
      />
      <Nav
        id="site-nav"
        activeState={activeMenus.length > 0 ? 'open' : 'closed'}
        ariaLabel="Main Navigation"
      >
        <MainList id="menubar-main" ariaLabel="Main Menu">
          {generateNavItems(data)}
        </MainList>
      </Nav>
    </div>
  );
};

Menu.defaultProps = { logoImage: null };

Menu.propTypes = {
  logoImage: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Menu;
