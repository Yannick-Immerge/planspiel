"use client";

import React, { useState,FormEvent } from 'react';
import {createSession} from "@/app/api/game_controller_interface";

export default function FormComponent() {
  const [productKey, setProductKey] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await createSession(productKey, adminPassword); // TODO: Plain Text password
    if (response.ok) {
        setMessage(`Successfully created Session ${response.data?.sessionId}. Your username is ${response.data?.administratorUsername}. REMEMBER!!`);
    } else {
        setMessage(`Error: ${response.statusText}`);
    }

  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="product_key">Product Key:</label>
          <input
            type="text"
            id="product_key"
            value={productKey}
            onChange={(e) => setProductKey(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="administrator_password">Set your password:</label>
          <input
            type="password"
            id="administrator_password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}