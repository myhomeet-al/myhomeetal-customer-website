export const rexPay = async({orderId, amount, email}) => {
  try {
    const res = await fetch(`/api/v1/payment/rexpay/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, amount, email, }),
    });
    const result = await res.json();
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
}