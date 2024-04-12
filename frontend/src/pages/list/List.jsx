import "./list.css";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import { useLocation } from "react-router-dom";
import { useContext,useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import SearchItem from "../../components/searchItem/SearchItem";
import useFetch from "../../hooks/useFetch.js"
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
const List = () => {
  const location = useLocation();
  const [destination, setDestination] = useState(location?.state?.destination  );
  const [dates, setDates] = useState(location?.state?.dates);
  const [openDate, setOpenDate] = useState(false);
  const [options, setOptions] = useState(location?.state?.options);
  const [min, setMin] = useState(undefined);
  const [max, setMax] = useState(undefined);
  const [type,setType]=useState(location?.state?.type)

  console.log("from LIST",type);

//const{data,loading,error,refetch}=useFetch(`/hotels?city=${destination}&min=${min|| 0}&max=${max|| 999999}`)


const destinationQueryParam = destination ? `&city=${destination}` : '';
const typeQueryParam = type ? `&type=${type}` : '';
const minQueryParam = min ? `&min=${min}` : '';
const maxQueryParam = max ? `&max=${max}` : '';

// console.log(typeQueryParam);
// console.log(destinationQueryParam);
// console.log(minQueryParam);
// console.log(maxQueryParam);



const queryString = `?${destinationQueryParam}${typeQueryParam}${minQueryParam}${maxQueryParam}`;
console.log(queryString)

const { data, loading, error, refetch } = useFetch(`/hotels${queryString}`);

const navigate = useNavigate();
const {dispatch}=useContext(SearchContext);




const handleClick=()=>{
  dispatch({type:"NEW_SEARCH",payload:{destination,dates,options}});
    navigate("/hotels", { state: { destination, dates, options } });
 
  //refetch();
}

console.log(destination);
console.log(dates);
console.log(options);

  return (
    <div>
      <Navbar />
      <Header type="list" />
      <div className="listContainer">
        <div className="listWrapper">
          <div className="listSearch">
            <h1 className="lsTitle">Search</h1>
            <div className="lsItem">
              <label>Destination</label>
              <input placeholder={destination} type="text" 
              className="headerSearchInput"
              onChange={(e) => setDestination(e.target.value)} />
            </div>
            <div className="lsItem">
              <label>Check-in Date</label>
              <span onClick={() => setOpenDate(!openDate)}>{`${format(
                dates[0].startDate,
                "MM/dd/yyyy"
              )} to ${format(dates[0].endDate, "MM/dd/yyyy")}`}</span>
              {openDate && (
                <DateRange
                  onChange={(item) => setDates([item.selection])}
                  minDate={new Date()}
                  ranges={dates}
                />
              )}
            </div>
            <div className="lsItem">
              <label>Options</label>
              <div className="lsOptions">
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Min price <small>per night</small>
                  </span>
                  <input type="number"  onChange={(e) => setMin(e.target.value)} className="lsOptionInput" />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">
                    Max price <small>per night</small>
                  </span>
                  <input type="number"  onChange={(e) => setMax(e.target.value)} className="lsOptionInput" />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Adult</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    value={options.adult}
                    onChange={(e) => {
                      setOptions({...options, adult: parseInt(e.target.value)})
                    }}
                    
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Children</span>
                  <input
                    type="number"
                    min={0}
                    className="lsOptionInput"
                    value={options.children}
                    onChange={(e) => {
                      setOptions({...options, children: parseInt(e.target.value)})
                    }}
                    
                   
                  />
                </div>
                <div className="lsOptionItem">
                  <span className="lsOptionText">Room</span>
                  <input
                    type="number"
                    min={1}
                    className="lsOptionInput"
                    value={options.room}
                    onChange={(e) => {
                      setOptions({...options, room: parseInt(e.target.value)})
                    }}
                    
                  />
                </div>
              </div>
            </div>
            <button onClick={handleClick}>Search</button>
          </div>
          <div className="listResult">
           

           {loading ? "loading": <>
           {data.map(item=>(

           <SearchItem item={item} key={item.id}/>
           ))}
           </>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
