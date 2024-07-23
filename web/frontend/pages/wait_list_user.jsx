import React, { useState } from "react";
import { useAppQuery } from "../hooks";
import "./list.css";
import Loader from "../components/Loader";
export default function UserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/all-user-wait-product",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  if (isLoading || !data) {
    return <Loader />;
  }

  if (!data) {
    return <div className="available_data">No data available</div>;
  }

  return (
    <section className="container common_container">
      <div className="table_form">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Shipping</th>
              <th>Total Products</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data?.data?.map((item) => (
                <React.Fragment key={item?.id}>
                  <tr>
                    <td>{item && item.user_name}</td>
                    <td>{item && item.user_email}</td>
                    {item.shiping_address && (
                      <td className="shipping_adddress">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: item?.shiping_address,
                          }}
                        />
                      </td>
                    )}
                    {item.total_products && <td>{item.total_products}</td>}
                  </tr>
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
