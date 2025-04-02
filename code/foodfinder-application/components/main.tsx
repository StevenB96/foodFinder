// components/Main.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../styles/main.module.css';

interface NavLink {
    name: string;
    path: string;
    protected?: boolean;
    children?: NavLink[];
}

interface MainProps {
    children: React.ReactNode;
}

const navLinks: NavLink[] = [
    {
        name: 'Home',
        path: '/',
        protected: true,
    },
    {
        name: 'Work Example',
        path: '/about',
        protected: true,
    },
    {
        name: 'Projects',
        path: '/projects',
        protected: true,
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
        protected: true,
        children: [
            {
                name: 'Logout',
                path: '/api/sign-out'
            },
        ]
    },
];

const NavItem: React.FC<{ link: NavLink }> = ({ link }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const router = useRouter();

    // Helper to determine if the current link is active
    const isActive = router.pathname === link.path;

    // Unified function to handle navigation or API calls behind the scenes
    const handleNavigation = async (
        e: React.MouseEvent,
        link: NavLink,
        post: boolean = false
    ) => {
        e.preventDefault();
        if (link.path.startsWith('/api')) {
            try {
                const response = post
                    ? await axios.post(link.path)
                    : await axios.get(link.path);
            } catch (error: any) {
                if (error.response && error.response.status === 401) {
                    console.warn('Unauthorized! Redirecting to /auth');
                    router.push('/auth');
                } else {
                    console.error('API call error:', error);
                }
            }
        } else {
            router.push(link.path);
        }
    };

    return (
        <div
            className={styles.navItem}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <Link
                href={link.path}
                className={`${styles.link} ${isActive ? styles.activeLink : ''}`}
                onClick={(e) => {
                    if (link.children) {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                        return;
                    }
                    handleNavigation(e, link, link.path.startsWith('/api'));
                }}
            >
                {link.name}
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

const Main: React.FC<MainProps> = ({ children }) => {
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

export default Main;
