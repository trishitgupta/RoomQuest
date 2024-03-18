import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import StoreIcon from '@mui/icons-material/Store';
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PeopleAltSharpIcon from '@mui/icons-material/PeopleAltSharp';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { Link } from 'react-router-dom';

const Widget = ({ type }) => {
  let data;

  //temporary
  const amount = 600;
  const diff = 50;

  switch (type) {
    case "user":
      data = {
        title: "USERS",
        isMoney: false,
        logo:<PeopleAltSharpIcon/>,
        link: (
          <Link to="/users" style={{ textDecoration: 'none', color: 'inherit',fontWeight:'600' }}>
            See all users
          </Link>
        ),
        icon: (
          <PersonOutlinedIcon
            className="icon"
            style={{
              color: "crimson",
              backgroundColor: "rgba(255, 0, 0, 0.2)",
            }}
          />
        ),
      };
      break;
    case "hotel":
      data = {
        title: "HOTELS",
        isMoney: false,
        logo:<StoreIcon/>,
        link: (
          <Link to="/users" style={{ textDecoration: 'none', color: 'inherit' ,fontWeight:'600'}}>
            See all Hotels
          </Link>
        ),
        icon: (
          <StoreIcon
            className="icon"
            style={{
              backgroundColor: "rgba(218, 165, 32, 0.2)",
              color: "blue",
            }}
          />
        ),
      };
      break;
    case "room":
      data = {
        title: "ROOMS",
        isMoney: true,
        logo:<ApartmentIcon/>,
        link: (
          <Link to="/rooms" style={{ textDecoration: 'none', color: 'inherit', fontWeight:'600' }}>
            See all Rooms
          </Link>
        ),
        icon: (
          <ApartmentIcon
            className="icon"
            style={{ backgroundColor: "rgba(0, 128, 0, 0.2)", color: "green" }}
          />
        ),
      };
      break;
    
    default:
      break;
  }

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="logo"style={{ fontSize: '1rem' }} >
          {data.logo}
         
        </span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
        <div className="percentage positive">
         
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
