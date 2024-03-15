import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

import "./reserve.css";
import useFetch from "../../hooks/useFetch";
import { useContext, useState } from "react";
import { SearchContext } from "../../context/SearchContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

const Reserve = ({ setOpen, hotelId, cost, NumOfRoom }) => {
  // const Reserve = (props) => {
  // console.log("props:", props)
  const [selectedRooms, setSelectedRooms] = useState([]);
  const { data, loading, error } = useFetch(`/hotels/room/${hotelId}`);
  const { dates } = useContext(SearchContext);

  console.log("Total cost:", cost);
  console.log("total rooms", NumOfRoom);
  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const date = new Date(start.getTime());

    const dates = [];

    while (date <= end) {
      dates.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

  const alldates = getDatesInRange(dates[0].startDate, dates[0].endDate);

  const isAvailable = (roomNumber) => {
    const isFound = roomNumber.unavailableDates.some((date) =>
      alldates.includes(new Date(date).getTime())
    );

    return !isFound;
  };

  // const handleSelect = (e) => {
  //   const checked = e.target.checked;
  //   const value = e.target.value;
  //   setSelectedRooms(
  //     checked
  //       ? [...selectedRooms, value]
  //       : selectedRooms.filter((item) => item !== value)
  //   );
  // };

  const handleSelect = (e) => {
    const checked = e.target.checked;
    const value = e.target.value;

    if (checked) {
      // Check if the maximum limit has been reached
      if (selectedRooms.length < NumOfRoom) {
        setSelectedRooms([...selectedRooms, value]);
      } else {
        // Display an error message or handle exceeding the limit in some way
        alert(`You can only select up to ${NumOfRoom} rooms.`);
        e.target.checked = false; // Uncheck the checkbox
      }
    } else {
      setSelectedRooms(selectedRooms.filter((item) => item !== value));
    }
  };

  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      await Promise.all(
        selectedRooms.map((roomId) => {
          const res = axios.put(`/rooms/availability/${roomId}`, {
            dates: alldates,
          });
          return res.data;
        })
      );

      await makePayment();

      console.log("booked");
      setOpen(false);
      //navigate("/");
    } catch (err) {}
  };

  const det = [cost, NumOfRoom];

  const makePayment = async () => {
    console.log("in payment");
    // Your payment logic goes here
    const stripe = await loadStripe(
      'pk_test_51OtSOoSDHdZXOJFs5kO2CtFowcVmP6WMpV0M2R2UzOhkv7jd5bpS8JeiGFaIBtTvzc0F0gutcYWyJt0OYtrqE9WM00P33RiUn7'
    );

    console.log("loaded stripe")
    const body = {
      products: det,
    };
    const headers = {
      "Content-Type": "application/json",
    };
    const response = await fetch(
      "http://localhost:8800/api/stripe/create-checkout-session",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      }
    );

    const session = await response.json();

    const result = stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.log(result.error);
    }
  };

  return (
    <div className="reserve">
      <div className="rContainer">
        <FontAwesomeIcon
          icon={faCircleXmark}
          className="rClose"
          onClick={() => setOpen(false)}
        />
        <span>Select your rooms:</span>
        {data.map((item) => (
          <div className="rItem" key={item._id}>
            <div className="rItemInfo">
              <div className="rTitle">{item.title}</div>
              <div className="rDesc">{item.desc}</div>
              <div className="rMax">
                Max people: <b>{item.maxPeople}</b>
              </div>
              <div className="rPrice">{item.price}</div>
            </div>
            <div className="rSelectRooms">
              {item.roomNumbers.map((roomNumber) => (
                <div className="room">
                  <label>{roomNumber.number}</label>
                  <input
                    type="checkbox"
                    value={roomNumber._id}
                    onChange={handleSelect}
                    disabled={!isAvailable(roomNumber)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={handleClick} className="rButton">
          Reserve Now! for {cost}
        </button>
      </div>
    </div>
  );
};

export default Reserve;
