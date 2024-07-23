import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import "./list.css";
import "../assets/style.css";
import { useToast } from "@shopify/app-bridge-react";
import Loader from "../components/Loader";
import { placeholder } from "../assets";

export default function PageName() {
  const { t } = useTranslation();
  const { show } = useToast();
  const [variantData, setVariantData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [isDisable, setIsDisable] = useState(false);
  const fetch = useAuthenticatedFetch();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize currentPage from localStorage or default to 1
    return parseInt(localStorage.getItem("currentPage")) || 1;
  });
  const [checkedItems, setCheckedItems] = useState([]);
  const [checkedItems1, setCheckedItems1] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const ITEMS_PER_PAGE = 5;
  // /api/price/rule
  const {
    data,
    refetch: refetchProductCount,
    isLoading: isLoadingCount,
    isRefetching: isRefetchingCount,
  } = useAppQuery({
    url: "/api/products/testinglisting",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  const {
    data: selectedData,
    refetch: selectededRefresh,
    isLoading: selectedLoading,
    isRefetching: selectedRefeching,
  } = useAppQuery({
    url: "/api/price/rule",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  // const result = data;
  useEffect(() => {
    if (data) {
      setResult(data);
    }
    if (selectedData && selectedData.data && selectedData.data.length > 0) {
      setSelectedId(selectedData.data[0].id);
    }
  }, [result, data]);

  useEffect(() => {
    if (variantData) {
      const initialCheckedItems = variantData
        .filter((item) =>
          item?.variantApplied?.entitled_variant_ids.includes(item?.id)
        )
        .map((item) => item?.id);
      setCheckedItems1(initialCheckedItems);
    }
  }, [variantData]);

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage.toString());
  }, [currentPage]);

  const togglePopup = async (type, item) => {
    // // Toggle the checked state of the clicked checkbox
    const newCheckedItems = [...checkedItems];
    newCheckedItems[type] = !newCheckedItems[type];
    setCheckedItems(newCheckedItems);

    const variantData = {
      product_id: item?.id,
      price_rule_id: selectedDiscount
        ? selectedData?.data[0]?.id
        : selectedDiscount?.id,
    };

    try {
      const response = await fetch(`/api/product/variant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variantData),
      });

      const result = await response.json();
      if (result) {
        setIsOpen(true);
        setVariantData(result?.variantData);
      }
    } catch (err) {
      // setError(err.message);
    }
  };

  const handleCheckboxChange = (item) => {
    setCheckedItems1((prevCheckedItems) => {
      const isChecked = prevCheckedItems.includes(item);

      if (!isChecked) {
        return [...prevCheckedItems, item];
      } else {
        return prevCheckedItems.filter((id) => id !== item);
      }
    });
  };

  const updateData = async (checkedIds) => {
    setIsDisable(true);
    const items = {
      rule_id: selectedDiscount ? selectedId : selectedData?.data[0]?.id,
      product_variant_id: checkedItems1,
      product_id: checkedIds?.id,
    };

    try {
      const response = await fetch("/api/rule/price", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(items),
      });
      if (response.status === 200) {
        setIsDisable(false);
        setIsOpen(false);
        setCheckedItems([]);
        show("Data updated successfully", {
          duration: 1500,
        });
      }
    } catch (error) {
      if (error) {
        setIsDisable(false);
        show("Something went wrong please try again", {
          duration: 1500,
        });
      }
    }
  };

  const close = () => {
    setIsDisable(false);
    setIsOpen(false);
    setSelectedId(selectedData.data[0].id);
    setCheckedItems([]);
    setCheckedItems1([]);
  };

  const handleSelectChange = async (event) => {
    const selectedId = event.target.value;
    setSelectedId(selectedId);

    const selectedDiscount = selectedData?.data?.find(
      (discount) => discount.id === parseInt(selectedId)
    );

    setSelectedDiscount(selectedDiscount);
  };

  const timeAgo = (starts_at, ends_at) => {
    // const startDt = new Date(starts_at);
    const currentDate = new Date();
    const endDt = new Date(ends_at);
    const timeDifference = endDt - currentDate;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 365 * day;
    if (timeDifference < minute) {
      return `${Math.round(timeDifference / 1000)} seconds `;
    } else if (timeDifference < hour) {
      return `${Math.round(timeDifference / minute)} minutes `;
    } else if (timeDifference < day) {
      return `${Math.round(timeDifference / hour)} hours `;
    } else if (timeDifference < month) {
      return `${Math.round(timeDifference / day)} days `;
    } else if (timeDifference < year) {
      return `${Math.round(timeDifference / month)} months `;
    } else {
      return `${Math.round(timeDifference / year)} years `;
    }
  };

  if (isLoading || !data) {
    return <Loader />;
  }

  // Check if data array is empty
  if (result.length === 0) {
    return <div className="available_data">No data available</div>;
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const paginatedResults = result
    .filter((item) =>
      item?.variants?.some((variant) => variant?.inventory_quantity == 0)
    )
    .slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );

  

  const totalPages = Math.ceil(
    result.filter((item) =>
      item?.variants?.some((variant) => variant?.inventory_quantity == 0)
    ).length / ITEMS_PER_PAGE
  );

  
  return (
    <section className="container common_container">
      <div className="top_haderFilter">
        <div className="heading_div">Products</div>
      </div>
      <div className="table_form">
        {result.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Title</th>
                <th>Status</th>
                <th>discount</th>
                <th>Wait/Save later</th>
              </tr>
            </thead>
            <tbody>
              {/* && item?.variants[index]?.inventory_quantity == 0 */}
              {paginatedResults?.map((item, index) => (
                <React.Fragment key={item?.id}>
                  {item ? (
                    <tr key={item?.id}>
                      <td>
                        {item?.image?.src ? (
                          <img
                            src={item?.image?.src}
                            height={40}
                            width={60}
                            alt="img"
                          />
                        ) : (
                          <img
                            src={placeholder}
                            className="place_holder"
                            height={40}
                            width={60}
                            alt="img"
                          />
                        )}
                      </td>
                      <td>{item.title}</td>

                      <td>
                        <span className="active_div">{item.status}</span>
                      </td>

                      <td className="Check_box">
                        <div>
                          <input
                            type="checkbox"
                            id={`checkbox-${index}`}
                            checked={
                              Array.isArray(item?.meta_fields_data?.data) &&
                              item?.meta_fields_data?.data.some(
                                (dataItem) => dataItem.key === "latestProduct"
                              )
                            }
                          />
                          <label htmlFor={`checkbox-${index}`} />
                        </div>
                      </td>
                      <td className="Check_box">
                        <div>
                          <input
                            type="checkbox"
                            id={`checkbox-${index}`}
                            name={`checkbox-${index}`}
                            defaultValue="Bike"
                            checked={checkedItems[index]}
                            onChange={() => togglePopup(index, item)}
                          />
                          <label htmlFor={`checkbox-${index}`} />
                        </div>
                      </td>

                      {isOpen && checkedItems[index] && (
                        <div className="popup">
                          <div className="popup-inner">
                            <h3>Discount Code Popup</h3>
                            <label className="font-bold">Product Variant</label>
                            {/* {selectedDiscount && ( */}
                            <div className="content_data mt-2 tableDiscount">
                              <table>
                                <tr>
                                  <th>title</th>
                                  <th>price</th>
                                  <th>Update Discount</th>
                                </tr>

                                {variantData &&
                                  variantData?.map((item, index) => (
                                    <>
                                      <tr key={item?.id}>
                                        <td>{item?.title}</td>
                                        <td>{item?.price}</td>
                                        <td className="Check_box">
                                          <div>
                                            <input
                                              type="checkbox"
                                              id={`checkbox-${index}`}
                                              name="scales"
                                              checked={checkedItems1.includes(
                                                item?.id
                                              )}
                                              onClick={() =>
                                                handleCheckboxChange(item?.id)
                                              }
                                            />
                                            <label
                                              htmlFor={`checkbox-${index}`}
                                            />
                                          </div>
                                        </td>
                                      </tr>
                                    </>
                                  ))}
                              </table>
                            </div>

                            {selectedData?.data?.length > 0 ? (
                              <div className="d-flex flex-column">
                                <label className="font-bold">
                                  Discount Code
                                </label>

                                <select
                                  value={selectedId}
                                  onChange={handleSelectChange}
                                >
                                  {selectedData &&
                                    selectedData?.data?.map((item) => (
                                      <>
                                        <option value={`${item.id}`}>
                                          {item.title}
                                        </option>
                                      </>
                                    ))}
                                </select>
                              </div>
                            ) : (
                              <>
                                <p>
                                  You dont have discount yet please create
                                  account
                                </p>
                              </>
                            )}

                            {selectedDiscount && (
                              <div className="content_data mt-2">
                                <table>
                                  <tr>
                                    <th>Type</th>
                                    <th>Value</th>
                                    <th>Frequency</th>
                                  </tr>
                                  <tr>
                                    <td>{selectedDiscount.value_type}</td>
                                    <td>{selectedDiscount.value}</td>
                                    <td>
                                      {timeAgo(
                                        selectedDiscount?.starts_at,
                                        selectedDiscount?.ends_at
                                      )}
                                    </td>
                                  </tr>
                                </table>
                              </div>
                            )}

                            {selectedDiscount ? null : (
                              <>
                                {selectedData?.data[0] && (
                                  <div className="content_data mt-2">
                                    <table>
                                      <thead>
                                        <tr>
                                          <th>Type</th>
                                          <th>Value</th>
                                          <th>Frequency</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td>
                                            {selectedData?.data[0].value_type}
                                          </td>
                                          <td>{selectedData?.data[0].value}</td>
                                          <td>
                                            {timeAgo(
                                              selectedData.data[0]?.starts_at,
                                              selectedData.data[0]?.ends_at
                                            )}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </>
                            )}

                            <div className="d-flex gap-2">
                              <button
                                disabled={isDisable}
                                onClick={() => updateData(item)}
                                className="SaveNow"
                              >
                                Update
                              </button>

                              <a
                                href="https://admin.shopify.com/store/returnshoods/discounts"
                                className="create_now"
                                target="_blank"
                              >
                                Create
                              </a>

                              <button onClick={close} className="close_btn">
                                X
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </tr>
                  ) : (
                    ""
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination starts here */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ opacity: currentPage > 1 ? "1" : "0" }}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ opacity: currentPage < totalPages ? "1" : "0" }}
        >
          Next
        </button>
      </div>
      {/* ends here */}
    </section>
  );
}
