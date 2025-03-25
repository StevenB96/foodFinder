import type {
  GetServerSideProps,
  GetServerSidePropsContext,
} from "next";
import {
  ParsedUrlQuery
} from "querystring";
import Link from "next/link";

import dbConnect from "middleware/db-connect";
import {
  LocationType
} from "mongoose/locations/schema";
import {
  findLocationsById
} from "mongoose/locations/services";
import {
  authenticate,
} from "../../lib/auth";
import styles from "../../styles/locationDetail.module.css";

interface LocationDetailProps {
  data: {
    location: string;
  };
}

export default function LocationDetail({ data }: LocationDetailProps) {
  const locations: LocationType[] = JSON.parse(data?.location || "[]");
  const location = locations[0];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{location?.name}</h1>
      <div className={styles.detail}>
        <p className={styles.detailItem}>{location?.address}</p>
        <p className={styles.detailItem}>Latitude: {location?.latitude}</p>
        <p className={styles.detailItem}>Longitude: {location?.longitude}</p>
      </div>
      <Link href="/locations">
        <a className={styles.button}>Back to Locations</a>
      </Link>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext<ParsedUrlQuery>
) => {
  const { id } = context.query;
  const cookieHeader = context.req.headers.cookie;
  const resContext = context.res;

  let location: LocationType[] | null = null;

  try {
    if (await authenticate(cookieHeader, resContext)) {
      await dbConnect();
      if (id && typeof id === "string") {
        location = await findLocationsById([id]);
      }
    }
  } catch (error) {
    console.error("Error verifying token or fetching location:", error);

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
        location: JSON.stringify(location),
      },
    },
  };
};
