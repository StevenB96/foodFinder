import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';

const GET_LOCATION = gql`
  query GetLocation($id: ID!) {
    location(id: $id) {
      location_id
      name
      address
      street
      zipcode
      borough
      cuisine
      grade
      on_wishlist
    }
  }
`;

export default function LocationDetail() {
    const router = useRouter();
    const { id } = router.query;

    const { data, loading, error } = useQuery(GET_LOCATION, {
        variables: { id },
        skip: !id, // skip query until id is defined
    });

    if (loading) return <p>Loading location details...</p>;
    if (error) return <p>Error loading location: {error.message}</p>;
    if (!data || !data.location) return <p>No location found.</p>;

    const loc = data.location;

    return (
        <div>
            <h1>{loc.name}</h1>
            <p>
                {loc.address} {loc.street}, {loc.zipcode}
            </p>
            <p>Borough: {loc.borough}</p>
            <p>Cuisine: {loc.cuisine}</p>
            <p>Grade: {loc.grade}</p>
            {loc.on_wishlist && loc.on_wishlist.length > 0 && (
                <p>On Wishlist: {loc.on_wishlist.join(', ')}</p>
            )}
        </div>
    );
}
