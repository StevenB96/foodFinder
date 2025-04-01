// pages/Home.tsx
import React from 'react';
import Image from 'next/image';
import styles from '../styles/home.module.css';

import Wrapper from '../components/wrapper';
import {
    authenticate
} from "../lib/auth";

const Home: React.FC = () => {
    return (
        <Wrapper>
            <div className={styles.container}>
                <Image
                    src="/profile.jpg"
                    alt="Profile Picture"
                    className={styles.profilePic}
                />
                <h2 className={styles.fullName}>
                    John Doe
                </h2>
                <h3 className={styles.title}>
                    Full Stack Developer
                </h3>
                <p className={styles.description}>
                    I am a passionate developer with expertise in building modern web applications that deliver exceptional user experiences.
                </p>
            </div>
        </Wrapper>
    );
};

export const getServerSideProps = async (context: any) => {
    const cookieHeader = context.req.headers.cookie || '';
    const resContext = context.res;

    try {
        await authenticate(cookieHeader, resContext);
    } catch (error) {
        console.error("Error verifying token:", error);

        return {
            redirect: {
                destination: "/auth",
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
};

export default Home;
