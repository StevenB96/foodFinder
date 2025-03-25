import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
  InferGetServerSidePropsType,
} from "next";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";

import dbConnect from "middleware/db-connect";
import { LocationType } from "mongoose/locations/schema";
import { findAllLocations } from "mongoose/locations/services";
import {
  authenticate,
} from "../../lib/auth";

import styles from "../../styles/locations.module.css";
import { decode } from "punycode";

type LocationsProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Locations: NextPage<LocationsProps> = ({ data }) => {
  const locations: LocationType[] = JSON.parse(data?.locations || "[]");

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Locations</h1>
      <ul className={styles.locationList}>
        {locations.map((loc) => (
          <li key={loc._id} className={styles.locationItem}>
            <Link href={`/locations/${loc._id}`}>
              <a className={styles.locationLink}>
                <strong>{loc.name}</strong> – {loc.address}
              </a>
            </Link>
            <p className={styles.locationDetails}>
              Latitude: {loc.latitude} | Longitude: {loc.longitude}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext<ParsedUrlQuery>
) => {
  const { userId } = context.query;
  const cookieHeader = context.req.headers.cookie;
  const resContext = context.res;

  let locations: LocationType[] = [];

  try {
    if (await authenticate(cookieHeader, resContext)) {
      await dbConnect();
      locations = await findAllLocations();
    }
  } catch (error) {
    console.error("Error verifying token or fetching locations:", error);

    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      data: {
        locations: JSON.stringify(locations),
        userId: userId || null,
      },
    },
  };
};

export default Locations;
