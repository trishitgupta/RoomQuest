import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { useNavigate } from 'react-router-dom';

const Sucess = () => {
  const navigate=useNavigate();

  

  const handleClick=()=>{
    navigate("/");
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <div className="success-icon">
        <FontAwesomeIcon icon={faCheckCircle} size="4x" color="green" />
      </div>
      <h2>Payment Successful!</h2>
      <p>Thank you for your payment.</p>
    <h2 onClick={handleClick} style={{cursor:'pointer'}}>click here to return to home</h2>
    </div>
    
  )
}

export default Sucess