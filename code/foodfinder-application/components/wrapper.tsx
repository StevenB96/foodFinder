// components/Wrapper.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/wrapper.module.css';

interface NavLink {
    name: string;
    path: string;
    children?: NavLink[];
}

interface WrapperProps {
    children: React.ReactNode;
}

const navLinks: NavLink[] = [
    {
        name: 'Home',
        path: '/'
    },
    {
        name: 'Work Example',
        path: '/about'
    },
    {
        name: 'Projects',
        path: '/projects',
        children: [
            {
                name: 'Professional',
                path: '/projects/professional'
            },
            {
                name: 'Personal',
                path: '/projects/personal'
            },
        ]
    },
    {
        name: 'Profile',
        path: '/profile',
        children: [
            {
                name: 'Logout',
                path: '/api/logout'
            },
        ]
    },
];

const NavItem: React.FC<{ link: NavLink }> = ({ link }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const router = useRouter();

    // Helper to determine if the current link is active
    const isActive = router.pathname === link.path;

    return (
        <div
            className={styles.navItem}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <Link href={link.path}>
                <a
                    className={`${styles.link} ${isActive ? styles.activeLink : ''}`}
                    onClick={(e) => {
                        if (link.children) {
                            // Prevent navigation if there are children
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }
                    }}
                >
                    {link.name}
                </a>
            </Link>
            {link.children && isOpen && (
                <div className={styles.dropdown}>
                    {link.children.map((child) => (
                        <NavItem key={child.name} link={child} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
    const router = useRouter();

    // Convert the route path into a readable title
    const getPageTitle = (path: string) => {
        if (path === '/') return 'Home';
        return path
            .replace(/\//g, '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const pageTitle = getPageTitle(router.pathname);

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <h1 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>
                    {pageTitle}
                </h1>
                <nav className={styles.nav}>
                    {navLinks.map((link) => (
                        <NavItem key={link.name} link={link} />
                    ))}
                </nav>
            </header>
            <main className={styles.main}>{children}</main>
            <footer className={styles.footer}>
                <p>© 2025 stevenberrisford.com, all rights reserved.</p>
            </footer>
        </div>
    );
};

export default Wrapper;
