import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatMoney, initials, avatarColor } from '../utils';

const RecoveryManCard = ({ recoveryMan }) => {
  const navigate = useNavigate();
  const { name, area, balance, updatedAt } = recoveryMan;
  const isGet = balance.status === 'youWillGet';
  const isSettled = balance.status === 'settled';

  return (
    <button
      className="rm-card"
      onClick={() => navigate(`/recovery-man/${recoveryMan._id}`)}
    >
      <span className="rm-avatar" style={{ background: avatarColor(name) }}>
        {initials(name)}
      </span>
      <span className="rm-info">
        <span className="rm-name">{name}</span>
        <span className="rm-meta">
          {area ? area : 'No area set'} · {new Date(updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </span>
      </span>
      <span className="rm-balance">
        {isSettled ? (
          <span className="rm-settled">Settled</span>
        ) : (
          <>
            <span className={`rm-amount mono ${isGet ? 'text-income' : 'text-expense'}`}>
              {formatMoney(Math.abs(balance.netBalance))}
            </span>
            <span className="rm-label">{isGet ? 'Income' : 'Expense'}</span>
          </>
        )}
      </span>
    </button>
  );
};

export default RecoveryManCard;
