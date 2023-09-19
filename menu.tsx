import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Components
import TopBar from './components/TopBar';
import Logo from './components/Logo';
import TopBarTitle from './components/TopBarTitle';
import Hamburger from './components/Hamburger';
import Nav from './components/Nav';
import MainList from './components/MainList';
import MegaList from './components/MegaList';
import MainNavItem from './components/MainNavItem';
import MainNavItemLink from './components/MainNavItemLink';
import NavItemDescription from './components/NavItemDescription';

// State Machines
import { MenuStateMachine } from './state-machines/menus';

interface IMenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  children?: IMenuItem[];
}

interface MenuProps {
  logoImage: string;
  data: IMenuItem[];
}

const Menu: React.FC<MenuProps> = ({ logoImage, data }) => {
  // ... existing state and functions
  const [megaMenuState, setMegaMenuState] = useState('');
  const [subMenuState, setSubMenuState] = useState('');
  const [subSubMenuState, setSubSubMenuState] = useState('');
  const [activeMenus, setActiveMenus] = useState([]);
  const [isMobile, setIsMobile] = useState(true);
  const wrapperRef = useRef(null);
  
  // ... other existing logic and functions

  const generateNavItems = (items: IMenuItem[]) => {
    return items.map((item, index) => (
      <MainNavItem key={index} role="none" id={`nav-${item.title}`} isChildren={item.children ? true : false}>
        {item.icon && (
          <Logo
            id={`menuitem-icon-${item.title}`}
            src={item.icon}
            alt={`${item.title} icon`}
            rel="icon"
          />
        )}
        <MainNavItemLink id={`menuitem-${item.title}`} role="menuitem" href={item.url}>
          {item.title}
        </MainNavItemLink>
        {item.description && <NavItemDescription>{item.description}</NavItemDescription>}
        {item.children && (
          <MegaList
            id={`menu-${item.title}`}
            activeState={activeMenus.includes(`menu-${item.title}`) ? 'open' : 'closed'}
          >
            {generateNavItems(item.children)}
          </MegaList>
        )}
      </MainNavItem>
    ));
  };

  return (
    <div role="navigation" className="rmm__root" ref={wrapperRef}>
      <TopBar>
        {logoImage && (
          <Logo
            id="menuitem-logo"
            src={logoImage}
            alt="Your brand's logo"
            rel="home"
          />
        )}
        <TopBarTitle>Your Brand Name</TopBarTitle>
      </TopBar>
      <Hamburger
        label="Menu"
        state={megaMenuState}
        onClick={(e) => toggleMegaMenu(e, 'nav-main')}
      />
      <Nav
        id="site-nav"
        activeState={megaMenuState}
        ariaLabel="Main Navigation"
      >
        <MainList id="menubar-main" ariaLabel="Main Menu">
          {generateNavItems(data)}
        </MainList>
      </Nav>
    </div>
  );
};

Menu.propTypes = {
  logoImage: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
};

export default Menu;
