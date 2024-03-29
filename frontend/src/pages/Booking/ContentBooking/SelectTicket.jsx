import React, { useEffect, useState } from "react";
import "./SelectTicket.css";
import { message } from "antd";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookingState from "../BookingState/BookingState";

const SelectTicket = ({next}) => {
  const [isCheck, setIsCheck] = useState(false);
  const [circleInfo, setCircleInfo] = useState(null);
  const [ticketClick, setTicketClick] = useState([]);
  const [totalPriceByType, setTotalPriceByType] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [eventById, setEventById] = useState({});
  const [seatItem ,setSeatItem] = useState ([])
  const [priceItem, setPriceItem] = useState([]);


const { VITE_APP_URL_Api } = import.meta.env



  
  const { _id } = useParams();
  useEffect(() => {
    const getEventById = async () => {
      try {
        const response = await axios.get(`${VITE_APP_URL_Api}event/${_id}`);
        console.log("res:", response.data);
        setEventById(response.data)
        setSeatItem (response.data.event.seats)
        setPriceItem (response.data.event.price)
        console.log("setEvent", product);
      } catch (error) {
        console.log("Lỗi:", error.response);
      }
    };
    getEventById();
  }, [`${VITE_APP_URL_Api}event/${_id}`]);
  // const eventName = eventById.event.nameE;
  // console.log(eventName)
  console.log(priceItem)

    seatItem.forEach(newItem => {
      const getPrice = priceItem.find(item=>item.option === newItem.type)
      if (getPrice){
        newItem.price = getPrice.price
      }
    })
  
  console.log("seatItem",seatItem)




  const handleMouseEnter = (stage) => {
    setCircleInfo(stage);
  };
  const stage = circleInfo
  console.log("handleMouseEnter", stage)

  const handleMouseLeave = () => {
    setCircleInfo(null);
  };
  console.log("circleInfo",circleInfo);
  console.log ("ticketClick",ticketClick);


  const handleClick = () => {                               
    const isSelected = ticketClick.find(
      (ticket) => ticket._id === circleInfo._id
      
    );
      console.log ("isSelected",isSelected)
    if (isSelected) {
      console.log(isSelected);
      const updatedTickets = ticketClick.filter(
        (ticket) => ticket._id !== circleInfo._id
      );
      setTicketClick(updatedTickets);
      console.log(ticketClick);
    } else {
      if (ticketClick.length < 10) {
        const selectedTicket = seatItem.find(
          (ticket) => ticket._id === circleInfo._id
        );
        setTicketClick([...ticketClick, selectedTicket]);
      } else {
        message.warning("Bạn đã vượt quá số vé được mua là 10 vé");
      }
    }
  };
  useEffect(() => {
    // const updatedId = ticketClick.map((ticket) => ticket.id);
    // setTicketId(updatedId);
    console.log("ticketClick", ticketClick);

    const updatedTotalPriceByType = ticketClick.reduce((acc, ticket) => {
      console.log(ticket);
      if (acc.hasOwnProperty(ticket.type)) {
        acc[ticket.type] += Number(ticket.price);
      } else {
        acc[ticket.type] = ticket.price;
      }
      console.log("acc", acc);
      console.log("typeOf", typeof acc.Vip)
      return acc;
    }, {});
    console.log("updatedTotalPriceByType", updatedTotalPriceByType);

    setTotalPriceByType(updatedTotalPriceByType);
    
  }, [ticketClick]);
  useEffect(() => {
    const updatedTotalPrice = ticketClick.reduce((sum, ticket) => sum + ticket.price, 0);
    setTotalPrice(updatedTotalPrice);
  }, [ticketClick]);

  const handleCheck = () => {
    setIsCheck(!isCheck);
    console.log(isCheck);
  };
 
  const uniqueTicketTypes = [
    ...new Set(ticketClick.map((ticket) => ticket.type)),
  ];
  console.log("uniqueTicketTypes",uniqueTicketTypes);
  const ticketCountByType = {};
  ticketClick.forEach((ticket) => {
    const { type } = ticket;
    if (type in ticketCountByType) {
      ticketCountByType[type]++;
    } else {
      ticketCountByType[type] = 1;
    }
  });


  return (
    <div className="bookingPage">
      <div className="bookingComponent">
        <div className="seatState">
          <span className="info-seatState">Vui lòng chọn ghế bên dưới</span>
          <div className="circle">
            <div className="availabel">
              <div className="circle-available"></div>
              <span>Ghế trống</span>
            </div>
            <div className="choosing">
              <div className="circle-choosing"></div>
              <span>Ghế đang chọn</span>
            </div>
            <div className="unavailabel">
              <div className="circle-unavailable"></div>
              <span>Ghế đã có người chọn chọn</span>
            </div>
          </div>
        </div>
        <div className="seatArea">
          <div className="standart-area">
            <span>Standart</span>
            <div className="color-standart-area"></div>
          </div>
          <div className="vip-area">
            <span>Vip</span>
            <div className="color-standart-vip"></div>
          </div>
          <div className="vvip-area">
            <span>V.Vip</span>
            <div className="color-standart-vvip"></div>
          </div>
        </div>

        <div className="seatMap">
          <span className="title-seatMap">Stage/Sân khấu</span>
          {/* <div className="seatMapComponent"> */}
          <div className="seatMapComponent-VVip">
            {seatItem
              .filter((stage) => stage.type === "V-Vip")
              .map((stage, index) => (
                <div
                  className={`model-${stage.type} ${
                    ticketClick.find((ticket) => ticket._id === stage._id)
                      ? "selected"
                      : ""
                  }`}
     
                  key={index}
                  onMouseEnter={() => handleMouseEnter(stage)}
                  // onMouseEnter={handleMouseEnter(stage)}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleClick}
                >
                  <div className="numberSeat">
                    {stage.index}
                    {circleInfo && (
                      <div className="circle-info">
                        <span>{stage.nameOfSeat}</span>
                        <span>{stage.type}</span>
                        <span>{stage.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>  
          <div className="seatMapComponent-Vip">
            {seatItem
              .filter((stage) => stage.type === "Vip")
              .map((stage, index) => (
                <div
                  className={`model-${stage.type} ${
                    ticketClick.find((ticket) => ticket._id === stage._id)
                      ? "selected"
                      : ""
                  }`}
                  // className={`model-${stage.type}`}
                  // key={`${stage.type}-${stage.price}-${index}`}
                  key={index}
                  onMouseEnter={() => handleMouseEnter(stage)}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleClick}
                >
                  <div className="numberSeat">
                    {stage.index}
                    {circleInfo && (
                      <div className="circle-info">
                        <span>{stage.nameOfSeat}</span>
                        <span>{stage.type}</span>
                        <span>{stage.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div className="seatMapComponent-Standard">
            {seatItem
              .filter((stage) => stage.type === "Standard")
              .map((stage, index) => (
                <div
                  className={`model-${stage.type} ${
                    ticketClick.find((ticket) => ticket._id === stage._id)
                      ? "selected"
                      : ""
                  }`}
                  // className={`model-${stage.type}`}
                  // key={`${stage.type}-${stage.price}-${index}`}
                  key={index}
                  onMouseEnter={() => handleMouseEnter(stage)}
                  onMouseLeave={handleMouseLeave}
                  onClick={handleClick}
                >
                  <div className="numberSeat">
                    {stage.index}
                    {circleInfo && (
                      <div className="circle-info">
                        <span>{stage.nameOfSeat}</span>
                        <span>{stage.type}</span>
                        <span>{stage.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          {/* </div> */}
        </div>
      </div>

      <div className="info-payment">
        <span className="infoTicket">Thông tin đặt vé</span>
        <hr />
        {ticketClick && ticketClick.length > 0 ? (
          uniqueTicketTypes.map((ticketType) => {
            const count = ticketCountByType[ticketType] || 0;

            const backgroundColor =
              ticketType === "Standard"
                ? "yellow"
                : ticketType === "Vip"
                ? "rgb(215, 50, 116)"
                : ticketType === "V-Vip"
                ? "rgb(230, 111, 20)"
                : ticketType === "initial";
            return (
              <div className="ticketInfo" key={ticketType}>
                <div className="ticket-info">
                  <div className="seatInfo">
                    <span>{ticketType}</span>
                  </div>
                  <div className="ticketId">
                    {/* <span>{circleInfo.id}</span> */}

                    {ticketClick
                      .filter((ticket) => ticket.type === ticketType)
                      .map((ticket) => (
                        <span
                          className="showIdTicket"
                          key={ticket.id}
                          style={{ backgroundColor: backgroundColor }}
                        >
                          {ticket.nameOfSeat}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="ticketCountLine">
                <span className="ticketCount">{count}</span>
                </div>
                <div className="ticketPrice">
                  <span>{parseInt(totalPriceByType[ticketType]).toLocaleString()} VND</span>
                </div>
              </div>
            );
          })
        ) : (
          <span className="picketTicket">Vui lòng chọn vé</span>
        )}
        <div className="total-price">
          <span>Tổng cộng</span>
          <span>{totalPrice.toLocaleString()} VND</span>
        </div>
        <div className="nextBtn">
          <button onClick={next}>
            Tiếp tục
            </button>
        </div>
      </div>
    </div>
  );
};

export default SelectTicket;

