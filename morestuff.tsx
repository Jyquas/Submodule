import React, { useState } from 'react';
import MainList from './components/MainList';
import MainNavItem from './components/MainNavItem';
import MainNavItemLink from './components/MainNavItemLink';
import MegaList from './components/MegaList';
import NavItem from './components/NavItem';
import NavItemLink from './components/NavItemLink';
import NavItemDescription from './components/NavItemDescription';

interface MenuData {
  title: string;
  url: string;
  children?: { title: string; url: string; description?: string }[];
}

const menuData: MenuData[] = [
  {
    title: 'Root 1',
    url: '#root1',
    children: [
      { title: 'Child 1', url: '#child1', description: 'Description 1' },
      { title: 'Child 2', url: '#child2', description: 'Description 2' }
    ]
  },
  {
    title: 'Root 2',
    url: '#root2',
    children: [
      { title: 'Child 1', url: '#child1' }
    ]
  }
];

const Menu: React.FC = () => {
  const [activeTopLevelMenu, setActiveTopLevelMenu] = useState<string | null>(null);

  const handleMouseEnter = (menuId: string) => {
    setActiveTopLevelMenu(menuId);
  };

  const handleMouseLeave = () => {
    setActiveTopLevelMenu(null);
  };

  const generateNavItems = (items: MenuData[]) => {
    return items.map((item, index) => (
      <MainNavItem
        key={index}
        id={`nav-${item.title}`}
        onMouseEnter={() => handleMouseEnter(`menu-${item.title}`)}
        onMouseLeave={handleMouseLeave}
      >
        <MainNavItemLink
          id={`menuitem-${item.title}`}
          href={item.url}
        >
          {item.title}
        </MainNavItemLink>
        {activeTopLevelMenu === `menu-${item.title}` && (
          <MegaList id={`menu-${item.title}`}>
            {item.children && item.children.map((child, childIndex) => (
              <NavItem key={childIndex} id={`nav-${child.title}`}>
                <NavItemLink id={`menuitem-${child.title}`} href={child.url}>
                  {child.title}
                </NavItemLink>
                {child.description && <NavItemDescription>{child.description}</NavItemDescription>}
              </NavItem>
            ))}
          </MegaList>
        )}
      </MainNavItem>
    ));
  };

  return (
    <div role="navigation">
      <MainList id="menubar-main">
        {generateNavItems(menuData)}
      </MainList>
    </div>
  );
};

export default Menu;
