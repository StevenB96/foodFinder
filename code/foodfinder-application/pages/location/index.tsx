import mongoose from 'mongoose';
import Link from 'next/link';

export default function LocationsList({ locations }) {
  return (
    <div>
      <h1>All Locations</h1>
      <ul>
        {locations.map((loc) => (
          <li key={loc._id}>
            <Link href={`/location/${loc._id}`}>
              <a>
                <strong>{loc.name}</strong> – {loc.address} {loc.street}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * getServerSideProps: (Server-side Rendering): Fetch data on each request.
 * Write server-side code (filesystem / database.) directly in getServerSideProps.
 * Do not fetch next API routes. Import the logic directly.
 */
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  let locations: LocationType[] | [];
  let { locationId } = context.query;
  try {
      // connect to database
      await dbConnect();
      // call function from service
      locations = await findLocationsById([locationId as string]);
      if (!locations.length) {
          throw new Error(`Locations ${locationId} not found`);
      }
  } catch (err: any) {
      // show 404 not found page
      return {
          notFound: true,
      };
  }
  return {
      // the props will be received by the page component
      props: { data: { location: JSON.stringify(locations.pop()) } },
  };
};
