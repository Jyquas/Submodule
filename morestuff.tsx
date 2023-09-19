// ... (Your other imports here)
import NavItemDescription from './components/NavItemDescription';

// ... (Your existing component setup, states, and hooks here)

const Menu = ({ logoImage }) => {
  // ... (Your existing states and hooks here)

  const generateNavItems = (items) => {
    return items.map((item, index) => {
      const menuId = `menu-${item.title}`;
      const hasSubmenu = !!item.children && item.children.length > 0;

      return (
        <MainNavItem
          key={index}
          id={`nav-${item.title}`}
          onMouseEnter={() => handleMouseEnter(menuId)}
          onMouseLeave={() => handleMouseLeave(menuId)}
        >
          <MainNavItemLink
            id={`nav-item-link-${index}`}
            href={item.url}
            ariaHaspopup={hasSubmenu ? "true" : undefined}
            ariaControls={hasSubmenu ? menuId : undefined}
            onClick={(e) => hasSubmenu && toggleSubMenu(e, menuId)}
            onKeyDown={(e) => hasSubmenu && a11yClick(e) && toggleSubMenu(e, menuId)}
          >
            {item.title}
          </MainNavItemLink>
          {
            hasSubmenu && (
              <MegaList id={menuId}>
                {item.children.map((child, childIndex) => (
                  <NavItem id={`nav-${child.title}`} key={childIndex}>
                    <NavItemLink
                      id={`menuitem-${child.title}`}
                      href={child.url}
                    >
                      {child.title}
                    </NavItemLink>
                    {child.description && (
                      <NavItemDescription>
                        {child.description}
                      </NavItemDescription>
                    )}
                  </NavItem>
                ))}
              </MegaList>
            )
          }
        </MainNavItem>
      );
    });
  };

  return (
    <div role="navigation" className="rmm__root" ref={wrapperRef}>
      <Nav
        id="site-nav"
        activeState={megaMenuState}
        ariaLabel="Main Navigation"
      >
        <MainList id="menubar-main" ariaLabel="Main Menu">
          {generateNavItems(menuData)}
        </MainList>
      </Nav>
    </div>
  );
};

// ... (Your existing PropTypes and export here)

