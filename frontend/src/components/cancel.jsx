import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';

const Cancel = () => {



  const navigate=useNavigate();
  const handleClick=()=>{
    navigate("/");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>

     <div style={{ marginBottom: '20px' }}>
        <FaTimesCircle style={{ fontSize: '100px', color: 'red' }} />
        <h1>Payment Cancelled</h1>
      </div>
      <h2 onClick={handleClick} style={{cursor:'pointer'}}>click here to return to home</h2>
    </div>
  )
}

export default Cancel