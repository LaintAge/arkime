import React from 'react';
import NetworkAttacksChart from './NetworkAttacksChart';

const Dashboard = ({ encryptedData }) => {
  return (
    <div>
      <NetworkAttacksChart encryptedData={encryptedData} />
    </div>
  );
};

export default Dashboard;
